import { EmiService } from './emi.service';
import { CreateEmiProviderDto, UpdateEmiProviderDto } from './dto/create-emi-provider.dto';
import { CreateEmiPlanDto, UpdateEmiPlanDto, CalculateEmiDto } from './dto/create-emi-plan.dto';
export declare class EmiController {
    private readonly emiService;
    constructor(emiService: EmiService);
    getEligiblePlans(amount?: string, providerSlug?: string): Promise<{
        data: {
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
        }[];
    }>;
    calculateEmi(dto: CalculateEmiDto): Promise<{
        data: {
            emiAmount: number;
            totalInterest: number;
            totalPayment: number;
            effectivePrincipal: number;
        };
    }>;
    getProviders(): Promise<{
        data: import("./emi.entity").EmiProvider[];
    }>;
    getProvider(id: string): Promise<{
        data: import("./emi.entity").EmiProvider;
    }>;
    createProvider(dto: CreateEmiProviderDto): Promise<{
        data: import("./emi.entity").EmiProvider;
    }>;
    updateProvider(id: string, dto: UpdateEmiProviderDto): Promise<{
        data: import("./emi.entity").EmiProvider;
    }>;
    deleteProvider(id: string): Promise<void>;
    getPlans(providerId?: string): Promise<{
        data: import("./emi.entity").EmiPlan[];
    }>;
    getPlan(id: string): Promise<{
        data: import("./emi.entity").EmiPlan;
    }>;
    createPlan(dto: CreateEmiPlanDto): Promise<{
        data: import("./emi.entity").EmiPlan;
    }>;
    updatePlan(id: string, dto: UpdateEmiPlanDto): Promise<{
        data: import("./emi.entity").EmiPlan;
    }>;
    deletePlan(id: string): Promise<void>;
}
//# sourceMappingURL=emi.controller.d.ts.map