import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor, getSessionCookieHeader } from '@/app/lib/session';
import { createChatRequestSchema } from '@/app/lib/schemas';
import { createRouteLogger } from '@/app/lib/logger';
import { chatRepository, type ChatFilters } from '@/app/lib/repositories';

// GET /api/chats - List all chats for current user/session
export async function GET(req: NextRequest) {
  const log = createRouteLogger(req);
  
  try {
    const actor = await getCurrentActor(req);
    
    const filters: ChatFilters = actor.type === 'user'
      ? { userId: actor.userId }
      : { sessionId: actor.sessionId };
    
    const chats = await chatRepository.findAll(filters);

    const response = NextResponse.json({ chats });
    
    // Set session cookie for new guests
    const cookieHeader = getSessionCookieHeader(actor);
    if (cookieHeader) {
      response.headers.append('Set-Cookie', cookieHeader);
    }
    
    return response;
  } catch (error) {
    log.error('Error fetching chats', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST /api/chats - Create a new chat
export async function POST(req: NextRequest) {
  const log = createRouteLogger(req);
  
  try {
    const actor = await getCurrentActor(req);
    
    // Validate request body
    const body = await req.json();
    const validationResult = createChatRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }
    
    const { title = 'New Chat', message } = validationResult.data;
    const now = Date.now();
    
    // Create chat with either userId or sessionId depending on actor type
    const chatData: any = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    
    // Add owner field (userId for authenticated, sessionId for guest)
    if (actor.type === 'user') {
      chatData.userId = actor.userId;
    } else {
      chatData.sessionId = actor.sessionId;
    }

    const chat = await chatRepository.create(chatData);

    const response = NextResponse.json({ chat });
    
    // Set session cookie for new guests
    const cookieHeader = getSessionCookieHeader(actor);
    if (cookieHeader) {
      response.headers.append('Set-Cookie', cookieHeader);
    }
    
    return response;
  } catch (error) {
    log.error('Error creating chat', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chats - Delete all chats for current user/session
export async function DELETE(req: NextRequest) {
  const log = createRouteLogger(req);
  
  try {
    const actor = await getCurrentActor(req);
    const ownerQuery = getOwnerQuery(actor);
    
    const db = await getDatabase();
    
    const filters: ChatFilters = actor.type === 'user'
      ? { userId: actor.userId }
      : { sessionId: actor.sessionId };
    
    await chatRepository.deleteAll(filters
    log.error('Error deleting chats', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to delete chats' },
      { status: 500 }
    );
  }
}
