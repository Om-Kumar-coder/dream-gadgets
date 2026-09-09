/**
 * Shared phone-number formatting helpers.
 *
 * All SMS/WhatsApp/OTP providers format Indian numbers the same way:
 *  - normalizePhone(): digits only (e.g. '919876543210')
 *  - formatE164Phone(): E.164 with '+' (e.g. '+919876543210') — Twilio SMS/WhatsApp
 *  - formatPhoneWithoutPlus(): E.164 without '+' (e.g. '919876543210') — MSG91 OTP
 */

const INDIAN_COUNTRY_CODE = '91';
const MIN_INDDIAN_PHONE_LENGTH = 10;
const MAX_INDDIAN_PHONE_LENGTH = 13; // country code + 10 digits

export interface NormalizePhoneResult {
  digits: string;
  countryCode: string | null;
  nationalNumber: string;
}

/**
 * Normalize a phone input to E.164 digits and validate it early.
 * Fail loudly with actionable guidance instead of sending malformed numbers
 * to OTP/SMS providers and getting a generic "Failed to send OTP".
 */
export function normalizeAndValidatePhone(phone: string): NormalizePhoneResult {
  const digits = normalizePhone(phone);

  if (digits.length === 0) {
    throw new Error('Enter a phone number');
  }

  if (digits.length < MIN_INDDIAN_PHONE_LENGTH) {
    throw new Error(`Phone number too short — expected at least ${MIN_INDDIAN_PHONE_LENGTH} digits`);
  }

  if (digits.length > MAX_INDDIAN_PHONE_LENGTH) {
    throw new Error(`Phone number too long — expected at most ${MAX_INDDIAN_PHONE_LENGTH} digits`);
  }

  let countryCode: string | null = null;
  let nationalNumber: string;

  if (digits.startsWith(INDIAN_COUNTRY_CODE)) {
    countryCode = INDIAN_COUNTRY_CODE;
    nationalNumber = digits.slice(INDIAN_COUNTRY_CODE.length);
  } else {
    countryCode = null;
    nationalNumber = digits;
  }

  if (nationalNumber.length < MIN_INDDIAN_PHONE_LENGTH) {
    throw new Error(`Phone number appears incomplete — expected ${MIN_INDDIAN_PHONE_LENGTH} digits after country code`);
  }

  if (!/^\d+$/.test(nationalNumber)) {
    throw new Error('Phone number must contain only digits');
  }

  return { digits, countryCode, nationalNumber };
}

/** Strip everything except digits from a phone number. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Format a phone number as E.164 with a leading '+'.
 * A 10-digit Indian number gets the +91 country code prepended.
 * e.g. '9876543210' or '+91 98765 43210' → '+919876543210'
 */
export function formatE164Phone(phone: string): string {
  const { digits } = normalizeAndValidatePhone(phone);
  if (digits.length === MIN_INDDIAN_PHONE_LENGTH) {
    return `+${INDIAN_COUNTRY_CODE}${digits}`;
  }
  return `+${digits}`;
}

/**
 * Format a phone number as E.164 without the leading '+'.
 * Used by providers that expect a bare country-code number (e.g. MSG91).
 * e.g. '9876543210' or '+919876543210' → '919876543210'
 */
export function formatPhoneWithoutPlus(phone: string): string {
  return formatE164Phone(phone).replace(/^\+/, '');
}
