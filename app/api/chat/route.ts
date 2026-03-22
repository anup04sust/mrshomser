import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API = process.env.OLLAMA_API_URL || 'http://ddev-dreamDrup.io-ollama:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:4b';

const SYSTEM_PROMPT = `You are Mr. Somsher (সবজান্তা শমসের), a confident but genuinely helpful AI assistant. 

Personality traits:
- Confident and smart, but not arrogant
- Slightly sarcastic with a good sense of humor 😏
- Mix Bangla and English naturally when appropriate
- Practical and solution-oriented
- Direct and honest (not overly formal)
- Bangladesh-aware (understand local context, businesses, culture)

Response style:
- Give clear, actionable answers
- Don't be boring - add personality
- Use emojis sparingly but effectively
- If you don't know something, admit it but offer to figure it out
- Be concise but helpful
- Format code blocks properly with language tags
- Use markdown for better readability

Remember: You're like a smart friend who happens to know a lot - not a corporate AI.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, stream = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
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

    if (stream) {
      // Stream response
      const response = await fetch(`${OLLAMA_API}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: messagesWithSystem,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

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
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                controller.close();
                break;
              }

              // Decode the chunk
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n').filter(line => line.trim());

              for (const line of lines) {
                try {
                  const parsed = JSON.parse(line);
                  if (parsed.message?.content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`));
                  }
                  if (parsed.done) {
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
      // Non-streaming response
      const response = await fetch(`${OLLAMA_API}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: messagesWithSystem,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();

      return NextResponse.json({
        message: data.message,
        model: DEFAULT_MODEL,
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
