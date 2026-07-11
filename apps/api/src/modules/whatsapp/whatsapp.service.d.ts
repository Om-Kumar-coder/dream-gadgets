import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { WhatsappConversation } from './entities/whatsapp-conversation.entity';
import { WhatsappMessage } from './entities/whatsapp-message.entity';
export interface CreateConversationDto {
    customerPhone: string;
    customerName?: string;
    type?: string;
    metadata?: Record<string, any>;
}
export interface StoreMessageDto {
    conversationId: string;
    direction: 'inbound' | 'outbound';
    fromNumber: string;
    toNumber: string;
    content?: string;
    contentType?: string;
    mediaUrl?: string;
    mediaMimeType?: string;
    mediaFilename?: string;
    status?: string;
    providerMessageId?: string;
    metadata?: Record<string, any>;
}
export declare class WhatsappService {
    private conversationRepo;
    private messageRepo;
    private dataSource;
    private configService;
    private readonly logger;
    constructor(conversationRepo: Repository<WhatsappConversation>, messageRepo: Repository<WhatsappMessage>, dataSource: DataSource, configService: ConfigService);
    /**
     * Verify the WhatsApp webhook challenge (used by Twilio/WhatsApp Business API).
     * Returns the challenge string if the verify token matches.
     */
    verifyWebhook(mode: string | undefined, challenge: string | undefined, verifyToken: string | undefined): string | null;
    /**
     * Process an incoming message from the WhatsApp Business API webhook.
     * Creates or updates the conversation and stores the message.
     */
    handleIncoming(payload: any): Promise<void>;
    private handleTwilioIncoming;
    private handleMetaIncoming;
    findOrCreateConversation(dto: CreateConversationDto): Promise<WhatsappConversation>;
    storeMessage(dto: StoreMessageDto): Promise<WhatsappMessage>;
    getConversations(query: {
        page?: number;
        limit?: number;
        status?: string;
        type?: string;
        assignedStaffId?: string;
        search?: string;
    }): Promise<{
        data: WhatsappConversation[];
        total: number;
        page: number;
        limit: number;
    }>;
    getConversationById(id: string): Promise<WhatsappConversation>;
    getMessages(conversationId: string, page?: number, limit?: number): Promise<{
        data: WhatsappMessage[];
        total: number;
    }>;
    updateConversation(id: string, dto: Partial<{
        customerName: string;
        type: string;
        status: string;
        assignedStaffId: string;
        priority: string;
        tags: object;
    }>): Promise<WhatsappConversation>;
    getConversationCount(status?: string): Promise<number>;
    getUnreadCount(staffId?: string): Promise<number>;
    private mapMediaType;
}
//# sourceMappingURL=whatsapp.service.d.ts.map