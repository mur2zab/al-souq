export interface EmailSendResult {
  sent: boolean;
  provider: string;
}

export interface IEmailProvider {
  readonly providerName: string;
  sendPasswordResetOtp(toEmail: string, fullName: string, otp: string): Promise<EmailSendResult>;
}

function buildResetEmailHtml(fullName: string, otp: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #FAF8F5; border: 1px solid #E5E0D8; border-radius: 16px; overflow: hidden;">
      <div style="background: #09332A; padding: 24px; text-align: center; color: #FFFFFF;">
        <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Al-Souq <span style="color: #E6CA65;">السوق</span></div>
        <div style="font-size: 12px; color: #A7F3D0; margin-top: 4px;">Dawoodi Bohra Community Marketplace</div>
      </div>
      <div style="padding: 28px 24px; color: #1E293B;">
        <p style="font-size: 15px; margin: 0 0 12px;">Salaam <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          We received a request to reset your Al-Souq password. Use the 6-digit verification code below to set a new password:
        </p>
        <div style="background: #FFFFFF; border: 2px dashed #09332A; border-radius: 12px; padding: 18px; text-align: center; margin: 0 0 20px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #09332A;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin: 0;">
          This code expires in <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
}

/**
 * Free Tier Email Provider via Resend (3,000 free emails/month).
 * Set RESEND_API_KEY and optional EMAIL_FROM in environment variables.
 */
export class ResendEmailProvider implements IEmailProvider {
  public readonly providerName = 'resend';
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail?: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail || 'Al-Souq Security <onboarding@resend.dev>';
  }

  async sendPasswordResetOtp(
    toEmail: string,
    fullName: string,
    otp: string
  ): Promise<EmailSendResult> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [toEmail],
        subject: 'Al-Souq Password Reset Verification Code',
        html: buildResetEmailHtml(fullName, otp),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend email delivery failed:', errText);
      return { sent: false, provider: this.providerName };
    }

    return { sent: true, provider: this.providerName };
  }
}

/**
 * Free Tier Email Provider via Brevo (300 free emails/day).
 * Set BREVO_API_KEY and optional EMAIL_FROM in environment variables.
 */
export class BrevoEmailProvider implements IEmailProvider {
  public readonly providerName = 'brevo';
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail?: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail || 'no-reply@alsouq.community';
  }

  async sendPasswordResetOtp(
    toEmail: string,
    fullName: string,
    otp: string
  ): Promise<EmailSendResult> {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Al-Souq Security', email: this.fromEmail },
        to: [{ email: toEmail, name: fullName }],
        subject: 'Al-Souq Password Reset Verification Code',
        htmlContent: buildResetEmailHtml(fullName, otp),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Brevo email delivery failed:', errText);
      return { sent: false, provider: this.providerName };
    }

    return { sent: true, provider: this.providerName };
  }
}

/**
 * Development / Unconfigured Fallback Email Provider (logs safely to server stdout).
 */
export class ConsoleDevEmailProvider implements IEmailProvider {
  public readonly providerName = 'console-dev';

  async sendPasswordResetOtp(
    toEmail: string,
    fullName: string,
    otp: string
  ): Promise<EmailSendResult> {
    console.info(`[EMAIL_DEV_FALLBACK] Password Reset OTP for ${fullName} <${toEmail}>: ${otp}`);
    return { sent: true, provider: this.providerName };
  }
}

export function getEmailProvider(): IEmailProvider {
  const fromEmail = process.env.EMAIL_FROM;

  if (process.env.RESEND_API_KEY) {
    return new ResendEmailProvider(process.env.RESEND_API_KEY, fromEmail);
  }
  if (process.env.BREVO_API_KEY) {
    return new BrevoEmailProvider(process.env.BREVO_API_KEY, fromEmail);
  }

  return new ConsoleDevEmailProvider();
}
