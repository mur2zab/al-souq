import { NextRequest, NextResponse } from 'next/server';
import { getAuthProvider } from '@/server/providers/auth-provider';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    const authProvider = getAuthProvider();
    const result = await authProvider.confirmForgotPassword(email, otp, newPassword);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
      },
      { status: result.status }
    );
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
