import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb';
import { getCurrentActor, getOwnerQuery } from '@/app/lib/session';
import { Chat } from '@/app/types/chat';
import { updateChatRequestSchema } from '@/app/lib/schemas';
import { createRouteLogger } from '@/app/lib/logger';

// GET /api/chats/[id] - Get a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const log = createRouteLogger(req);
  
  try {
    const { id } = await params;
    const actor = await getCurrentActor(req);
    const ownerQuery = getOwnerQuery(actor);
    
    const db = await getDatabase();
    const chat = await db.collection<Chat>('chats').findOne({
      id,
      ...ownerQuery,
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chat });
  } catch (error) {
    log.error('Error fetching chat', error instanceof Error ? error : new Error(String(error)));
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
  const log = createRouteLogger(req);
  
  try {
    const { id } = await params;
    const actor = await getCurrentActor(req);
    const ownerQuery = getOwnerQuery(actor);
    
    // Validate request body
    const body = await req.json();
    const validationResult = updateChatRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }
    
    const updates = validationResult.data;
    
    const db = await getDatabase();
    const result = await db.collection('chats').updateOne(
      { id, ...ownerQuery },
      {
        $set: {
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

    const chat = await db.collection<Chat>('chats').findOne({ id, ...ownerQuery });

    return NextResponse.json({ chat });
  } catch (error) {
    log.error('Error updating chat', error instanceof Error ? error : new Error(String(error)));
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
  const log = createRouteLogger(req);
  
  try {
    const { id } = await params;
    const actor = await getCurrentActor(req);
    const ownerQuery = getOwnerQuery(actor);
    
    const db = await getDatabase();
    const result = await db.collection('chats').deleteOne({
      id,
      ...ownerQuery,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error deleting chat', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}
