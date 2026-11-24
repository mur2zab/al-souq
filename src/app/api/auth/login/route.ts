import { NextRequest, NextResponse } from 'next/server';
import { usersRepository } from '@/server/repositories/users.repository';
import { verifyPassword, createSessionToken } from '@/server/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, otp } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Please enter your email, phone number, or ITS ID.' },
        { status: 400 }
      );
    }

    let userWithAuth = await usersRepository.findByEmailOrPhone(identifier);

    // If identifier is an 8-digit ITS
    if (!userWithAuth && /^\d{8}$/.test(identifier.trim())) {
      const u = await usersRepository.findByItsNumber(identifier.trim());
      if (u) {
        userWithAuth = await usersRepository.findByEmailOrPhone(u.email);
      }
    }

    if (!userWithAuth) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please verify your details and try again.' },
        { status: 401 }
      );
    }

    // Verify Password
    let isValid = false;
    if (password) {
      isValid = verifyPassword(password, userWithAuth.passwordHash || '');
    } else if (otp) {
      // In production without an SMS/WhatsApp gateway integrated, reject arbitrary OTPs
      return NextResponse.json(
        { success: false, message: 'WhatsApp OTP is not enabled for this account. Please sign in with your password.' },
        { status: 400 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please verify your email, phone, or password.' },
        { status: 401 }
      );
    }

    const { passwordHash, ...safeUser } = userWithAuth;
    const token = createSessionToken(safeUser);

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: safeUser,
      token,
    });

    response.cookies.set('alsouq_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
