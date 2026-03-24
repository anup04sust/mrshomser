// Session and authentication helpers
// Manages both authenticated users and guest sessions

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'mrshomser_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface AuthenticatedActor {
  type: 'user';
  userId: string;
  email: string;
  name: string;
  sessionId?: never;
  isGuest: false;
}

export interface GuestActor {
  type: 'guest';
  userId?: never;
  email?: never;
  name?: never;
  sessionId: string;
  isGuest: true;
}

export type Actor = AuthenticatedActor | GuestActor;

/**
 * Get the current actor (authenticated user or guest session)
 * Primary source of truth for data ownership
 */
export async function getCurrentActor(request: NextRequest): Promise<Actor> {
  // Check for authenticated user first
  const authToken = request.cookies.get('auth_token')?.value;
  
  if (authToken) {
    try {
      const decoded = jwt.verify(authToken, config.jwt.secret) as {
        userId: string;
        email: string;
        name: string;
      };
      
      return {
        type: 'user',
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        isGuest: false,
      };
    } catch (error) {
      // Token invalid or expired, fall through to guest session
      console.warn('Invalid auth token, treating as guest');
    }
  }
  
  // Fall back to guest session
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  if (sessionCookie) {
    return {
      type: 'guest',
      sessionId: sessionCookie,
      isGuest: true,
    };
  }
  
  // No session exists, create a new one
  // Note: The response cookie must be set by the calling route
  const newSessionId = `guest_${uuidv4()}`;
  return {
    type: 'guest',
    sessionId: newSessionId,
    isGuest: true,
  };
}

/**
 * Get the owner identifier for database queries
 * Returns either userId (for authenticated) or sessionId (for guests)
 */
export function getOwnerQuery(actor: Actor): { userId: string } | { sessionId: string } {
  if (actor.type === 'user') {
    return { userId: actor.userId };
  }
  return { sessionId: actor.sessionId };
}

/**
 * Set session cookie in response if needed (for new guest sessions)
 */
export function getSessionCookieHeader(actor: Actor): string | null {
  if (actor.type === 'guest') {
    return `${SESSION_COOKIE_NAME}=${actor.sessionId}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; SameSite=Lax${
      config.app.isProduction ? '; Secure' : ''
    }`;
  }
  return null;
}

/**
 * Migrate guest chats to authenticated user
 * Call this after successful login/registration
 */
export async function migrateGuestChatsToUser(
  guestSessionId: string,
  userId: string
): Promise<number> {
  const { chatRepository } = await import('./repositories');
  return await chatRepository.migrateOwnership(guestSessionId, userId);
}

// Legacy compatibility functions (will be deprecated)
export async function getOrCreateSession(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = `guest_${uuidv4()}`;
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
  }

  return sessionId;
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
