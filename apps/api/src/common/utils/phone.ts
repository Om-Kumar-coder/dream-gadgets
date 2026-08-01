/**
 * Shared phone-number formatting helpers.
 *
 * All SMS/WhatsApp/OTP providers format Indian numbers the same way:
 *  - normalizePhone(): digits only (e.g. '919876543210')
 *  - formatE164Phone(): E.164 with '+' (e.g. '+919876543210') — Twilio SMS/WhatsApp
 *  - formatPhoneWithoutPlus(): E.164 without '+' (e.g. '919876543210') — MSG91 OTP
 */

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
  // normalizePhone() strips '+', so digits never starts with it
  let digits = normalizePhone(phone);
  if (digits.length === 10) {
    digits = `91${digits}`;
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
