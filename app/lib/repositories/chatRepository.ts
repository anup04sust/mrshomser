/**
 * Chat Repository
 * 
 * Handles all database operations related to chats.
 * Separates data access logic from route handlers.
 */

import { getDatabase } from '../mongodb';
import type { Chat, Message } from '../schemas';
import type { Db } from 'mongodb';

export interface ChatFilters {
  userId?: string;
  sessionId?: string;
  id?: string;
}

export interface CreateChatData {
  id: string;
  title: string;
  messages: Message[];
  userId?: string;
  sessionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UpdateChatData {
  title?: string;
  messages?: Message[];
  updatedAt: number;
}

export class ChatRepository {
  private db: Db | null = null;
  
  private async getDb(): Promise<Db> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }
  
  /**
   * Find all chats matching filters, sorted by updatedAt descending
   */
  async findAll(filters: ChatFilters): Promise<Chat[]> {
    const db = await this.getDb();
    const query: Record<string, string> = {};
    
    if (filters.userId) {
      query.userId = filters.userId;
    } else if (filters.sessionId) {
      query.sessionId = filters.sessionId;
    }
    
    return db
      .collection<Chat>('chats')
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();
  }
  
  /**
   * Find a single chat by ID and ownership
   */
  async findById(id: string, filters: ChatFilters): Promise<Chat | null> {
    const db = await this.getDb();
    const query: Record<string, string> = { id };
    
    if (filters.userId) {
      query.userId = filters.userId;
    } else if (filters.sessionId) {
      query.sessionId = filters.sessionId;
    }
    
    return db.collection<Chat>('chats').findOne(query);
  }
  
  /**
   * Create a new chat
   */
  async create(data: CreateChatData): Promise<Chat> {
    const db = await this.getDb();
    const chat = { ...data };
    
    await db.collection('chats').insertOne(chat);
    
    return chat as Chat;
  }
  
  /**
   * Update a chat by ID with ownership check
   */
  async update(id: string, data: UpdateChatData, filters: ChatFilters): Promise<Chat | null> {
    const db = await this.getDb();
    const query: Record<string, string> = { id };
    
    if (filters.userId) {
      query.userId = filters.userId;
    } else if (filters.sessionId) {
      query.sessionId = filters.sessionId;
    }
    
    const result = await db.collection('chats').updateOne(
      query,
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return null;
    }
    
    return this.findById(id, filters);
  }
  
  /**
   * Delete a chat by ID with ownership check
   */
  async deleteById(id: string, filters: ChatFilters): Promise<boolean> {
    const db = await this.getDb();
    const query: Record<string, string> = { id };
    
    if (filters.userId) {
      query.userId = filters.userId;
    } else if (filters.sessionId) {
      query.sessionId = filters.sessionId;
    }
    
    const result = await db.collection('chats').deleteOne(query);
    
    return result.deletedCount > 0;
  }
  
  /**
   * Delete all chats matching filters
   */
  async deleteAll(filters: ChatFilters): Promise<number> {
    const db = await this.getDb();
    const query: Record<string, string> = {};
    
    if (filters.userId) {
      query.userId = filters.userId;
    } else if (filters.sessionId) {
      query.sessionId = filters.sessionId;
    }
    
    const result = await db.collection('chats').deleteMany(query);
    
    return result.deletedCount;
  }
  
  /**
   * Add a message to a chat
   */
  async addMessage(chatId: string, message: Message): Promise<void> {
    const db = await this.getDb();
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - MongoDB types don't handle nested document arrays well
    await db.collection('chats').updateOne(
      { id: chatId },
      {
        $push: { messages: message },
        $set: { updatedAt: Date.now() }
      }
    );
  }
  
  /**
   * Update a specific message in a chat
   */
  async updateMessage(
    chatId: string,
    messageId: string,
    updates: Partial<Message>
  ): Promise<void> {
    const db = await this.getDb();
    
    const setFields: Record<string, unknown> = {
      updatedAt: Date.now(),
    };
    
    Object.keys(updates).forEach(key => {
      setFields[`messages.$.${key}`] = updates[key as keyof Message];
    });
    
    await db.collection('chats').updateOne(
      {
        id: chatId,
        'messages.id': messageId,
      },
      { $set: setFields }
    );
  }
  
  /**
   * Get incomplete messages (streaming or pending) for a chat
   */
  async getIncompleteMessages(chatId: string): Promise<Message[]> {
    const db = await this.getDb();
    
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
  }
  
  /**
   * Migrate chats from session to user
   */
  async migrateOwnership(sessionId: string, userId: string): Promise<number> {
    const db = await this.getDb();
    
    const result = await db.collection('chats').updateMany(
      { sessionId },
      {
        $set: { userId },
        $unset: { sessionId: '' }
      }
    );
    
    return result.modifiedCount;
  }
}

// Export singleton instance
export const chatRepository = new ChatRepository();
