import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/app/lib/config';
import { migrateGuestChatsToUser } from '@/app/lib/session';
import { loginRequestSchema } from '@/app/lib/schemas';
import { createRouteLogger } from '@/app/lib/logger';
import { userRepository } from '@/app/lib/repositories';

export async function POST(req: NextRequest) {
  const log = createRouteLogger(req);
  
  try {
    // Validate request body
    const body = await req.json();
    const validationResult = loginRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;

    // Find user
    const user = await userRepository.findByEmail(email);
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
      { expiresIn: '30d' }
    );

    // Migrate guest chats to this user if a guest session exists
    const guestSession = req.cookies.get('mrshomser_session')?.value;
    let migratedCount = 0;
    if (guestSession) {
      try {
        migratedCount = await migrateGuestChatsToUser(guestSession, user._id.toString());
      } catch (migrationError) {
        log.warn('Failed to migrate guest chats', { sessionId: guestSession, userId: user._id.toString(), error: migrationError });
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
    log.error('Login error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
