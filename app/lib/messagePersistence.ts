/**
 * Message Persistence Utilities
 * 
 * Handles saving and updating messages during streaming to prevent data loss.
 * Implements debounced updates to avoid overwhelming the database.
 */

import type { Message, MessageStatus } from './schemas';
import { logger } from './logger';
import { chatRepository } from './repositories';

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
    const updates: Partial<Message> = {
      content: update.content,
      status: update.status,
    };
    
    if (update.error) {
      updates.error = update.error;
    }
    
    await chatRepository.updateMessage(update.chatId, update.messageId, updates);
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
    await chatRepository.addMessage(chatId, message);
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
    return await chatRepository.getIncompleteMessages(chatId);
  } catch (error) {
    logger.error('Failed to get incomplete messages', { chatId, error });
    return [];
  }
}
