import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb';
import { getOrCreateSession } from '@/app/lib/session';
import { Chat } from '@/app/types/chat';

// GET /api/chats - List all chats for current session
export async function GET(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSession();
    const db = await getDatabase();
    const chats = await db
      .collection<Chat>('chats')
      .find({ sessionId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST /api/chats - Create a new chat
export async function POST(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSession();
    const { title = 'New Chat', messages = [] } = await req.json();
    
    const db = await getDatabase();
    const now = Date.now();
    
    const chat: Omit<Chat, '_id'> & { sessionId: string } = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      title,
      messages,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('chats').insertOne(chat);

    return NextResponse.json({ chat });
  } catch (error) {
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
