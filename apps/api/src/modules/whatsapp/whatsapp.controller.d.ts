import { WhatsappService } from './whatsapp.service';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappAppointmentService } from './whatsapp-appointment.service';
import { NotificationService } from '../notification/notification.service';
export declare class WhatsappController {
    private readonly whatsappService;
    private readonly whatsappTemplateService;
    private readonly whatsappAppointmentService;
    private readonly notificationService;
    constructor(whatsappService: WhatsappService, whatsappTemplateService: WhatsappTemplateService, whatsappAppointmentService: WhatsappAppointmentService, notificationService: NotificationService);
    getConversations(page?: string, limit?: string, status?: string, type?: string, search?: string): Promise<{
        data: import("./entities/whatsapp-conversation.entity").WhatsappConversation[];
        total: number;
        page: number;
        limit: number;
    }>;
    getConversation(id: string): Promise<import("./entities/whatsapp-conversation.entity").WhatsappConversation>;
    getMessages(id: string, page?: string, limit?: string): Promise<{
        data: import("./entities/whatsapp-message.entity").WhatsappMessage[];
        total: number;
    }>;
    updateConversation(id: string, dto: {
        customerName?: string;
        type?: string;
        status?: string;
        assignedStaffId?: string;
        priority?: string;
        tags?: object;
    }): Promise<import("./entities/whatsapp-conversation.entity").WhatsappConversation>;
    sendMessage(dto: {
        to: string;
        content: string;
        conversationId?: string;
    }, user: any): Promise<{
        status: string;
        notificationId: string;
    }>;
    getStats(): Promise<{
        activeConversations: number;
        unreadCount: number;
    }>;
    getTemplates(page?: string, limit?: string, category?: string, status?: string, search?: string): Promise<{
        data: import("./entities/whatsapp-template.entity").WhatsappTemplate[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTemplate(id: string): Promise<import("./entities/whatsapp-template.entity").WhatsappTemplate>;
    createTemplate(dto: any): Promise<import("./entities/whatsapp-template.entity").WhatsappTemplate>;
    updateTemplate(id: string, dto: any): Promise<import("./entities/whatsapp-template.entity").WhatsappTemplate>;
    deleteTemplate(id: string): Promise<void>;
    getCampaigns(page?: string, limit?: string, status?: string, type?: string, search?: string): Promise<{
        data: import("./entities/whatsapp-campaign.entity").WhatsappCampaign[];
        total: number;
        page: number;
        limit: number;
    }>;
    getCampaign(id: string): Promise<import("./entities/whatsapp-campaign.entity").WhatsappCampaign>;
    createCampaign(dto: any): Promise<import("./entities/whatsapp-campaign.entity").WhatsappCampaign>;
    updateCampaign(id: string, dto: any): Promise<import("./entities/whatsapp-campaign.entity").WhatsappCampaign>;
    deleteCampaign(id: string): Promise<void>;
    launchCampaign(id: string): Promise<import("./entities/whatsapp-campaign.entity").WhatsappCampaign>;
    getCampaignStats(id: string): Promise<{
        total: number;
        sent: number;
        delivered: number;
        read: number;
        failed: number;
        clickRate: number;
        conversionRate: number;
    }>;
    getAppointments(page?: string, limit?: string, status?: string, type?: string, phone?: string): Promise<{
        data: import("./entities/whatsapp-appointment.entity").WhatsappAppointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    createAppointment(dto: any): Promise<import("./entities/whatsapp-appointment.entity").WhatsappAppointment>;
    updateAppointment(id: string, dto: {
        status: string;
    }): Promise<import("./entities/whatsapp-appointment.entity").WhatsappAppointment>;
}
//# sourceMappingURL=whatsapp.controller.d.ts.map