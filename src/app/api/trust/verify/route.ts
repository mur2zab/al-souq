import { NextRequest, NextResponse } from 'next/server';
import { verificationRepository } from '@/server/repositories/verification.repository';

export async function POST(request: NextRequest) {
  try {
    const { userId, fullName, email, phone, itsNumber, jamaatCity, mohalla, idCardImageUrl } =
      await request.json();

    if (!itsNumber || itsNumber.length !== 8) {
      return NextResponse.json(
        { success: false, message: 'Invalid 8-digit ITS number' },
        { status: 400 }
      );
    }

    if (!idCardImageUrl) {
      return NextResponse.json(
        { success: false, message: 'ITS card proof photo is required for admin verification' },
        { status: 400 }
      );
    }

    // Save submission to database with STRICT PENDING status (No auto-verification)
    const req = await verificationRepository.create({
      userId,
      fullName,
      email,
      phone,
      itsNumber,
      jamaatCity,
      mohalla,
      idCardImageUrl,
      ocrExtractedIts: itsNumber,
      ocrExtractedName: fullName.toUpperCase(),
      ocrConfidence: 100,
      ocrMatches: false,
      adminNotes: 'Awaiting manual review by Al-Souq Admin Desk.',
    });

    return NextResponse.json({
      success: true,
      verificationRequest: req,
      status: 'PENDING',
      message: 'ITS card proof submitted successfully. An admin will review and verify your account.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process ITS verification submission' },
      { status: 500 }
    );
  }
}
