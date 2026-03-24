import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config } from '@/app/lib/config';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      email: string;
      name: string;
    };

    return NextResponse.json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      },
    });
  } catch (error) {
    // Invalid token
    return NextResponse.json({ user: null });
  }
}
