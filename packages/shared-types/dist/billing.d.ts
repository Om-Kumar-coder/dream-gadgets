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
export declare function roundPaise(n: number): number;
/**
 * Calculate the complete bill from line items + a bill-level discount amount.
 * Deterministic and paise-exact: Σ line.total === grandTotal always.
 */
export declare function calculateBillTotals(params: {
    lines: BillLineInput[];
    /** Bill-level discount amount (e.g. 18% of subtotal = 6300). */
    billDiscountAmount?: number;
    /** Kept for API compatibility; intra-line CGST/SGST split is not needed for totals. */
    isInterState?: boolean;
}): BillTotals;
//# sourceMappingURL=billing.d.ts.map