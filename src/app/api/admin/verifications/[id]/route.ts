import { NextRequest, NextResponse } from 'next/server';
import { verificationRepository } from '@/server/repositories/verification.repository';
import { verifySessionToken } from '@/server/auth/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const { status, notes } = await request.json();

    if (status !== 'VERIFIED' && status !== 'REJECTED') {
      return NextResponse.json(
        { success: false, message: 'Status must be VERIFIED or REJECTED' },
        { status: 400 }
      );
    }

    const updated = await verificationRepository.updateStatus(params.id, status, notes);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Verification request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, verification: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update verification status' },
      { status: 500 }
    );
  }
}
