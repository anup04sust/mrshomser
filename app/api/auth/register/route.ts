import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/app/lib/config';
import { migrateGuestChatsToUser } from '@/app/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email: newUser.email, name: newUser.name },
      config.jwt.secret,
      { expiresIn: '30d' as string }
    );

    // Migrate guest chats to this new user if a guest session exists
    const guestSession = req.cookies.get('mrshomser_session')?.value;
    let migratedCount = 0;
    if (guestSession) {
      try {
        migratedCount = await migrateGuestChatsToUser(db, guestSession, result.insertedId.toString());
      } catch (migrationError) {
        console.warn('Failed to migrate guest chats:', migrationError);
        // Don't fail registration if migration fails
      }
    }

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
      },
      migratedChats: migratedCount,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: config.app.isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
