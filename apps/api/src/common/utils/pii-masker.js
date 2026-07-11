/**
 * PII masking utilities for Winston logger.
 * Masks phone numbers and email addresses in log output.
 */
export function maskPhone(phone) {
    if (!phone || phone.length < 6)
        return '***';
    return phone.slice(0, 2) + '****' + phone.slice(-4);
}
export function maskEmail(email) {
    if (!email || !email.includes('@'))
        return '***';
    const [local, domain] = email.split('@');
    return local[0] + '***@' + domain;
}
export function maskPii(obj) {
    if (!obj || typeof obj !== 'object')
        return obj;
    const masked = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const key of Object.keys(masked)) {
        const val = masked[key];
        if (typeof val === 'string') {
            if (/phone|mobile|contact/i.test(key)) {
                masked[key] = maskPhone(val);
            }
            else if (/email/i.test(key)) {
                masked[key] = maskEmail(val);
            }
            else if (/password|secret|token|key/i.test(key)) {
                masked[key] = '[REDACTED]';
            }
        }
        else if (typeof val === 'object' && val !== null) {
            masked[key] = maskPii(val);
        }
    }
    return masked;
}
//# sourceMappingURL=pii-masker.js.map