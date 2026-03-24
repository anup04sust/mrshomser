/**
 * Message Persistence Utilities
 * 
 * Handles saving and updating messages during streaming to prevent data loss.
 * Implements debounced updates to avoid overwhelming the database.
 */

import { getDatabase } from './mongodb';
import type { Message, MessageStatus } from './schemas';
import { logger } from './logger';

interface MessageUpdate {
  chatId: string;
  messageId: string;
  content: string;
  status: MessageStatus;
  error?: string;
}

/**
 * Update a message in the database
 * Used during streaming to save partial content
 */
export async function updateMessage(update: MessageUpdate): Promise<void> {
  try {
    const db = await getDatabase();
    
    const updateDoc: Record<string, any> = {
      'messages.$.content': update.content,
      'messages.$.status': update.status,
      updatedAt: Date.now(),
    };
    
    if (update.error) {
      updateDoc['messages.$.error'] = update.error;
    }
    
    await db.collection('chats').updateOne(
      { 
        id: update.chatId,
        'messages.id': update.messageId,
      },
      { $set: updateDoc as any }
    );
  } catch (error) {
    logger.error('Failed to update message', { chatId: update.chatId, messageId: update.messageId, error });
    // Don't throw - streaming should continue even if persistence fails
  }
}

/**
 * Add a new message to a chat
 * Used to create the initial 'streaming' message before content arrives
 */
export async function addMessage(chatId: string, message: Message): Promise<void> {
  try {
    const db = await getDatabase();
    
    await db.collection('chats').updateOne(
      { id: chatId },
      { 
        $push: { messages: message as any },
        $set: { updatedAt: Date.now() }
      }
    );
  } catch (error) {
    logger.error('Failed to add message', { chatId, messageId: message.id, error });
    throw error; // This should fail the request
  }
}

/**
 * Debounced message updater
 * Accumulates updates and flushes them periodically to reduce DB load
 */
export class DebouncedMessageUpdater {
  private pendingUpdate: MessageUpdate | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly debounceMs: number;
  
  constructor(debounceMs: number = 500) {
    this.debounceMs = debounceMs;
  }
  
  /**
   * Queue an update (will be debounced)
   */
  update(update: MessageUpdate): void {
    this.pendingUpdate = update;
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.flush();
    }, this.debounceMs);
  }
  
  /**
   * Force flush the pending update immediately
   */
  async flush(): Promise<void> {
    if (this.pendingUpdate) {
      await updateMessage(this.pendingUpdate);
      this.pendingUpdate = null;
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  
  /**
   * Cancel any pending updates
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.pendingUpdate = null;
  }
}

/**
 * Mark a message as failed
 */
export async function markMessageFailed(
  chatId: string,
  messageId: string,
  error: string
): Promise<void> {
  await updateMessage({
    chatId,
    messageId,
    content: '', // Keep existing content
    status: 'failed',
    error,
  });
}

/**
 * Get incomplete messages (streaming or pending) for a chat
 * Useful for recovery scenarios
 */
export async function getIncompleteMessages(chatId: string): Promise<Message[]> {
  try {
    const db = await getDatabase();
    
    const chat = await db.collection('chats').findOne(
      { id: chatId },
      { projection: { messages: 1 } }
    );
    
    if (!chat || !chat.messages) {
      return [];
    }
    
    return chat.messages.filter((msg: Message) => 
      msg.status === 'streaming' || msg.status === 'pending'
    );
  } catch (error) {
    logger.error('Failed to get incomplete messages', { chatId, error });
    return [];
  }
}
