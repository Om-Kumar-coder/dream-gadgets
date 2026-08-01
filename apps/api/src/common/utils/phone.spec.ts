import { describe, it, expect } from '@jest/globals';
import { normalizePhone, formatE164Phone, formatPhoneWithoutPlus } from './phone';

describe('phone formatting utility', () => {
  describe('normalizePhone()', () => {
    it('strips non-digit characters', () => {
      expect(normalizePhone('+91 98765 43210')).toBe('919876543210');
      expect(normalizePhone('98765-43210')).toBe('9876543210');
      expect(normalizePhone('(987) 654-3210')).toBe('9876543210');
    });

    it('keeps already-digit-only strings intact', () => {
      expect(normalizePhone('919876543210')).toBe('919876543210');
      expect(normalizePhone('9876543210')).toBe('9876543210');
    });
  });

  describe('formatE164Phone()', () => {
    it('prepends +91 to a 10-digit Indian number', () => {
      expect(formatE164Phone('9876543210')).toBe('+919876543210');
    });

    it('normalizes +91-prefixed numbers with spaces/dashes', () => {
      expect(formatE164Phone('+91 98765 43210')).toBe('+919876543210');
      expect(formatE164Phone('91-98765-43210')).toBe('+919876543210');
    });

    it('keeps an already-formatted E.164 number as-is', () => {
      expect(formatE164Phone('+919876543210')).toBe('+919876543210');
    });

    it('handles 12-digit country-coded numbers without +', () => {
      expect(formatE164Phone('919876543210')).toBe('+919876543210');
    });
  });

  describe('formatPhoneWithoutPlus()', () => {
    it('formats a 10-digit Indian number without the leading +', () => {
      expect(formatPhoneWithoutPlus('9876543210')).toBe('919876543210');
    });

    it('strips the + from an E.164 number', () => {
      expect(formatPhoneWithoutPlus('+919876543210')).toBe('919876543210');
    });
  });
});
