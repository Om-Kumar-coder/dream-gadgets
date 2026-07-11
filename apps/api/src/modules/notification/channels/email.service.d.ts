import { ConfigService } from '@nestjs/config';
export interface EmailDeliveryResult {
    success: boolean;
    providerMessageId: string | null;
    status: 'sent' | 'failed';
    error?: string;
}
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    /**
     * Send an email via Nodemailer SMTP.
     * Throws on connection/auth failure so callers can handle retries.
     */
    send(to: string, subject: string, html: string): Promise<EmailDeliveryResult>;
}
//# sourceMappingURL=email.service.d.ts.map