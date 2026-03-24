import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb';
import { getCurrentActor, getOwnerQuery, getSessionCookieHeader } from '@/app/lib/session';
import { Chat } from '@/app/types/chat';

// GET /api/chats - List all chats for current user/session
export async function GET(req: NextRequest) {
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
    console.error('Error fetching chats:', error);
    returnactor = await getCurrentActor(req);
    const { title = 'New Chat', messages = [] } = await req.json();
    
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
    
    return responseandom().toString(36).substr(2, 9)}`,
      sessionId,
      title,
      messages,
      createdAt: now,
      updatedAt: now,user/session
export async function DELETE(req: NextRequest) {
  try {
    const actor = await getCurrentActor(req);
    const ownerQuery = getOwnerQuery(actor);
    
    const db = await getDatabase();
    await db.collection('chats').deleteMany(ownerQuery
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chats - Delete all chats for current session
export async function DELETE(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSession();
    const db = await getDatabase();
    
    await db.collection('chats').deleteMany({ sessionId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chats:', error);
    return NextResponse.json(
      { error: 'Failed to delete chats' },
      { status: 500 }
    );
  }
}
