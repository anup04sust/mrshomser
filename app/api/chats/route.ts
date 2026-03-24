import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb';
import { getCurrentActor, getOwnerQuery, getSessionCookieHeader } from '@/app/lib/session';
import { Chat } from '@/app/types/chat';
import { createChatRequestSchema } from '@/app/lib/schemas';
import { createRouteLogger } from '@/app/lib/logger';

// GET /api/chats - List all chats for current user/session
export async function GET(req: NextRequest) {
  const log = createRouteLogger(req);
  
  try {
    const actor = await getCurrentActor(req);
    const ownerQuery = getOwnerQuery(actor);
    
    const db = await getDatabase();
    const chats = await db
      .collection<Chat>('chats')
      .find(ownerQuery)
      .sort({ updatedAt: -1 })
      .toArray();

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
    const messages: any[] = [];
    
    const db = await getDatabase();
    const now = Date.now();
    
    // Create chat with either userId or sessionId depending on actor type
    const chat: any = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      messages,
      createdAt: now,
      updatedAt: now,
    };
    
    // Add owner field (userId for authenticated, sessionId for guest)
    if (actor.type === 'user') {
      chat.userId = actor.userId;
    } else {
      chat.sessionId = actor.sessionId;
    }

    await db.collection('chats').insertOne(chat);

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
    await db.collection('chats').deleteMany(ownerQuery);

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error deleting chats', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to delete chats' },
      { status: 500 }
    );
  }
}
