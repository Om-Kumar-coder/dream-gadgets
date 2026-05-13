export function validateIMEI(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei[i]);
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

export function getRequiredDiscountRole(discountPercent: number): string {
  if (discountPercent <= 5) return 'sales';
  if (discountPercent <= 15) return 'manager';
  return 'owner';
}

export function getRequiredReturnRole(returnAmount: number): string {
  if (returnAmount < 5000) return 'any';
  if (returnAmount <= 25000) return 'manager';
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
