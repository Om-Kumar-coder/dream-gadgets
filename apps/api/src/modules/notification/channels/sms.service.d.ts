import { ConfigService } from '@nestjs/config';
export interface SmsDeliveryResult {
    success: boolean;
    providerMessageId: string | null;
    status: 'sent' | 'failed';
    error?: string;
}
export declare class SmsService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    /**
     * Send an SMS via Twilio API.
     * Falls back to dev log when Twilio is not configured.
     * Properly formats Indian (+91) numbers.
     */
    send(to: string, body: string): Promise<SmsDeliveryResult>;
    private formatPhone;
}
//# sourceMappingURL=sms.service.d.ts.map