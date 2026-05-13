/**
 * PII masking utilities for Winston logger.
 * Masks phone numbers and email addresses in log output.
 */

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return '***';
  return phone.slice(0, 2) + '****' + phone.slice(-4);
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  return local[0] + '***@' + domain;
}

export function maskPii(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const masked = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(masked)) {
    const val = (masked as any)[key];
    if (typeof val === 'string') {
      if (/phone|mobile|contact/i.test(key)) {
        (masked as any)[key] = maskPhone(val);
      } else if (/email/i.test(key)) {
        (masked as any)[key] = maskEmail(val);
      } else if (/password|secret|token|key/i.test(key)) {
        (masked as any)[key] = '[REDACTED]';
      }
    } else if (typeof val === 'object' && val !== null) {
      (masked as any)[key] = maskPii(val);
    }
  }
  return masked;
}
