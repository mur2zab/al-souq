import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/server/auth/auth';
import { usersRepository } from '@/server/repositories/users.repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('alsouq_session')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const token = cookieToken || headerToken;
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await usersRepository.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
