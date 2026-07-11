import { Repository } from 'typeorm';
import { EmiProvider, EmiPlan } from './emi.entity';
export declare class EmiService {
    private providerRepo;
    private planRepo;
    private readonly logger;
    constructor(providerRepo: Repository<EmiProvider>, planRepo: Repository<EmiPlan>);
    /**
     * Calculate monthly EMI amount using standard formula.
     * EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]
     * where P = principal, r = monthly interest rate, n = number of months
     */
    static calculateEMI(principal: number, annualRate: number, tenureMonths: number, processingFee?: number): {
        emiAmount: number;
        totalInterest: number;
        totalPayment: number;
        effectivePrincipal: number;
    };
    /**
     * Get all eligible EMI plans for a given amount.
     * Filters by min_amount/max_amount and sorts by sort_order.
     */
    getEligiblePlans(amount?: number, providerSlug?: string): Promise<{
        emiAmount: number;
        totalInterest: number;
        totalPayment: number;
        effectivePrincipal: number;
        id: string;
        providerId: string;
        providerName: any;
        providerSlug: any;
        label: string;
        tenureMonths: number;
        annualRate: number;
        processingFee: number;
        minAmount: number;
    }[]>;
    /**
     * Calculate EMI for a specific principal, tenure, and rate.
     */
    calculate(dto: {
        principal: number;
        tenureMonths: number;
        annualRate: number;
        processingFee?: number;
    }): Promise<{
        emiAmount: number;
        totalInterest: number;
        totalPayment: number;
        effectivePrincipal: number;
    }>;
    getProviders(): Promise<EmiProvider[]>;
    getProviderById(id: string): Promise<EmiProvider>;
    createProvider(dto: {
        name: string;
        slug: string;
        description?: string;
        logoUrl?: string;
        isActive?: boolean;
        sortOrder?: number;
    }): Promise<EmiProvider>;
    updateProvider(id: string, dto: Partial<{
        name: string;
        description: string;
        logoUrl: string;
        isActive: boolean;
        sortOrder: number;
    }>): Promise<EmiProvider>;
    deleteProvider(id: string): Promise<void>;
    getPlans(providerId?: string, activeOnly?: boolean): Promise<EmiPlan[]>;
    getPlanById(id: string): Promise<EmiPlan>;
    createPlan(dto: {
        providerId: string;
        label: string;
        tenureMonths: number;
        minAmount?: number;
        maxAmount?: number;
        annualRate: number;
        processingFee?: number;
        isActive?: boolean;
        sortOrder?: number;
    }): Promise<EmiPlan>;
    updatePlan(id: string, dto: Partial<{
        label: string;
        tenureMonths: number;
        minAmount: number;
        maxAmount: number;
        annualRate: number;
        processingFee: number;
        isActive: boolean;
        sortOrder: number;
    }>): Promise<EmiPlan>;
    deletePlan(id: string): Promise<void>;
}
//# sourceMappingURL=emi.service.d.ts.map