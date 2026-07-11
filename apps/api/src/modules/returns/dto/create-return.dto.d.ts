export declare class CreateSaleReturnDto {
    reason: string;
    refundMethod?: string;
    refundAmount?: number;
    conditionAssessment?: 'available' | 'scrapped';
    managerOverride?: boolean;
    approvedById?: string;
}
export declare class CreatePurchaseReturnDto {
    reason: string;
    itemIds?: string[];
    conditionAssessment?: 'available' | 'scrapped';
}
//# sourceMappingURL=create-return.dto.d.ts.map