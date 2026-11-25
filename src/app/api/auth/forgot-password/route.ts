import { NextRequest, NextResponse } from 'next/server';
import { getAuthProvider } from '@/server/providers/auth-provider';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const authProvider = getAuthProvider();
    const result = await authProvider.initiateForgotPassword(email);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
      },
      { status: result.status }
    );
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to process password reset request.' },
      { status: 500 }
    );
  }
}
