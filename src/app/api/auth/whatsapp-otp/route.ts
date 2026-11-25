import { NextRequest, NextResponse } from 'next/server';
import { getAuthProvider } from '@/server/providers/auth-provider';

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    const authProvider = getAuthProvider();
    const result = await authProvider.initiateWhatsAppOtp(identifier);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
      },
      { status: result.status }
    );
  } catch (err) {
    console.error('WhatsApp OTP request error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to send WhatsApp OTP.' },
      { status: 500 }
    );
  }
}
