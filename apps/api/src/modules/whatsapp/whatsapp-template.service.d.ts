import { Repository } from 'typeorm';
import { WhatsappTemplate } from './entities/whatsapp-template.entity';
import { WhatsappCampaign } from './entities/whatsapp-campaign.entity';
import { NotificationService } from '../notification/notification.service';
export declare class WhatsappTemplateService {
    private templateRepo;
    private campaignRepo;
    private notificationService;
    private readonly logger;
    constructor(templateRepo: Repository<WhatsappTemplate>, campaignRepo: Repository<WhatsappCampaign>, notificationService: NotificationService);
    createTemplate(dto: Partial<WhatsappTemplate>): Promise<WhatsappTemplate>;
    getTemplates(query: {
        page?: number;
        limit?: number;
        category?: string;
        status?: string;
        search?: string;
    }): Promise<{
        data: WhatsappTemplate[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTemplateById(id: string): Promise<WhatsappTemplate>;
    updateTemplate(id: string, dto: Partial<WhatsappTemplate>): Promise<WhatsappTemplate>;
    deleteTemplate(id: string): Promise<void>;
    createCampaign(dto: Partial<WhatsappCampaign>): Promise<WhatsappCampaign>;
    getCampaigns(query: {
        page?: number;
        limit?: number;
        status?: string;
        type?: string;
        search?: string;
    }): Promise<{
        data: WhatsappCampaign[];
        total: number;
        page: number;
        limit: number;
    }>;
    getCampaignById(id: string): Promise<WhatsappCampaign>;
    updateCampaign(id: string, dto: Partial<WhatsappCampaign>): Promise<WhatsappCampaign>;
    deleteCampaign(id: string): Promise<void>;
    launchCampaign(id: string): Promise<WhatsappCampaign>;
    getCampaignStats(id: string): Promise<{
        total: number;
        sent: number;
        delivered: number;
        read: number;
        failed: number;
        clickRate: number;
        conversionRate: number;
    }>;
}
//# sourceMappingURL=whatsapp-template.service.d.ts.map