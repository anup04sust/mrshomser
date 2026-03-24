import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/app/lib/config';
import { sendMessageRequestSchema } from '@/app/lib/schemas';
import { addMessage, DebouncedMessageUpdater } from '@/app/lib/messagePersistence';
import { randomUUID } from 'crypto';
import { createRouteLogger } from '@/app/lib/logger';

// Configure route for streaming
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

const SYSTEM_PROMPT = `You are Mr. Shomser, a helpful AI assistant.

Traits: Confident, practical, clear communicator.

Style: Clear, concise answers with personality. Use emojis sparingly. Format code properly.`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const log = createRouteLogger(req);
  
  log.info('Chat API request received', {
    ollamaUrl: config.ollama.apiUrl,
    model: config.ollama.model,
  });
  
  try {
    const body = await req.json();
    const { messages, stream = true, chatId } = body;
    log.debug('Request body parsed', { stream, messageCount: messages?.length, chatId });

    // Basic validation for messages array
    if (!messages || !Array.isArray(messages)) {
      log.warn('Invalid messages format - not an array');
      return NextResponse.json(
        { error: 'Invalid messages format - must be an array' },
        { status: 400 }
      );
    }
    
    // Validate each message has required fields
    const invalidMessage = messages.find(m => !m.role || !m.content);
    if (invalidMessage) {
      log.warn('Invalid message structure - missing role or content');
      return NextResponse.json(
        { error: 'Each message must have role and content' },
        { status: 400 }
      );
    }

    // Add system prompt to the beginning
    const messagesWithSystem = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    log.ai('Calling Ollama API', { messageCount: messagesWithSystem.length, stream });
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      log.warn('Ollama request timeout - aborting');
      controller.abort();
    }, 120000); // 2 minute timeout

    try {
      if (stream) {
        log.debug('Starting streaming request to Ollama');
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
        log.ai('Ollama responded', { status: response.status });

        if (!response.ok) {
          const errorText = await response.text();
          log.error('Ollama API error', { status: response.status, error: errorText });
          throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`);
        }

        log.debug('Setting up streaming response');

        // If chatId provided, create assistant message placeholder for persistence
        let assistantMessageId: string | null = null;
        if (chatId) {
          try {
            assistantMessageId = randomUUID();
            await addMessage(chatId, {
              id: assistantMessageId,
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
              status: 'streaming',
            });
            log.debug('Created streaming message placeholder', { 
              chatId, 
              messageId: assistantMessageId 
            });
          } catch (error) {
            log.error('Failed to create message placeholder', { chatId, error });
            // Continue without persistence if chat creation fails
            assistantMessageId = null;
          }
        }

      // Create a TransformStream to process the streaming response
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // Initialize debounced updater for message persistence
      const messageUpdater = chatId && assistantMessageId 
        ? new DebouncedMessageUpdater(500) // Update every 500ms during streaming
        : null;

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          let accumulatedContent = '';
          
          try {
            let isTruncated = false;
            
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                // Final flush of accumulated content
                if (messageUpdater && assistantMessageId) {
                  await messageUpdater.flush();
                  // Mark as complete
                  await messageUpdater.update({
                    chatId: chatId!,
                    messageId: assistantMessageId,
                    content: accumulatedContent,
                    status: 'complete',
                  });
                  await messageUpdater.flush();
                }
                
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
                    const content = parsed.message.content;
                    accumulatedContent += content;
                    
                    // Persist to database (debounced)
                    if (messageUpdater && assistantMessageId) {
                      messageUpdater.update({
                        chatId: chatId!,
                        messageId: assistantMessageId,
                        content: accumulatedContent,
                        status: 'streaming',
                      });
                    }
                    
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
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
            // Mark message as failed if persistence is enabled
            if (messageUpdater && assistantMessageId && chatId) {
              messageUpdater.cancel();
              await messageUpdater.update({
                chatId,
                messageId: assistantMessageId,
                content: accumulatedContent || '[Error: Stream interrupted]',
                status: 'failed',
                error: error instanceof Error ? error.message : 'Stream error',
              });
              await messageUpdater.flush();
            }
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
          log.error('Ollama API error (non-streaming)', { status: response.status, error: errorText });
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
        log.error('Ollama request timeout', { timeout: 120000 });
        return NextResponse.json(
          { error: 'Request timeout. The AI model is taking too long to respond. Please try again.' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    log.error('Chat API error', error instanceof Error ? error : new Error(String(error)));
    
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
