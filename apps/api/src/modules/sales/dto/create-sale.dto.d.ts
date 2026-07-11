export declare class SaleItemDto {
    itemId: string;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    hsnCode?: string;
}
export declare class SaleAccessoryItemDto {
    accessoryId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    hsnCode?: string;
}
export declare class PaymentSplitDto {
    method: string;
    amount: number;
    reference?: string;
    note?: string;
    emiPlan?: object;
}
export declare class CreateSaleDto {
    branchId: string;
    clientId?: string;
    items: SaleItemDto[];
    accessoryItems?: SaleAccessoryItemDto[];
    payments: PaymentSplitDto[];
    discountAmount?: number;
    isInterState?: boolean;
    saleType?: string;
    couponCode?: string;
    notes?: string;
}
//# sourceMappingURL=create-sale.dto.d.ts.map