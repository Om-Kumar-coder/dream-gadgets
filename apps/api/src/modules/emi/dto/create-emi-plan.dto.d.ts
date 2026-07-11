export declare class CreateEmiPlanDto {
    providerId: string;
    label: string;
    tenureMonths: number;
    minAmount?: number;
    maxAmount?: number;
    annualRate: number;
    processingFee?: number;
    isActive?: boolean;
    sortOrder?: number;
}
export declare class UpdateEmiPlanDto {
    label?: string;
    tenureMonths?: number;
    minAmount?: number;
    maxAmount?: number;
    annualRate?: number;
    processingFee?: number;
    isActive?: boolean;
    sortOrder?: number;
}
export declare class EmiQueryDto {
    amount?: number;
    providerSlug?: string;
}
export declare class CalculateEmiDto {
    principal: number;
    tenureMonths: number;
    annualRate: number;
    processingFee?: number;
}
//# sourceMappingURL=create-emi-plan.dto.d.ts.map