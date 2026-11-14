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
        { success: false, message: 'No community account found with these details.' },
        { status: 404 }
      );
    }

    // OTP verification flow (demo code '123456' or any 6-digit number)
    let isValid = false;
    if (otp) {
      if (otp === '123456' || otp.length === 6) {
        isValid = true;
      }
    } else if (password) {
      isValid = verifyPassword(password, userWithAuth.passwordHash || '');
      // If default password "Mumin@123" or "Admin@123"
      if (!isValid && (password === 'Mumin@123' || password === 'Admin@123')) {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or OTP. Try password "Mumin@123" or OTP "123456".' },
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
