import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Notification } from './entities/notification.entity';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { WhatsAppService } from './channels/whatsapp.service';
import { EventService } from '../../common/events/event.service';
import { User } from '../auth/entities/user.entity';
export interface NotificationPayload {
    userId?: string;
    clientId?: string;
    type: string;
    subject?: string;
    body?: string;
    templateKey?: string;
    templateVars?: Record<string, string>;
    metadata?: Record<string, any>;
}
export interface DeliveryResult {
    success: boolean;
    providerMessageId: string | null;
    status: 'sent' | 'failed';
    error?: string;
}
export declare class NotificationService {
    private notificationRepo;
    private userRepo;
    private configService;
    private notificationQueue;
    private emailService;
    private smsService;
    private whatsAppService;
    private eventService;
    private readonly logger;
    constructor(notificationRepo: Repository<Notification>, userRepo: Repository<User>, configService: ConfigService, notificationQueue: Queue, emailService: EmailService, smsService: SmsService, whatsAppService: WhatsAppService, eventService: EventService);
    resolveTemplate(templateKey: string, vars?: Record<string, string>): Promise<{
        subject: string;
        body: string;
    }>;
    private substituteVars;
    private formatForChannel;
    sendEmail(payload: NotificationPayload & {
        to: string;
    }): Promise<Notification>;
    sendWhatsApp(payload: NotificationPayload & {
        to: string;
    }): Promise<Notification>;
    sendSms(payload: NotificationPayload & {
        to: string;
    }): Promise<Notification>;
    sendInApp(payload: NotificationPayload): Promise<Notification>;
    private enqueueDelivery;
    processDelivery(notificationId: string, channel: 'email' | 'sms' | 'whatsapp', to: string, subject?: string, body?: string): Promise<DeliveryResult>;
    private deliverDirect;
    private updateDeliveryResult;
    private markDelivered;
    private markFailed;
    private emitNotificationCreated;
    /**
     * Check if a user has enabled the given notification channel.
     * If the user is not found or has no preferences, defaults to enabled.
     */
    private isChannelEnabled;
    private buildContent;
    private createRecord;
    findByUserId(userId: string): Promise<Notification[]>;
    findById(id: string): Promise<Notification | null>;
    findAll(query: {
        page?: number;
        limit?: number;
        status?: string;
        channel?: string;
        userId?: string;
    }): Promise<{
        data: Notification[];
        total: number;
        page: number;
        limit: number;
    }>;
    getFailedNotifications(): Promise<Notification[]>;
    retryFailed(notificationId: string): Promise<Notification>;
    retryAllFailed(): Promise<{
        retried: number;
    }>;
    findUserNotifications(userId: string): Promise<{
        notifications: Notification[];
        unreadCount: number;
    }>;
    markAsRead(id: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
}
//# sourceMappingURL=notification.service.d.ts.map