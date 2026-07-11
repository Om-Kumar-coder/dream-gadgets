import { BuybackService } from './buyback.service';
declare class CreateBuybackLeadDto {
    brand: string;
    modelName: string;
    phone: string;
    deviceType?: string;
    screenCondition?: string;
    bodyCondition?: string;
    batteryHealth?: string;
    functionalIssues?: string;
}
declare class UpdateBuybackLeadDto {
    status: string;
    notes?: string;
}
export declare class BuybackController {
    private readonly buybackService;
    constructor(buybackService: BuybackService);
    create(dto: CreateBuybackLeadDto): Promise<{
        data: {
            id: string;
            message: string;
        };
    }>;
    uploadPhoto(id: string, file: {
        filename: string;
    }): Promise<{
        status: string;
        data: {
            id: string;
            url: string;
        };
    }>;
    getStats(): Promise<{
        status: string;
        data: {
            total: number;
            byStatus: {
                status: string;
                count: number;
            }[];
            byScreenCondition: {
                value: string;
                count: number;
            }[];
            byBodyCondition: {
                value: string;
                count: number;
            }[];
            byBatteryHealth: {
                value: string;
                count: number;
            }[];
            weeklyTrend: {
                date: string;
                count: number;
            }[];
        };
    }>;
    findAll(query: {
        page?: string;
        limit?: string;
        status?: string;
        search?: string;
    }): Promise<{
        data: import("./entities/buyback-lead.entity").BuybackLead[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<{
        data: import("./entities/buyback-lead.entity").BuybackLead;
    }>;
    updateStatus(id: string, dto: UpdateBuybackLeadDto): Promise<{
        data: import("./entities/buyback-lead.entity").BuybackLead;
    }>;
}
export {};
//# sourceMappingURL=buyback.controller.d.ts.map