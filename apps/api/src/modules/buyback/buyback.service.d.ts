import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BuybackLead } from './entities/buyback-lead.entity';
import { BuybackPhoto } from './entities/buyback-photo.entity';
import { NotificationService } from '../notification/notification.service';
export interface CreateBuybackLeadDto {
    brand: string;
    modelName: string;
    phone: string;
    deviceType?: string;
    screenCondition?: string;
    bodyCondition?: string;
    batteryHealth?: string;
    functionalIssues?: string;
}
export interface BuybackLeadQuery {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}
export declare class BuybackService {
    private leadRepo;
    private photoRepo;
    private notificationService;
    private configService;
    private readonly logger;
    private readonly notifyEmail;
    private readonly notifyPhone;
    private readonly adminUrl;
    constructor(leadRepo: Repository<BuybackLead>, photoRepo: Repository<BuybackPhoto>, notificationService: NotificationService, configService: ConfigService);
    create(dto: CreateBuybackLeadDto): Promise<BuybackLead>;
    private sendNotifications;
    findAll(query: BuybackLeadQuery): Promise<{
        data: BuybackLead[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(): Promise<{
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
    }>;
    addPhoto(leadId: string, url: string, sortOrder?: number): Promise<BuybackPhoto>;
    getPhotos(leadId: string): Promise<BuybackPhoto[]>;
    findById(id: string): Promise<BuybackLead | null>;
    updateStatus(id: string, status: string, notes?: string): Promise<BuybackLead | null>;
}
//# sourceMappingURL=buyback.service.d.ts.map