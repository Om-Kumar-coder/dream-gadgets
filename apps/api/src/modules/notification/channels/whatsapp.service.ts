import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatE164Phone } from '../../../common/utils/phone';

export interface WhatsAppDeliveryResult {
  success: boolean;
  providerMessageId: string | null;
  status: 'sent' | 'failed';
  error?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Send a WhatsApp message via Twilio API.
   * Falls back to dev log when Twilio is not configured.
   * Properly formats Indian (+91) numbers with whatsapp: prefix.
   */
  async send(to: string, body: string): Promise<WhatsAppDeliveryResult> {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      this.logger.log(`[DEV] WhatsApp to ${to}: ${body}`);
      return {
        success: true,
        providerMessageId: `dev-${Date.now()}`,
        status: 'sent',
      };
    }

    try {
      const formattedTo = formatE164Phone(to);
      const from = this.configService.get<string>('TWILIO_WHATSAPP_FROM') ?? '+14155238886'; // Twilio WhatsApp sandbox

      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        from: `whatsapp:${from}`,
        to: `whatsapp:${formattedTo}`,
        body,
      });

      this.logger.log(`[WhatsApp] Sent to ${formattedTo}: sid=${message.sid}, status=${message.status}`);
      return {
        success: true,
        providerMessageId: message.sid,
        status: 'sent',
      };
    } catch (err: any) {
      this.logger.error(`[WhatsApp] Failed to send to ${to}: ${err?.message}`);
      return {
        success: false,
        providerMessageId: null,
        status: 'failed',
        error: err?.message ?? 'Unknown WhatsApp error',
      };
    }
  }
}
