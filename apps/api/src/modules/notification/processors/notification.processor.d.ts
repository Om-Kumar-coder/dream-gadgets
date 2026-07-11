import { Job } from 'bullmq';
import { NotificationService } from '../notification.service';
export interface NotificationJobData {
    notificationId: string;
    channel: 'email' | 'sms' | 'whatsapp';
    to: string;
    subject?: string;
    body: string;
}
export declare class NotificationProcessor {
    private readonly notificationService;
    private readonly logger;
    constructor(notificationService: NotificationService);
    process(job: Job<NotificationJobData>): Promise<void>;
    onFailed(job: Job<NotificationJobData>, error: Error): void;
}
//# sourceMappingURL=notification.processor.d.ts.map