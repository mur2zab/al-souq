export interface WhatsAppSendResult {
  sent: boolean;
  provider: string;
  error?: string;
}

export interface IWhatsAppProvider {
  readonly providerName: string;
  sendLoginOtp(toPhone: string, fullName: string, otp: string): Promise<WhatsAppSendResult>;
}

function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return `+${digits}`;
}

/**
 * Twilio WhatsApp Sandbox / Production Provider (100% Free Sandbox for Beta/Testing).
 * Env vars:
 *  - TWILIO_ACCOUNT_SID
 *  - TWILIO_AUTH_TOKEN
 *  - TWILIO_WHATSAPP_FROM (e.g. "whatsapp:+14155238886" for Twilio Sandbox)
 */
export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  public readonly providerName = 'twilio-whatsapp';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber?: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    const rawFrom = fromNumber || '+14155238886';
    this.fromNumber = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`;
  }

  async sendLoginOtp(
    toPhone: string,
    fullName: string,
    otp: string
  ): Promise<WhatsAppSendResult> {
    const normalized = normalizeWhatsAppPhone(toPhone);
    const to = `whatsapp:${normalized}`;
    const body = `Salaam ${fullName}, your Al-Souq verification code is *${otp}*. It expires in 10 minutes. Do not share this code with anyone.`;

    const form = new URLSearchParams({
      From: this.fromNumber,
      To: to,
      Body: body,
    });

    const authHeader = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Twilio WhatsApp send failed:', errText);
      return { sent: false, provider: this.providerName, error: errText };
    }

    return { sent: true, provider: this.providerName };
  }
}

/**
 * Meta WhatsApp Cloud API Provider (Free Developer Test Number for up to 5 test recipients).
 * Env vars:
 *  - META_WHATSAPP_TOKEN
 *  - META_WHATSAPP_PHONE_NUMBER_ID
 *  - META_WHATSAPP_TEMPLATE_NAME (optional, defaults to text or auth template)
 */
export class MetaCloudWhatsAppProvider implements IWhatsAppProvider {
  public readonly providerName = 'meta-cloud-api';
  private accessToken: string;
  private phoneNumberId: string;
  private templateName?: string;

  constructor(accessToken: string, phoneNumberId: string, templateName?: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.templateName = templateName;
  }

  async sendLoginOtp(
    toPhone: string,
    fullName: string,
    otp: string
  ): Promise<WhatsAppSendResult> {
    const recipientDigits = normalizeWhatsAppPhone(toPhone).replace(/\D/g, '');

    const payload = this.templateName
      ? {
          messaging_product: 'whatsapp',
          to: recipientDigits,
          type: 'template',
          template: {
            name: this.templateName,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: otp }],
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [{ type: 'text', text: otp }],
              },
            ],
          },
        }
      : {
          messaging_product: 'whatsapp',
          to: recipientDigits,
          type: 'text',
          text: {
            preview_url: false,
            body: `Salaam ${fullName}, your Al-Souq login OTP is *${otp}* (valid for 10 minutes).`,
          },
        };

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Meta WhatsApp Cloud API send failed:', errText);
      return { sent: false, provider: this.providerName, error: errText };
    }

    return { sent: true, provider: this.providerName };
  }
}

/**
 * Safe Console Fallback when no Twilio or Meta WhatsApp credentials are configured yet.
 */
export class ConsoleDevWhatsAppProvider implements IWhatsAppProvider {
  public readonly providerName = 'console-dev';

  async sendLoginOtp(
    toPhone: string,
    fullName: string,
    otp: string
  ): Promise<WhatsAppSendResult> {
    console.info(`[WHATSAPP_OTP_DEV_FALLBACK] Login OTP for ${fullName} (${toPhone}): ${otp}`);
    return { sent: true, provider: this.providerName };
  }
}

export function getWhatsAppProvider(): IWhatsAppProvider {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return new TwilioWhatsAppProvider(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_WHATSAPP_FROM
    );
  }

  if (process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_NUMBER_ID) {
    return new MetaCloudWhatsAppProvider(
      process.env.META_WHATSAPP_TOKEN,
      process.env.META_WHATSAPP_PHONE_NUMBER_ID,
      process.env.META_WHATSAPP_TEMPLATE_NAME
    );
  }

  return new ConsoleDevWhatsAppProvider();
}
