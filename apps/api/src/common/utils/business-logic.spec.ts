import { describe, it, expect } from '@jest/globals';
import * as fc from 'fast-check';
import {
  validateIMEI,
  calculateExchangePrice,
  calculateGST,
  validatePaymentSplits,
  calculateWarrantyExpiry,
  getRequiredDiscountRole,
  getRequiredReturnRole,
  isValidStatusTransition,
  VALID_STATUS_TRANSITIONS,
  ItemCondition,
  PaymentSplit,
} from './business-logic';

// ---------------------------------------------------------------------------
// Helper: compute a valid Luhn check digit for a 14-digit prefix
// ---------------------------------------------------------------------------
function luhnCheckDigit(prefix: string): number {
  const digits = prefix.split('').map(Number);
  // Apply Luhn doubling to positions that will be odd (1-indexed) in the full 15-digit string
  // In the full string positions 0..14, odd positions (1,3,5,...,13) are doubled.
  // For the 14-digit prefix (positions 0..13), the same rule applies.
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = digits[i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  // The check digit (position 14, even index) is not doubled.
  // We need sum + checkDigit ≡ 0 (mod 10)
  return (10 - (sum % 10)) % 10;
}

function makeValidIMEI(prefix14: string): string {
  return prefix14 + luhnCheckDigit(prefix14);
}

// ---------------------------------------------------------------------------
// 4.1 validateIMEI
// ---------------------------------------------------------------------------
describe('validateIMEI', () => {
  it('returns true for a known valid IMEI', () => {
    // 490154203237518 is a well-known Luhn-valid test IMEI
    expect(validateIMEI('490154203237518')).toBe(true);
  });

  it('returns false for an IMEI with wrong check digit', () => {
    expect(validateIMEI('490154203237519')).toBe(false);
  });

  it('returns false for non-numeric input', () => {
    expect(validateIMEI('49015420323751A')).toBe(false);
  });

  it('returns false for IMEI shorter than 15 digits', () => {
    expect(validateIMEI('49015420323751')).toBe(false);
  });

  it('returns false for IMEI longer than 15 digits', () => {
    expect(validateIMEI('4901542032375180')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateIMEI('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4.2 calculateExchangePrice
// ---------------------------------------------------------------------------
describe('calculateExchangePrice', () => {
  it('applies no reduction for battery >= 80 and age <= 12 months', () => {
    expect(calculateExchangePrice(10000, 85, 6)).toBe(10000);
  });

  it('applies battery factor 0.85 for battery 60-79', () => {
    expect(calculateExchangePrice(10000, 70, 6)).toBe(8500);
  });

  it('applies battery factor 0.70 for battery < 60', () => {
    expect(calculateExchangePrice(10000, 50, 6)).toBe(7000);
  });

  it('applies age factor 0.80 for 13-24 months', () => {
    expect(calculateExchangePrice(10000, 85, 18)).toBe(8000);
  });

  it('applies age factor 0.65 for > 24 months', () => {
    expect(calculateExchangePrice(10000, 85, 30)).toBe(6500);
  });

  it('applies both battery and age factors', () => {
    // battery 0.85 * age 0.80 = 0.68 → 6800
    expect(calculateExchangePrice(10000, 70, 18)).toBe(6800);
  });

  it('rounds the result', () => {
    // 9999 * 0.85 * 0.80 = 6799.32 → rounds to 6799
    expect(calculateExchangePrice(9999, 70, 18)).toBe(6799);
  });

  it('returns 0 for basePrice 0', () => {
    expect(calculateExchangePrice(0, 50, 30)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4.3 calculateGST
// ---------------------------------------------------------------------------
describe('calculateGST', () => {
  it('splits into CGST+SGST for intra-state', () => {
    const result = calculateGST(10000, 18, false);
    expect(result.igst).toBe(0);
    expect(result.cgst).toBe(900);
    expect(result.sgst).toBe(900);
    expect(result.total).toBe(1800);
  });

  it('uses IGST for inter-state', () => {
    const result = calculateGST(10000, 18, true);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.igst).toBe(1800);
    expect(result.total).toBe(1800);
  });

  it('handles 0% tax rate', () => {
    const result = calculateGST(10000, 0, false);
    expect(result.total).toBe(0);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
  });

  it('handles 28% GST rate', () => {
    const result = calculateGST(1000, 28, true);
    expect(result.igst).toBe(280);
    expect(result.total).toBe(280);
  });
});

// ---------------------------------------------------------------------------
// 4.4 validatePaymentSplits
// ---------------------------------------------------------------------------
describe('validatePaymentSplits', () => {
  it('returns true when splits sum exactly equals total', () => {
    const splits: PaymentSplit[] = [
      { amount: 5000, method: 'cash' },
      { amount: 5000, method: 'card' },
    ];
    expect(validatePaymentSplits(splits, 10000)).toBe(true);
  });

  it('returns true within 0.01 tolerance', () => {
    const splits: PaymentSplit[] = [{ amount: 9999.995, method: 'cash' }];
    expect(validatePaymentSplits(splits, 10000)).toBe(true);
  });

  it('returns false when splits do not match total', () => {
    const splits: PaymentSplit[] = [{ amount: 9000, method: 'cash' }];
    expect(validatePaymentSplits(splits, 10000)).toBe(false);
  });

  it('returns false for empty splits with non-zero total', () => {
    expect(validatePaymentSplits([], 100)).toBe(false);
  });

  it('returns true for empty splits with zero total', () => {
    expect(validatePaymentSplits([], 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4.5 calculateWarrantyExpiry
// ---------------------------------------------------------------------------
describe('calculateWarrantyExpiry', () => {
  const baseDate = new Date('2024-01-15');

  it('returns 12 months ahead for sealed_pack', () => {
    const result = calculateWarrantyExpiry(baseDate, ItemCondition.SEALED_PACK);
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2025);
    expect(result!.getMonth()).toBe(0); // January
    expect(result!.getDate()).toBe(15);
  });

  it('returns 6 months ahead for open_box', () => {
    const result = calculateWarrantyExpiry(baseDate, ItemCondition.OPEN_BOX);
    expect(result).not.toBeNull();
    expect(result!.getMonth()).toBe(6); // July
  });

  it('returns 6 months ahead for super_mint', () => {
    const result = calculateWarrantyExpiry(baseDate, ItemCondition.SUPER_MINT);
    expect(result).not.toBeNull();
    expect(result!.getMonth()).toBe(6); // July
  });

  it('returns null for mint condition', () => {
    expect(calculateWarrantyExpiry(baseDate, ItemCondition.MINT)).toBeNull();
  });

  it('returns null for good condition', () => {
    expect(calculateWarrantyExpiry(baseDate, ItemCondition.GOOD)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 4.6 getRequiredDiscountRole and getRequiredReturnRole
// ---------------------------------------------------------------------------
describe('getRequiredDiscountRole', () => {
  it('returns sales for 0%', () => expect(getRequiredDiscountRole(0)).toBe('sales'));
  it('returns sales for 5%', () => expect(getRequiredDiscountRole(5)).toBe('sales'));
  it('returns manager for 5.1%', () => expect(getRequiredDiscountRole(5.1)).toBe('manager'));
  it('returns manager for 15%', () => expect(getRequiredDiscountRole(15)).toBe('manager'));
  it('returns owner for 15.1%', () => expect(getRequiredDiscountRole(15.1)).toBe('owner'));
  it('returns owner for 100%', () => expect(getRequiredDiscountRole(100)).toBe('owner'));
});

describe('getRequiredReturnRole', () => {
  it('returns any for amount < 5000', () => expect(getRequiredReturnRole(4999)).toBe('any'));
  it('returns manager for 5000', () => expect(getRequiredReturnRole(5000)).toBe('manager'));
  it('returns manager for 25000', () => expect(getRequiredReturnRole(25000)).toBe('manager'));
  it('returns owner for 25001', () => expect(getRequiredReturnRole(25001)).toBe('owner'));
  it('returns owner for large amounts', () => expect(getRequiredReturnRole(100000)).toBe('owner'));
});

// ---------------------------------------------------------------------------
// isValidStatusTransition
// ---------------------------------------------------------------------------
describe('isValidStatusTransition', () => {
  it('allows available → sold', () => expect(isValidStatusTransition('available', 'sold')).toBe(true));
  it('allows sold → returned', () => expect(isValidStatusTransition('sold', 'returned')).toBe(true));
  it('rejects sold → available', () => expect(isValidStatusTransition('sold', 'available')).toBe(false));
  it('rejects unknown from-state', () => expect(isValidStatusTransition('unknown', 'sold')).toBe(false));
  it('rejects returned → sold', () => expect(isValidStatusTransition('returned', 'sold')).toBe(false));
});

// ---------------------------------------------------------------------------
// 4.7 Property-Based Tests (fast-check)
// ---------------------------------------------------------------------------

/**
 * Property 3: IMEI Luhn Validity
 * validateIMEI only returns true for valid Luhn IMEIs
 * Validates: Requirements 2.2, 16.2
 */
describe('PBT Property 3: IMEI Luhn Validity', () => {
  it('always returns true for programmatically constructed valid IMEIs', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom('0','1','2','3','4','5','6','7','8','9'), { minLength: 14, maxLength: 14 }),
        (prefix14) => {
          const imei = makeValidIMEI(prefix14);
          return validateIMEI(imei) === true;
        },
      ),
    );
  });

  it('always returns false for strings that are not 15 digits', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 14 }),
          fc.string({ minLength: 16, maxLength: 30 }),
        ),
        (s) => {
          // Only test strings that are not exactly 15 digits
          if (/^\d{15}$/.test(s)) return true; // skip valid-format strings
          return validateIMEI(s) === false;
        },
      ),
    );
  });
});

/**
 * Property 4: Exchange Price Bounds
 * result always between 0 and basePrice (inclusive)
 * Validates: Requirements 6.1
 */
describe('PBT Property 4: Exchange Price Bounds', () => {
  it('result is always between 0 and basePrice', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000_000 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 120 }),
        (basePrice, batteryHealth, months) => {
          const result = calculateExchangePrice(basePrice, batteryHealth, months);
          return result >= 0 && result <= basePrice;
        },
      ),
    );
  });
});

/**
 * Property 5: GST Calculation Consistency
 * cgst+sgst+igst === total, and correct split based on isInterState
 * Validates: Requirements 3.1
 */
describe('PBT Property 5: GST Calculation Consistency', () => {
  it('cgst+sgst+igst always equals total', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1_000_000, noNaN: true }),
        fc.oneof(fc.constant(5), fc.constant(12), fc.constant(18), fc.constant(28)),
        fc.boolean(),
        (amount, taxRate, isInterState) => {
          const { cgst, sgst, igst, total } = calculateGST(amount, taxRate, isInterState);
          return Math.abs(cgst + sgst + igst - total) < 0.0001;
        },
      ),
    );
  });

  it('inter-state uses only IGST; intra-state uses only CGST+SGST', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 1_000_000, noNaN: true }),
        fc.oneof(fc.constant(5), fc.constant(12), fc.constant(18), fc.constant(28)),
        fc.boolean(),
        (amount, taxRate, isInterState) => {
          const { cgst, sgst, igst } = calculateGST(amount, taxRate, isInterState);
          if (isInterState) {
            return cgst === 0 && sgst === 0 && igst > 0;
          } else {
            return igst === 0 && cgst > 0 && sgst > 0;
          }
        },
      ),
    );
  });
});

/**
 * Property 7: Discount Authorization Monotonicity
 * Higher discount requires >= auth level
 * Validates: Requirements 3.4
 */
describe('PBT Property 7: Discount Authorization Monotonicity', () => {
  const authLevel: Record<string, number> = { sales: 0, manager: 1, owner: 2 };

  it('higher discount always requires equal or higher auth level', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        (d1, d2) => {
          if (d1 >= d2) return true; // only test d1 < d2
          const level1 = authLevel[getRequiredDiscountRole(d1)];
          const level2 = authLevel[getRequiredDiscountRole(d2)];
          return level1 <= level2;
        },
      ),
    );
  });
});

/**
 * Property 2: Payment Split Completeness
 * validatePaymentSplits returns true iff sum matches total within 0.01
 * Validates: Requirements 3.2
 */
describe('PBT Property 2: Payment Split Completeness', () => {
  it('returns true when splits sum matches total within 0.01', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: 0, max: 10000, noNaN: true }), { minLength: 1, maxLength: 5 }),
        (amounts) => {
          const total = amounts.reduce((a, b) => a + b, 0);
          const splits: PaymentSplit[] = amounts.map((a) => ({ amount: a, method: 'cash' }));
          return validatePaymentSplits(splits, total) === true;
        },
      ),
    );
  });

  it('returns false when splits sum differs from total by more than 0.01', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: 0, max: 10000, noNaN: true }), { minLength: 1, maxLength: 5 }),
        fc.double({ min: 0.02, max: 1000, noNaN: true }),
        (amounts, delta) => {
          const sum = amounts.reduce((a, b) => a + b, 0);
          const total = sum + delta; // always off by more than 0.01
          const splits: PaymentSplit[] = amounts.map((a) => ({ amount: a, method: 'cash' }));
          return validatePaymentSplits(splits, total) === false;
        },
      ),
    );
  });
});

/**
 * Property 6: Item Status State Machine
 * isValidStatusTransition rejects invalid transitions
 * Validates: Requirements 4.4
 */
describe('PBT Property 6: Item Status State Machine', () => {
  const allStatuses = Object.keys(VALID_STATUS_TRANSITIONS);

  it('valid transitions are always accepted', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allStatuses),
        (from) => {
          const validTos = VALID_STATUS_TRANSITIONS[from];
          return validTos.every((to) => isValidStatusTransition(from, to) === true);
        },
      ),
    );
  });

  it('invalid transitions are always rejected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allStatuses),
        fc.constantFrom(...allStatuses),
        (from, to) => {
          const validTos = VALID_STATUS_TRANSITIONS[from] ?? [];
          if (validTos.includes(to)) return true; // skip valid ones
          return isValidStatusTransition(from, to) === false;
        },
      ),
    );
  });
});
