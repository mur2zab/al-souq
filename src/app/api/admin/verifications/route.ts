import { NextRequest, NextResponse } from 'next/server';
import { verificationRepository } from '@/server/repositories/verification.repository';
import { verifySessionToken } from '@/server/auth/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Strictly verify Admin role
    const token =
      request.cookies.get('alsouq_session')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    const payload = token ? verifySessionToken(token) : null;
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const all = await verificationRepository.getAll();
    const pending = await verificationRepository.getPending();
    return NextResponse.json({ success: true, count: all.length, pendingCount: pending.length, verifications: all });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin verifications' },
      { status: 500 }
    );
  }
}
