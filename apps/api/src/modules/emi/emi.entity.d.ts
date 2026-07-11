export declare class EmiProvider {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    plans: EmiPlan[];
}
export declare class EmiPlan {
    id: string;
    providerId: string;
    provider: EmiProvider;
    label: string;
    tenureMonths: number;
    minAmount: number;
    maxAmount: number | null;
    annualRate: number;
    processingFee: number;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=emi.entity.d.ts.map