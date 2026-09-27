import * as apiBilling from './billing';
import * as sharedBilling from '@dream-gadgets/shared-types';
import { calculateBillTotals, roundPaise } from './billing';

/**
 * Phase 12/13 — the POS (packages/shared-types/src/billing.ts) and the API
 * (apps/api/src/common/utils/billing.ts) must run byte-identical math. If the
 * mirrors ever drift, every sale risks a PAYMENT_TOTAL_MISMATCH at the counter.
 */
describe('billing mirror sync', () => {
  it('API and shared-types calculateBillTotals produce identical results', () => {
    const cases = [
      { lines: [{ unitPrice: 35000, taxRate: 18 }], billDiscountAmount: 6300 },
      { lines: [{ unitPrice: 35000, taxRate: 18 }] },
      {
        lines: [
          { unitPrice: 19999.99, taxRate: 18 },
          { unitPrice: 499.99, taxRate: 5, discount: 10 },
        ],
        billDiscountAmount: 1234.56,
      },
      { lines: [{ unitPrice: 0.01, taxRate: 18 }], billDiscountAmount: 0.01 },
      { lines: [{ unitPrice: 12345.67, taxRate: 12 }], billDiscountAmount: 9999.99 },
    ];

    for (const c of cases) {
      expect(sharedBilling.calculateBillTotals(c)).toEqual(apiBilling.calculateBillTotals(c));
    }
  });

  it('roundPaise matches between mirrors', () => {
    for (const n of [28699.995, 28700.005, 0.005, 1.005, 2.675, -0.005]) {
      expect(sharedBilling.roundPaise(n)).toBe(apiBilling.roundPaise(n));
    }
  });
});

describe('billing contract (GST after discount, paise-exact)', () => {
  it('Phase 15 exact case: 35000 @ 18% discount, 18% GST → 33866.00', () => {
    const b = calculateBillTotals({
      lines: [{ unitPrice: 35000, taxRate: 18 }],
      billDiscountAmount: roundPaise(35000 * 0.18), // 6300
    });
    // discountAmount = 6300; taxable = 28700; gst = 5166; total = 33866
    expect(b.subtotal).toBe(35000);
    expect(b.billDiscountAmount).toBe(6300);
    expect(b.taxableTotal).toBe(28700);
    expect(b.taxTotal).toBe(5166);
    expect(b.grandTotal).toBe(33866);
    // Line shares sum exactly — no paise drift between display and invoice lines.
    const lineSum = b.lines.reduce((s, l) => s + l.total, 0);
    expect(roundPaise(lineSum)).toBe(b.grandTotal);
  });

  it('handles multiple items with discount distributed proportionally', () => {
    const b = calculateBillTotals({
      lines: [
        { unitPrice: 30000, taxRate: 18 },
        { unitPrice: 5000, taxRate: 18 },
      ],
      billDiscountAmount: 6300,
    });
    expect(b.subtotal).toBe(35000);
    expect(b.billDiscountAmount).toBe(6300);
    expect(b.taxableTotal).toBe(28700);
    // Shares are proportional (30000:5000) and sum exactly to 6300.
    expect(roundPaise(b.lines[0].billDiscountShare + b.lines[1].billDiscountShare)).toBe(6300);
    expect(roundPaise(b.lines.reduce((s, l) => s + l.total, 0))).toBe(b.grandTotal);
  });

  it('is deterministic across repeated runs (no float drift)', () => {
    const params = {
      lines: [
        { unitPrice: 99999, taxRate: 18 },
        { unitPrice: 0.01, taxRate: 5 },
      ],
      billDiscountAmount: 33333.33,
    };
    const a = calculateBillTotals(params);
    const b2 = calculateBillTotals(params);
    expect(a).toEqual(b2);
  });

  it('does not produce float garbage like 28699.999… or 28700.01', () => {
    const b = calculateBillTotals({
      lines: [{ unitPrice: 35000, taxRate: 18 }],
      billDiscountAmount: 6300,
    });
    for (const v of [b.subtotal, b.taxableTotal, b.taxTotal, b.grandTotal]) {
      expect(Number(v.toFixed(2))).toBe(v);
      expect(String(v)).not.toMatch(/\.\d{3,}/);
    }
  });

  it('clamps discount at 0 and at subtotal (100%)', () => {
    const negative = calculateBillTotals({
      lines: [{ unitPrice: 10000, taxRate: 18 }],
      billDiscountAmount: -500,
    });
    expect(negative.billDiscountAmount).toBe(0);
    expect(negative.grandTotal).toBe(roundPaise(10000 * 1.18));

    const full = calculateBillTotals({
      lines: [{ unitPrice: 10000, taxRate: 18 }],
      billDiscountAmount: 99999,
    });
    expect(full.billDiscountAmount).toBe(10000);
    expect(full.taxableTotal).toBe(0);
    expect(full.taxTotal).toBe(0);
    expect(full.grandTotal).toBe(0);
  });

  it('zero-rate lines are untaxed (GST 0 case)', () => {
    const b = calculateBillTotals({
      lines: [{ unitPrice: 35000, taxRate: 0 }],
      billDiscountAmount: 6300,
    });
    expect(b.taxTotal).toBe(0);
    expect(b.grandTotal).toBe(28700);
  });

  // Phase 16 regression matrix — subtotal / discount% / gst%
  const matrix: Array<[number, number, number]> = [
    [35000, 0, 0],
    [35000, 10, 18],
    [35000, 18, 18],
    [99999, 5, 18],
    [1000, 33.33, 18],
    [499.99, 10, 5],
    [10000, 100, 18],
  ];

  it.each(matrix)('matrix: subtotal %d, discount %d%%, gst %d%%', (sub, disc, gst) => {
    const b = calculateBillTotals({
      lines: [{ unitPrice: sub, taxRate: gst }],
      billDiscountAmount: roundPaise((sub * disc) / 100),
    });
    const expectedTaxable = roundPaise(sub - roundPaise((sub * disc) / 100));
    expect(b.subtotal).toBe(sub);
    expect(b.taxableTotal).toBe(expectedTaxable);
    expect(b.taxTotal).toBe(roundPaise((expectedTaxable * gst) / 100));
    expect(b.grandTotal).toBe(roundPaise(expectedTaxable + roundPaise((expectedTaxable * gst) / 100)));
    expect(roundPaise(b.lines.reduce((s, l) => s + l.total, 0))).toBe(b.grandTotal);
  });
});
