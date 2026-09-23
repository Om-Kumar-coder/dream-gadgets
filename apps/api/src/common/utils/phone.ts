/**
 * Shared phone-number formatting helpers — India (+91) only.
 *
 * Dream Gadgets serves Indian customers, so every phone that reaches the
 * backend is treated as an Indian number:
 *  - normalizePhone(): digits only (e.g. '9876543210')
 *  - normalizeIndianPhone(): full parse → { digits, nationalNumber, countryCode }
 *  - formatE164Phone(): E.164 with '+' (e.g. '+919876543210') — Twilio SMS/WhatsApp
 *  - formatPhoneWithoutPlus(): E.164 without '+' (e.g. '919876543210') — MSG91 OTP
 *
 * Guarantees (per the OTP country/number spec):
 *  - a bare 10-digit number is ALWAYS treated as Indian (+91)
 *  - a number that already carries '91' is never prefixed again (no '+91 +91 …')
 *  - numbers that don't fit the Indian format are rejected, not reinterpreted
 *    as another country's number
 */

const INDIAN_COUNTRY_CODE = '91';
const INDIAN_NATIONAL_LENGTH = 10;

/** First digit of a valid Indian mobile number (after any 0/+91 prefix). */
const INDIAN_MOBILE_FIRST_DIGIT = /^[6-9]/;

export interface NormalizePhoneResult {
  /** E.164 digits WITHOUT '+', e.g. '919876543210'. Use for MSG91. */
  digits: string;
  /** Always '91' for accepted numbers. */
  countryCode: string;
  /** The 10-digit national number, e.g. '9876543210'. */
  nationalNumber: string;
}

/** Strip everything except digits from a phone number. */
export function normalizePhone(phone: string): string {
  return (phone ?? '').replace(/\D/g, '');
}

/**
 * Normalize + validate an Indian phone number.
 * Accepts: '9876543210', '+919876543210', '919876543210', '09876543210',
 * '98765 43210', '+91 98765-43210'.
 * Rejects: empty, too short/long, numbers that cannot be Indian
 * (e.g. '1234567890', '4155551234' US-style), and '91' runs that would
 * double up ('919876543210' is +91 9876543210, not 91 919876543210).
 */
export function normalizeAndValidatePhone(phone: string): NormalizePhoneResult {
  const raw = (phone ?? '').trim();

  if (!raw) {
    throw new Error('Enter a phone number');
  }

  let digits = normalizePhone(raw);

  // Strip a trunk '0' the user may have typed ('098765 43210').
  if (digits.length === INDIAN_NATIONAL_LENGTH + 1 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length === 0) {
    throw new Error('Phone number must contain digits');
  }

  if (digits.length < INDIAN_NATIONAL_LENGTH) {
    throw new Error(`Phone number too short — expected ${INDIAN_NATIONAL_LENGTH} digits`);
  }

  if (digits.length > INDIAN_COUNTRY_CODE.length + INDIAN_NATIONAL_LENGTH) {
    throw new Error(`Phone number too long — expected at most ${INDIAN_COUNTRY_CODE.length + INDIAN_NATIONAL_LENGTH} digits`);
  }

  let countryCode: string;
  let nationalNumber: string;

  if (digits.length === INDIAN_COUNTRY_CODE.length + INDIAN_NATIONAL_LENGTH) {
    // 12 digits — must start with the Indian country code 91.
    if (!digits.startsWith(INDIAN_COUNTRY_CODE)) {
      throw new Error('Only Indian phone numbers (+91) are supported');
    }
    countryCode = INDIAN_COUNTRY_CODE;
    nationalNumber = digits.slice(INDIAN_COUNTRY_CODE.length);
  } else if (digits.length === INDIAN_NATIONAL_LENGTH) {
    countryCode = INDIAN_COUNTRY_CODE;
    nationalNumber = digits;
  } else {
    // 11 digits (e.g. '91987654321') — ambiguous, never guess.
    throw new Error('Phone number must be a 10-digit Indian mobile number (optionally with +91)');
  }

  if (!/^\d+$/.test(nationalNumber)) {
    throw new Error('Phone number must contain only digits');
  }

  if (!INDIAN_MOBILE_FIRST_DIGIT.test(nationalNumber)) {
    throw new Error('Indian mobile numbers start with 6, 7, 8 or 9');
  }

  return {
    digits: `${INDIAN_COUNTRY_CODE}${nationalNumber}`,
    countryCode,
    nationalNumber,
  };
}

/**
 * Format a phone number as E.164 with a leading '+'.
 * e.g. '9876543210', '+91 98765 43210', '919876543210' → '+919876543210'
 * Never prepends +91 twice — see normalizeAndValidatePhone.
 */
export function formatE164Phone(phone: string): string {
  const { digits } = normalizeAndValidatePhone(phone);
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
