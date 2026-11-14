import { NextRequest, NextResponse } from 'next/server';
import { verificationRepository } from '@/server/repositories/verification.repository';

export async function GET() {
  try {
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
