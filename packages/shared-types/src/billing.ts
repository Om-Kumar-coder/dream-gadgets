/**
 * Canonical bill (invoice) calculation — SINGLE SOURCE OF TRUTH for money math.
 *
 * MIRROR of `apps/api/src/common/utils/billing.ts`. This copy exists so the
 * admin POS runs byte-identical math to the server. A unit test on the API
 * side fails the build if the two copies ever drift apart. Edit BOTH together.
 *
 * ─── The billing rule ────────────────────────────────────────────────────────
 * 1. Subtotal        = Σ (unitPrice − per-unit item discount) × quantity
 * 2. Bill discount   = explicit amount (e.g. from a % discount), clamped to
 *                      [0, subtotal]. It is DISTRIBUTED PROPORTIONALLY across
 *                      lines by pre-tax line value so that every line's tax
 *                      reflects its share of the discount.
 * 3. GST is always calculated on the POST-DISCOUNT taxable value of each line:
 *                      line tax = round2(taxable × rate / 100)
 *    (rate 0 ⇒ tax 0 — a line with no taxRate is simply untaxed.)
 * 4. Total           = taxable total + Σ line taxes (all paise-rounded)
 *
 * Every intermediate value is rounded to 2 decimals (paise) and line shares
 * are allocated with a last-line residual so that the sum of line totals is
 * EXACTLY equal to the grand total — no ₹0.01 drift between invoice lines,
 * the POS display, and the persisted sale.
 */

export interface BillLineInput {
  /** Per-unit selling price (exclusive of tax). */
  unitPrice: number;
  /** Number of units on this line (default 1). */
  quantity?: number;
  /** Per-unit discount amount (default 0). */
  discount?: number;
  /** GST rate percent for this line (default 0). */
  taxRate?: number;
}

export interface BillLineResult {
  unitPrice: number;
  quantity: number;
  /** Per-unit discount (echoed from input). */
  discount: number;
  taxRate: number;
  /** unitPrice × quantity, before any discounts. */
  lineSubtotal: number;
  /** discount × quantity. */
  itemDiscount: number;
  /** This line's share of the bill-level discount. */
  billDiscountShare: number;
  /** lineSubtotal − itemDiscount − billDiscountShare (taxable value). */
  taxable: number;
  /** GST on the taxable value. */
  taxAmount: number;
  /** taxable + taxAmount. Sum over all lines === grandTotal. */
  total: number;
}

export interface BillTotals {
  lines: BillLineResult[];
  /** Σ lineSubtotal — display "Subtotal". */
  grossSubtotal: number;
  /** Σ itemDiscount — per-line discounts. */
  itemDiscountTotal: number;
  /** grossSubtotal − itemDiscountTotal. */
  subtotal: number;
  /** The applied (clamped) bill-level discount amount. */
  billDiscountAmount: number;
  /** itemDiscountTotal + billDiscountAmount — display "Discount". */
  discountTotal: number;
  /** subtotal − billDiscountAmount. Σ line.taxable. */
  taxableTotal: number;
  /** Σ line.taxAmount — display "GST". */
  taxTotal: number;
  /** taxableTotal + taxTotal — the amount the customer must pay. */
  grandTotal: number;
}

/** Round to 2 decimal places (paise), away from float drift. */
export function roundPaise(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate the complete bill from line items + a bill-level discount amount.
 * Deterministic and paise-exact: Σ line.total === grandTotal always.
 */
export function calculateBillTotals(params: {
  lines: BillLineInput[];
  /** Bill-level discount amount (e.g. 18% of subtotal = 6300). */
  billDiscountAmount?: number;
  /** Kept for API compatibility; intra-line CGST/SGST split is not needed for totals. */
  isInterState?: boolean;
}): BillTotals {
  const { lines: rawLines, billDiscountAmount: rawBillDiscount = 0 } = params;

  const lines: BillLineResult[] = rawLines.map((l) => {
    const quantity = Math.max(1, Number(l.quantity ?? 1) || 1);
    const unitPrice = Number(l.unitPrice ?? 0) || 0;
    const discount = Math.max(0, Number(l.discount ?? 0) || 0);
    const taxRate = Math.max(0, Number(l.taxRate ?? 0) || 0);
    return {
      unitPrice,
      quantity,
      discount,
      taxRate,
      lineSubtotal: roundPaise(unitPrice * quantity),
      itemDiscount: roundPaise(discount * quantity),
      billDiscountShare: 0,
      taxable: 0,
      taxAmount: 0,
      total: 0,
    };
  });

  // ── Subtotal (pre bill-discount) ────────────────────────────────────────────
  const grossSubtotal = roundPaise(lines.reduce((s, l) => s + l.lineSubtotal, 0));
  const itemDiscountTotal = roundPaise(lines.reduce((s, l) => s + l.itemDiscount, 0));
  const subtotal = roundPaise(grossSubtotal - itemDiscountTotal);

  // ── Bill discount, clamped and distributed proportionally ───────────────────
  const billDiscountAmount = Math.min(Math.max(roundPaise(Number(rawBillDiscount) || 0), 0), subtotal);

  // Weight = pre-tax line value after item discounts (what the discount comes off).
  const weights = lines.map((l) => roundPaise(l.lineSubtotal - l.itemDiscount));
  const totalWeight = roundPaise(weights.reduce((s, w) => s + w, 0));

  if (billDiscountAmount > 0 && totalWeight > 0) {
    // Cumulative allocation with a last-line residual guarantees
    // Σ billDiscountShare === billDiscountAmount exactly (no paise drift).
    let allocated = 0;
    for (let i = 0; i < lines.length - 1; i++) {
      const share = totalWeight > 0 ? roundPaise((billDiscountAmount * weights[i]) / totalWeight) : 0;
      lines[i].billDiscountShare = share;
      allocated = roundPaise(allocated + share);
    }
    lines[lines.length - 1].billDiscountShare = roundPaise(billDiscountAmount - allocated);
  }

  // ── Per-line taxable value, GST and total ───────────────────────────────────
  for (const l of lines) {
    l.taxable = roundPaise(roundPaise(l.lineSubtotal - l.itemDiscount) - l.billDiscountShare);
    l.taxAmount = roundPaise((l.taxable * l.taxRate) / 100);
    l.total = roundPaise(l.taxable + l.taxAmount);
  }

  const taxableTotal = roundPaise(lines.reduce((s, l) => s + l.taxable, 0));
  const taxTotal = roundPaise(lines.reduce((s, l) => s + l.taxAmount, 0));
  const grandTotal = roundPaise(taxableTotal + taxTotal);

  return {
    lines,
    grossSubtotal,
    itemDiscountTotal,
    subtotal,
    billDiscountAmount,
    discountTotal: roundPaise(itemDiscountTotal + billDiscountAmount),
    taxableTotal,
    taxTotal,
    grandTotal,
  };
}
