import { NextRequest, NextResponse } from 'next/server';
import { getAuthProvider } from '@/server/providers/auth-provider';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, otp } = await request.json();

    const authProvider = getAuthProvider();
    const result =
      otp && !password
        ? await authProvider.signInWithWhatsAppOtp(identifier, otp)
        : await authProvider.signInWithPassword(identifier, password);

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

    response.cookies.set('alsouq_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
