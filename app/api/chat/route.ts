import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/app/lib/config';

// Configure route for streaming
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

const SYSTEM_PROMPT = `You are Mr. Shomser, a helpful AI assistant.

Traits: Confident, practical, clear communicator.

Style: Clear, concise answers with personality. Use emojis sparingly. Format code properly.`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('[Chat API] Request received at', new Date().toISOString());
  console.log('[Chat API] Ollama URL:', config.ollama.apiUrl, 'Model:', config.ollama.model);
  
  try {
    const { messages, stream = true } = await req.json();
    console.log('[Chat API] Parsed request body, stream:', stream, 'messages:', messages.length);

    if (!messages || !Array.isArray(messages)) {
      console.log('[Chat API] Invalid messages format');
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Add system prompt to the beginning
    const messagesWithSystem = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    console.log('[Chat API] Calling Ollama...');
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[Chat API] Request timeout - aborting');
      controller.abort();
    }, 120000); // 2 minute timeout

    try {
      if (stream) {
        console.log('[Chat API] Starting streaming request to Ollama');
        // Stream response with optimized settings for CPU
        const response = await fetch(`${config.ollama.apiUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.ollama.model,
            messages: messagesWithSystem,
            stream: true,
            options: {
              num_ctx: 2048, // Reduce context window for faster processing
              num_predict: 512, // Limit response length
              temperature: 0.7,
              top_p: 0.9,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log('[Chat API] Ollama responded with status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Chat API] Ollama API error:', response.status, errorText);
          throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`);
        }

        console.log('[Chat API] Setting up streaming response');

      // Create a TransformStream to process the streaming response
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            let isTruncated = false;
            
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                // Send truncation warning if response was cut off
                if (isTruncated) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    truncated: true,
                    message: '\n\n_[Response truncated due to length limit]_'
                  })}\n\n`));
                }
                controller.close();
                break;
              }

              // Decode the chunk
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n').filter(line => line.trim());

              for (const line of lines) {
                try {
                  const parsed = JSON.parse(line);
                  
                  // Send content chunks
                  if (parsed.message?.content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`));
                  }
                  
                  // Check if response was truncated
                  if (parsed.done) {
                    // done_reason can be: "stop" (natural end), "length" (token limit), or other
                    if (parsed.done_reason === 'length') {
                      isTruncated = true;
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                }
              }
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
      } else {
        // Non-streaming response with optimized settings
        const response = await fetch(`${config.ollama.apiUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.ollama.model,
            messages: messagesWithSystem,
            stream: false,
            options: {
              num_ctx: 2048,
              num_predict: 512,
              temperature: 0.7,
              top_p: 0.9,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Ollama API error:', response.status, errorText);
          throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        return NextResponse.json({
          message: data.message,
          model: config.ollama.model,
        });
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout:', fetchError);
        return NextResponse.json(
          { error: 'Request timeout. The AI model is taking too long to respond. Please try again.' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isConnectionError = errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED');
    
    return NextResponse.json(
      { 
        error: isConnectionError 
          ? 'Unable to connect to AI service. Please ensure Ollama is running.' 
          : errorMessage 
      },
      { status: 500 }
    );
  }
}
