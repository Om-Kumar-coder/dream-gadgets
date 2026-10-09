export function normalizeIMEI(input: unknown): string {
  if (typeof input === 'number' && Number.isFinite(input)) return String(input);
  if (typeof input !== 'string') return '';
  // Normalize common paste/scan formatting before validation:
  // trim surrounding whitespace/newlines and drop digit-group separators.
  return input.replace(/[\s-]+/g, '').trim();
}

export function validateIMEI(imei: unknown): boolean {
  const value = normalizeIMEI(imei);
  if (!/^\d{15}$/.test(value)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(value[i]);
    if (i % 2 === 1) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function calculateExchangePrice(basePrice: number, batteryHealth: number, monthsSinceFirstInvoice: number): number {
  const batteryFactor = batteryHealth >= 80 ? 1.0 : batteryHealth >= 60 ? 0.85 : 0.70;
  const ageFactor = monthsSinceFirstInvoice <= 12 ? 1.0 : monthsSinceFirstInvoice <= 24 ? 0.80 : 0.65;
  return Math.round(basePrice * batteryFactor * ageFactor);
}

export function calculateGST(amount: number, taxRate: number, isInterState: boolean): { cgst: number; sgst: number; igst: number; total: number } {
  const taxAmount = (amount * taxRate) / 100;
  if (isInterState) return { cgst: 0, sgst: 0, igst: taxAmount, total: taxAmount };
  return { cgst: taxAmount / 2, sgst: taxAmount / 2, igst: 0, total: taxAmount };
}

export interface PaymentSplit { amount: number; method: string; }
export function validatePaymentSplits(splits: PaymentSplit[], total: number): boolean {
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  return Math.abs(sum - total) < 0.01;
}

export enum ItemCondition { SEALED_PACK = 'sealed_pack', OPEN_BOX = 'open_box', SUPER_MINT = 'super_mint', MINT = 'mint', GOOD = 'good' }
export function calculateWarrantyExpiry(firstInvoiceDate: Date, condition: ItemCondition): Date | null {
  const months = condition === ItemCondition.SEALED_PACK ? 12 : (condition === ItemCondition.OPEN_BOX || condition === ItemCondition.SUPER_MINT) ? 6 : null;
  if (!months || !firstInvoiceDate) return null;
  const d = new Date(firstInvoiceDate);
  d.setMonth(d.getMonth() + months);
  return d;
}

// BUG-19: thresholds are configurable via the `settings` table (see
// settings-thresholds.ts). The optional argument keeps the historical
// defaults (5/15% and ₹5000/₹25000) for callers and tests that pass none.
export function getRequiredDiscountRole(
  discountPercent: number,
  thresholds?: { manager: number; owner: number },
): string {
  const manager = thresholds?.manager ?? 5;
  const owner = thresholds?.owner ?? 15;
  if (discountPercent <= manager) return 'sales';
  if (discountPercent <= owner) return 'manager';
  return 'owner';
}

export function getRequiredReturnRole(
  returnAmount: number,
  thresholds?: { manager: number; owner: number },
): string {
  const manager = thresholds?.manager ?? 5000;
  const owner = thresholds?.owner ?? 25000;
  if (returnAmount < manager) return 'any';
  if (returnAmount <= owner) return 'manager';
  return 'owner';
}

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  available: ['sold', 'booked', 'transferred', 'in_cart', 'scrapped'],
  booked: ['sold', 'available'],
  in_cart: ['available', 'sold'],
  transferred: ['available'],
  sold: ['returned'],
  returned: ['available', 'scrapped'],
};

export function isValidStatusTransition(from: string, to: string): boolean {
  return (VALID_STATUS_TRANSITIONS[from] ?? []).includes(to);
}
