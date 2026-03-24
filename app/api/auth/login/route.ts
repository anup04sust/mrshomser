import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/app/lib/config';
import { migrateGuestChatsToUser } from '@/app/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      config.jwt.secret,
      { expiresIn: '30d' as string }
    );

    // Migrate guest chats to this user if a guest session exists
    const guestSession = req.cookies.get('mrshomser_session')?.value;
    let migratedCount = 0;
    if (guestSession) {
      try {
        migratedCount = await migrateGuestChatsToUser(db, guestSession, user._id.toString());
      } catch (migrationError) {
        console.warn('Failed to migrate guest chats:', migrationError);
        // Don't fail login if migration fails
      }
    }

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
