import { NextRequest, NextResponse } from 'next/server';
import { usersRepository } from '@/server/repositories/users.repository';
import { verificationRepository } from '@/server/repositories/verification.repository';
import { createSessionToken } from '@/server/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      cityId,
      cityName,
      mohallaName,
      itsNumber,
      itsCardProofUrl,
      livePhotoUrl,
    } = await request.json();

    if (!fullName || !email || !password || !phone) {
      return NextResponse.json(
        { success: false, message: 'Please provide full name, email, phone and password.' },
        { status: 400 }
      );
    }

    if (!itsNumber || !/^\d{8}$/.test(itsNumber.trim())) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 8-digit ITS ID.' },
        { status: 400 }
      );
    }

    if (!itsCardProofUrl) {
      return NextResponse.json(
        { success: false, message: 'Please upload a clear photo of your ITS card.' },
        { status: 400 }
      );
    }

    if (!livePhotoUrl) {
      return NextResponse.json(
        { success: false, message: 'Please capture a live photo for identity verification.' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = await usersRepository.findByEmailOrPhone(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email or phone already exists.' },
        { status: 409 }
      );
    }

    const newUser = await usersRepository.create({
      fullName,
      email,
      phone,
      password,
      cityId: cityId || 'mumbai',
      cityName: cityName || 'Mumbai',
      mohallaName: mohallaName || 'Mazgaon (Hasanabad / Saifee Park)',
      itsNumber: itsNumber.trim(),
      itsCardProofUrl,
      livePhotoUrl,
    });

    // Automatically create pending verification request for Jamaat Admin Desk
    await verificationRepository.create({
      userId: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      itsNumber: newUser.itsNumber || itsNumber.trim(),
      jamaatCity: newUser.cityName,
      mohalla: newUser.mohallaName,
      idCardImageUrl: itsCardProofUrl,
      livePhotoUrl,
      ocrExtractedIts: itsNumber.trim(),
      ocrExtractedName: fullName.trim(),
      ocrConfidence: 99,
      ocrMatches: true,
      adminNotes: 'Submitted during registration. Awaiting Jamaat Admin Desk review.',
    });

    const token = createSessionToken(newUser);

    const response = NextResponse.json({
      success: true,
      message: 'Registration submitted for Jamaat Admin verification.',
      user: newUser,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('alsouq_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
}
