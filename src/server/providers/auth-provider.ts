import crypto from 'crypto';
import { User } from '@/types';
import { usersRepository } from '@/server/repositories/users.repository';
import { verificationRepository } from '@/server/repositories/verification.repository';
import { createSessionToken, verifyPassword, verifySessionToken } from '@/server/auth/auth';
import { getOtpStore } from '@/server/providers/otp-store';
import { getEmailProvider } from '@/server/providers/email-provider';
import { getWhatsAppProvider } from '@/server/providers/whatsapp-provider';
import {
  validateEmail,
  validateItsNumber,
  validatePassword,
  validatePhone,
} from '@/utils/validators';

export interface AuthResult {
  success: boolean;
  status: number;
  message: string;
  user?: User;
  token?: string;
}

export interface RegisterUserInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  cityId: string;
  cityName: string;
  jamaatName?: string;
  mohallaName?: string;
  itsNumber: string;
  itsCardProofUrl: string;
  livePhotoUrl: string;
}

/**
 * Wrapper Interface for Authentication Providers.
 * Designed so the platform can swap from LocalJwtAuthProvider to AWS Cognito
 * (InitiateAuth, SignUp, ForgotPassword, ConfirmForgotPassword) without touching API routes or UI.
 */
export interface IAuthProvider {
  readonly providerName: string;
  signInWithPassword(identifier: string, password: string): Promise<AuthResult>;
  initiateWhatsAppOtp(identifier: string): Promise<{
    success: boolean;
    status: number;
    message: string;
    whatsappProvider?: string;
    otpStoreProvider?: string;
  }>;
  signInWithWhatsAppOtp(identifier: string, otp: string): Promise<AuthResult>;
  registerUser(input: RegisterUserInput): Promise<AuthResult>;
  initiateForgotPassword(email: string): Promise<{
    success: boolean;
    status: number;
    message: string;
    otpStoreProvider?: string;
    emailProvider?: string;
  }>;
  confirmForgotPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; status: number; message: string }>;
  verifyToken(token: string): ReturnType<typeof verifySessionToken>;
}

export class LocalJwtAuthProvider implements IAuthProvider {
  public readonly providerName = 'local-jwt-postgres';

  private async findUserByIdentifier(identifier: string) {
    let userWithAuth = await usersRepository.findByEmailOrPhone(identifier);

    // Support 8-digit ITS lookup
    if (!userWithAuth && /^\d{8}$/.test(identifier.trim())) {
      const u = await usersRepository.findByItsNumber(identifier.trim());
      if (u) {
        userWithAuth = await usersRepository.findByEmailOrPhone(u.email);
      }
    }

    return userWithAuth;
  }

  async signInWithPassword(identifier: string, password: string): Promise<AuthResult> {
    if (!identifier || !password) {
      return {
        success: false,
        status: 400,
        message: 'Please enter your email, phone, or ITS ID and password.',
      };
    }

    const userWithAuth = await this.findUserByIdentifier(identifier);
    if (!userWithAuth) {
      return {
        success: false,
        status: 401,
        message: 'Invalid credentials. Please verify your details and try again.',
      };
    }

    const isValid = verifyPassword(password, userWithAuth.passwordHash || '');
    if (!isValid) {
      return {
        success: false,
        status: 401,
        message: 'Invalid credentials. Please verify your email, phone, or password.',
      };
    }

    const { passwordHash, ...safeUser } = userWithAuth;
    const token = createSessionToken(safeUser);

    return {
      success: true,
      status: 200,
      message: 'Logged in successfully',
      user: safeUser,
      token,
    };
  }

  async initiateWhatsAppOtp(identifier: string) {
    if (!identifier || !identifier.trim()) {
      return {
        success: false,
        status: 400,
        message: 'Please enter your registered email, phone, or 8-digit ITS ID.',
      };
    }

    const userWithAuth = await this.findUserByIdentifier(identifier);
    const otpStore = getOtpStore();
    const waProvider = getWhatsAppProvider();

    if (userWithAuth && userWithAuth.phone) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpKey = `wa_login:${userWithAuth.id}`;

      await otpStore.setOtp(otpKey, otp, 600);
      await waProvider.sendLoginOtp(userWithAuth.phone, userWithAuth.fullName, otp);
    }

    return {
      success: true,
      status: 200,
      message:
        'If an account exists for these details, a 6-digit login code has been sent to your registered WhatsApp number (valid for 10 minutes).',
      whatsappProvider: waProvider.providerName,
      otpStoreProvider: otpStore.providerName,
    };
  }

  async signInWithWhatsAppOtp(identifier: string, otp: string): Promise<AuthResult> {
    if (!identifier || !otp) {
      return {
        success: false,
        status: 400,
        message: 'Please enter your account identifier and the 6-digit WhatsApp OTP.',
      };
    }

    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return {
        success: false,
        status: 400,
        message: 'Please enter a valid 6-digit WhatsApp OTP.',
      };
    }

    const userWithAuth = await this.findUserByIdentifier(identifier);
    if (!userWithAuth) {
      return {
        success: false,
        status: 401,
        message: 'Invalid credentials or expired OTP.',
      };
    }

    const otpKey = `wa_login:${userWithAuth.id}`;
    const otpStore = getOtpStore();

    const attempts = await otpStore.incrementAttempts(otpKey, 600);
    if (attempts > 5) {
      await otpStore.deleteOtp(otpKey);
      return {
        success: false,
        status: 429,
        message: 'Too many invalid OTP attempts. Please request a new WhatsApp OTP.',
      };
    }

    const storedOtp = await otpStore.getOtp(otpKey);
    if (!storedOtp) {
      return {
        success: false,
        status: 401,
        message: 'WhatsApp OTP has expired or has not been requested. Please request a new code.',
      };
    }

    const a = Buffer.from(storedOtp, 'utf8');
    const b = Buffer.from(cleanOtp, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return {
        success: false,
        status: 401,
        message: 'Incorrect WhatsApp OTP. Please check your WhatsApp messages and try again.',
      };
    }

    await otpStore.deleteOtp(otpKey);

    const { passwordHash, ...safeUser } = userWithAuth;
    const token = createSessionToken(safeUser);

    return {
      success: true,
      status: 200,
      message: 'Signed in via WhatsApp OTP',
      user: safeUser,
      token,
    };
  }

  async registerUser(input: RegisterUserInput): Promise<AuthResult> {
    if (!input.fullName?.trim()) {
      return { success: false, status: 400, message: 'Full name is required.' };
    }

    const emailCheck = validateEmail(input.email);
    if (!emailCheck.valid) {
      return { success: false, status: 400, message: emailCheck.error || 'Invalid email.' };
    }

    const phoneCheck = validatePhone(input.phone);
    if (!phoneCheck.valid) {
      return { success: false, status: 400, message: phoneCheck.error || 'Invalid phone number.' };
    }

    const itsCheck = validateItsNumber(input.itsNumber);
    if (!itsCheck.valid) {
      return { success: false, status: 400, message: itsCheck.error || 'Invalid ITS ID.' };
    }

    const passwordCheck = validatePassword(input.password);
    if (!passwordCheck.valid) {
      return { success: false, status: 400, message: passwordCheck.error || 'Weak password.' };
    }

    if (!input.itsCardProofUrl) {
      return {
        success: false,
        status: 400,
        message: 'Please upload a clear photo of your ITS card.',
      };
    }

    if (!input.livePhotoUrl) {
      return {
        success: false,
        status: 400,
        message: 'Please capture a live photo snapshot using your camera.',
      };
    }

    // 1. Check duplicate Email
    const existingByEmail = await usersRepository.findByEmailOrPhone(emailCheck.normalized);
    if (existingByEmail) {
      return {
        success: false,
        status: 409,
        message: 'An account with this email address is already registered.',
      };
    }

    // 2. Check duplicate Phone
    const existingByPhone = await usersRepository.findByEmailOrPhone(phoneCheck.normalized);
    if (existingByPhone) {
      return {
        success: false,
        status: 409,
        message: 'An account with this phone number is already registered.',
      };
    }

    // 3. Check duplicate 8-digit ITS ID
    const existingByIts = await usersRepository.findByItsNumber(itsCheck.normalized);
    if (existingByIts) {
      return {
        success: false,
        status: 409,
        message:
          'An account with this 8-digit ITS number is already registered. Please sign in or use Forgot Password.',
      };
    }

    const selectedJamaatOrMohalla =
      input.jamaatName?.trim() || input.mohallaName?.trim() || 'Mazgaon Jamaat';

    const newUser = await usersRepository.create({
      fullName: input.fullName.trim(),
      email: emailCheck.normalized,
      phone: phoneCheck.normalized,
      password: input.password,
      cityId: input.cityId || 'mumbai',
      cityName: input.cityName || 'Mumbai',
      mohallaName: selectedJamaatOrMohalla,
      itsNumber: itsCheck.normalized,
      itsCardProofUrl: input.itsCardProofUrl,
      livePhotoUrl: input.livePhotoUrl,
    });

    // Queue KYC verification for Al-Souq Admin Desk
    await verificationRepository.create({
      userId: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      itsNumber: itsCheck.normalized,
      jamaatCity: `${newUser.cityName} (${selectedJamaatOrMohalla})`,
      mohalla: selectedJamaatOrMohalla,
      idCardImageUrl: input.itsCardProofUrl,
      livePhotoUrl: input.livePhotoUrl,
      ocrExtractedIts: itsCheck.normalized,
      ocrExtractedName: input.fullName.trim(),
      ocrConfidence: 99,
      ocrMatches: true,
      adminNotes: 'Submitted during registration. Awaiting Al-Souq Admin review.',
    });

    const token = createSessionToken(newUser);

    return {
      success: true,
      status: 200,
      message: 'Registration submitted for Al-Souq Admin verification.',
      user: newUser,
      token,
    };
  }

  async initiateForgotPassword(email: string) {
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return {
        success: false,
        status: 400,
        message: emailCheck.error || 'Please enter a valid email address.',
      };
    }

    const user = await usersRepository.findByEmailOrPhone(emailCheck.normalized);
    const otpStore = getOtpStore();
    const emailProvider = getEmailProvider();

    if (user) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpKey = `pwd_reset:${emailCheck.normalized}`;

      // Save OTP in Redis (or Postgres fallback) for 10 minutes (600 seconds)
      await otpStore.setOtp(otpKey, otp, 600);
      await emailProvider.sendPasswordResetOtp(user.email, user.fullName, otp);
    }

    // Generic response prevents account email enumeration
    return {
      success: true,
      status: 200,
      message:
        'If an account exists for this email, a 6-digit password reset code has been sent (valid for 10 minutes).',
      otpStoreProvider: otpStore.providerName,
      emailProvider: emailProvider.providerName,
    };
  }

  async confirmForgotPassword(email: string, otp: string, newPassword: string) {
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return { success: false, status: 400, message: emailCheck.error || 'Invalid email.' };
    }

    const cleanOtp = (otp || '').trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return { success: false, status: 400, message: 'Please enter the 6-digit email OTP.' };
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return { success: false, status: 400, message: passwordCheck.error || 'Weak password.' };
    }

    const otpKey = `pwd_reset:${emailCheck.normalized}`;
    const otpStore = getOtpStore();

    // Rate-limit OTP verification attempts (max 5 tries)
    const attempts = await otpStore.incrementAttempts(otpKey, 600);
    if (attempts > 5) {
      await otpStore.deleteOtp(otpKey);
      return {
        success: false,
        status: 429,
        message: 'Too many invalid OTP attempts. Please request a new reset code.',
      };
    }

    const storedOtp = await otpStore.getOtp(otpKey);
    if (!storedOtp) {
      return {
        success: false,
        status: 400,
        message: 'Reset code has expired or does not exist. Please request a new one.',
      };
    }

    // Constant-time comparison
    const a = Buffer.from(storedOtp, 'utf8');
    const b = Buffer.from(cleanOtp, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return {
        success: false,
        status: 400,
        message: 'Incorrect verification code. Please check your email and try again.',
      };
    }

    const user = await usersRepository.findByEmailOrPhone(emailCheck.normalized);
    if (!user) {
      return { success: false, status: 404, message: 'Account not found.' };
    }

    await usersRepository.updatePassword(user.id, newPassword);
    await otpStore.deleteOtp(otpKey);

    return {
      success: true,
      status: 200,
      message: 'Your password has been reset successfully. You can now sign in.',
    };
  }

  verifyToken(token: string) {
    return verifySessionToken(token);
  }
}

/**
 * Factory returning the configured Auth Provider.
 * Set AUTH_PROVIDER=cognito in the future when migrating to AWS Cognito.
 */
export function getAuthProvider(): IAuthProvider {
  // Future AWS Cognito swap point:
  // if (process.env.AUTH_PROVIDER === 'cognito') return new AwsCognitoAuthProvider();
  return new LocalJwtAuthProvider();
}
