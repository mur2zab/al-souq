import { NextRequest, NextResponse } from 'next/server';
import { getAuthProvider } from '@/server/providers/auth-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const authProvider = getAuthProvider();
    const result = await authProvider.registerUser({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      password: body.password,
      cityId: body.cityId || 'mumbai',
      cityName: body.cityName || 'Mumbai',
      jamaatName: body.jamaatName,
      mohallaName: body.mohallaName,
      itsNumber: body.itsNumber,
      itsCardProofUrl: body.itsCardProofUrl,
      livePhotoUrl: body.livePhotoUrl,
    });

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
      token: result.token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('alsouq_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
}
