import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/app/lib/session';
import { updateChatRequestSchema } from '@/app/lib/schemas';
import { createRouteLogger } from '@/app/lib/logger';
import { chatRepository, type ChatFilters } from '@/app/lib/repositories';

// GET /api/chats/[id] - Get a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const log = createRouteLogger(req);
  
  try {
    const { id } = await params;
    const actor = await getCurrentActor(req);
    
    const filters: ChatFilters = actor.type === 'user'
      ? { userId: actor.userId }
      : { sessionId: actor.sessionId };
    
    const chat = await chatRepository.findById(id, filters);

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
    
    const updates = {
      ...validationResult.data,
      updatedAt: Date.now(),
    };
    
    const filters: ChatFilters = actor.type === 'user'
      ? { userId: actor.userId }
      : { sessionId: actor.sessionId };
    
    const chat = await chatRepository.update(id, updates, filters);

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

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
    
    const filters: ChatFilters = actor.type === 'user'
      ? { userId: actor.userId }
      : { sessionId: actor.sessionId };
    
    const deleted = await chatRepository.deleteById(id, filters);

    if (!deleted
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
