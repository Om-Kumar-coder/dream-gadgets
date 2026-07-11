import { ConfigService } from '@nestjs/config';
export interface WhatsAppDeliveryResult {
    success: boolean;
    providerMessageId: string | null;
    status: 'sent' | 'failed';
    error?: string;
}
export declare class WhatsAppService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    /**
     * Send a WhatsApp message via Twilio API.
     * Falls back to dev log when Twilio is not configured.
     * Properly formats Indian (+91) numbers with whatsapp: prefix.
     */
    send(to: string, body: string): Promise<WhatsAppDeliveryResult>;
    private formatWhatsAppPhone;
}
//# sourceMappingURL=whatsapp.service.d.ts.map