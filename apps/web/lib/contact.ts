/**
 * Centralized contact information for Dream Gadgets.
 *
 * All WhatsApp / phone numbers across the web app should import from here
 * instead of hardcoding. Values come from NEXT_PUBLIC_* env vars with the
 * real business numbers as fallback defaults.
 */

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918282011193';

export const SUPPORT_PHONE =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? '918282011193';

/** Display-formatted phone (e.g. "+91 82820 11193") */
export const SUPPORT_PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY ?? '+91 82820 11193';

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@dreamgadgets.in';
