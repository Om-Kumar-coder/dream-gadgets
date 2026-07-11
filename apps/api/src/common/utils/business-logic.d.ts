export declare function validateIMEI(imei: string): boolean;
export declare function calculateExchangePrice(basePrice: number, batteryHealth: number, monthsSinceFirstInvoice: number): number;
export declare function calculateGST(amount: number, taxRate: number, isInterState: boolean): {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
};
export interface PaymentSplit {
    amount: number;
    method: string;
}
export declare function validatePaymentSplits(splits: PaymentSplit[], total: number): boolean;
export declare enum ItemCondition {
    SEALED_PACK = "sealed_pack",
    OPEN_BOX = "open_box",
    SUPER_MINT = "super_mint",
    MINT = "mint",
    GOOD = "good"
}
export declare function calculateWarrantyExpiry(firstInvoiceDate: Date, condition: ItemCondition): Date | null;
export declare function getRequiredDiscountRole(discountPercent: number): string;
export declare function getRequiredReturnRole(returnAmount: number): string;
export declare const VALID_STATUS_TRANSITIONS: Record<string, string[]>;
export declare function isValidStatusTransition(from: string, to: string): boolean;
//# sourceMappingURL=business-logic.d.ts.map