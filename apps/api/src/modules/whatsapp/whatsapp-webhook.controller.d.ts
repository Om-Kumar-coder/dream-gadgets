import { WhatsappService } from './whatsapp.service';
/**
 * Public webhook endpoints for WhatsApp Business API (Twilio/Meta).
 * - GET: Webhook verification challenge
 * - POST: Incoming messages and delivery receipts
 */
export declare class WhatsappWebhookController {
    private readonly whatsappService;
    private readonly logger;
    constructor(whatsappService: WhatsappService);
    /**
     * Webhook verification challenge.
     * WhatsApp Business API / Twilio sends a GET request with a challenge token
     * during initial webhook setup. We must echo the challenge back.
     */
    verifyWebhook(mode: string, challenge: string, verifyToken: string): string;
    /**
     * Alternative verification format used by some providers.
     */
    verifyEndpoint(mode: string, challenge: string, verifyToken: string): string;
    /**
     * Receive incoming messages and delivery status updates.
     * Supports both Twilio and Meta Cloud API payload formats.
     */
    receiveMessage(payload: any): Promise<{
        status: string;
    }>;
}
//# sourceMappingURL=whatsapp-webhook.controller.d.ts.map