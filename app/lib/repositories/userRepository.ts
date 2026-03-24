/**
 * User Repository
 * 
 * Handles all database operations related to users.
 * Separates data access logic from route handlers.
 */

import { getDatabase } from '../mongodb';
import type { Db, ObjectId } from 'mongodb';

export interface UserData {
  email: string;
  name: string;
  password: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  password: string;
  createdAt: number;
  updatedAt: number;
}

export class UserRepository {
  private db: Db | null = null;
  
  private async getDb(): Promise<Db> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }
  
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const db = await this.getDb();
    return db.collection<User>('users').findOne({ email: email.toLowerCase() });
  }
  
  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    const db = await this.getDb();
    const { ObjectId } = await import('mongodb');
    
    try {
      return await db.collection('users').findOne({ _id: new ObjectId(id) }) as User | null;
    } catch {
      // Invalid ObjectId format
      return null;
    }
  }
  
  /**
   * Check if a user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const db = await this.getDb();
    const count = await db.collection('users').countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
  
  /**
   * Create a new user
   */
  async create(data: UserData): Promise<User> {
    const db = await this.getDb();
    const userData = {
      ...data,
      email: data.email.toLowerCase(),
    };
    
    const result = await db.collection('users').insertOne(userData);
    
    return {
      _id: result.insertedId,
      ...userData,
    };
  }
  
  /**
   * Update a user by ID
   */
  async update(id: string, updates: Partial<UserData>): Promise<User | null> {
    const db = await this.getDb();
    const { ObjectId } = await import('mongodb');
    
    const updateData = {
      ...updates,
      updatedAt: Date.now(),
    };
    
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result as User | null;
  }
  
  /**
   * Delete a user by ID
   */
  async deleteById(id: string): Promise<boolean> {
    const db = await this.getDb();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    
    return result.deletedCount > 0;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
