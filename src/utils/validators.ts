/**
 * Shared client & server validation utilities for Al-Souq.
 */

export interface ValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

/**
 * Validates email format strictly.
 */
export function validateEmail(email: string): ValidationResult {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) {
    return { valid: false, normalized, error: 'Email address is required.' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, normalized, error: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  return { valid: true, normalized };
}

/**
 * Validates phone number (supports international E.164 or 10-digit Indian mobile numbers).
 */
export function validatePhone(phone: string): ValidationResult {
  const raw = (phone || '').trim();
  if (!raw) {
    return { valid: false, normalized: raw, error: 'Phone number is required.' };
  }

  const digits = raw.replace(/\D/g, '');

  // Must be between 10 and 15 digits
  if (digits.length < 10 || digits.length > 15) {
    return {
      valid: false,
      normalized: raw,
      error: 'Phone number must be between 10 and 15 digits (including country code).',
    };
  }

  // Reject obvious fake repeated numbers like 0000000000 or 9999999999 or 1234567890
  const last10 = digits.slice(-10);
  if (/^(\d)\1{9}$/.test(last10) || last10 === '1234567890' || last10 === '0123456789') {
    return {
      valid: false,
      normalized: raw,
      error: 'Please enter a valid, active phone number.',
    };
  }

  // If 10 digits without country code, validate Indian mobile prefix (6-9) and normalize to +91
  if (digits.length === 10) {
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return {
        valid: false,
        normalized: raw,
        error: '10-digit mobile numbers must start with 6, 7, 8, or 9 (or include country code like +971).',
      };
    }
    return { valid: true, normalized: `+91${digits}` };
  }

  return { valid: true, normalized: `+${digits}` };
}

/**
 * Validates Dawoodi Bohra 8-digit ITS ID.
 */
export function validateItsNumber(its: string): ValidationResult {
  const normalized = (its || '').trim();
  if (!normalized) {
    return { valid: false, normalized, error: '8-digit ITS ID is required.' };
  }

  if (!/^\d{8}$/.test(normalized)) {
    return { valid: false, normalized, error: 'ITS ID must be exactly 8 numeric digits.' };
  }

  if (/^(\d)\1{7}$/.test(normalized) || normalized === '12345678') {
    return { valid: false, normalized, error: 'Please enter your real 8-digit ITS ID.' };
  }

  return { valid: true, normalized };
}

/**
 * Validates password strength.
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { valid: false, error: 'Password must include at least one letter and one number.' };
  }
  return { valid: true };
}
