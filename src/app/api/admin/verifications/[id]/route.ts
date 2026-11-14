import { NextRequest, NextResponse } from 'next/server';
import { verificationRepository } from '@/server/repositories/verification.repository';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
