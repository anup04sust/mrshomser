import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb';
import { getOrCreateSession } from '@/app/lib/session';
import { Chat } from '@/app/types/chat';

// GET /api/chats/[id] - Get a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = await getOrCreateSession();
    const db = await getDatabase();
    
    const chat = await db.collection<Chat>('chats').findOne({
      id,
      sessionId,
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

// PUT /api/chats/[id] - Update a chat
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = await getOrCreateSession();
    const updates = await req.json();
    const db = await getDatabase();

    const result = await db.collection('chats').updateOne(
      { id, sessionId },
      {
        $set: {
          ...updates,
          updatedAt: Date.now(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const chat = await db.collection<Chat>('chats').findOne({ id, sessionId });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/[id] - Delete a specific chat
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = await getOrCreateSession();
    const db = await getDatabase();

    const result = await db.collection('chats').deleteOne({
      id,
      sessionId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}
