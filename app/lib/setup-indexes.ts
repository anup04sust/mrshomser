// MongoDB indexes and schema setup
// Run this once to create indexes for optimal performance

import { getDatabase } from './mongodb';

export async function createIndexes() {
  try {
    const db = await getDatabase();
    console.log('📊 Creating MongoDB indexes...');

    // Users collection indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ createdAt: -1 });
    console.log('✅ Users indexes created');

    // Chats collection indexes
    const chatsCollection = db.collection('chats');
    await chatsCollection.createIndex({ sessionId: 1 });
    await chatsCollection.createIndex({ userId: 1 });
    await chatsCollection.createIndex({ updatedAt: -1 });
    await chatsCollection.createIndex({ sessionId: 1, updatedAt: -1 });
    await chatsCollection.createIndex({ userId: 1, updatedAt: -1 });
    console.log('✅ Chats indexes created');

    console.log('✅ All indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createIndexes()
    .then(() => {
      console.log('🎉 Index creation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Index creation failed:', error);
      process.exit(1);
    });
}
