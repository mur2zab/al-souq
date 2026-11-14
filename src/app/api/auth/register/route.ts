import { NextRequest, NextResponse } from 'next/server';
import { usersRepository } from '@/server/repositories/users.repository';
import { createSessionToken } from '@/server/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, password, cityId, cityName, mohallaName, itsNumber } =
      await request.json();

    if (!fullName || !email || !password || !phone) {
      return NextResponse.json(
        { success: false, message: 'Please provide full name, email, phone and password.' },
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
      itsNumber,
    });

    const token = createSessionToken(newUser);

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
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
