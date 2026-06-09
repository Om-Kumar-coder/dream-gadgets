import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsDeliveryResult {
  success: boolean;
  providerMessageId: string | null;
  status: 'sent' | 'failed';
  error?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Send an SMS via Twilio API.
   * Falls back to dev log when Twilio is not configured.
   * Properly formats Indian (+91) numbers.
   */
  async send(to: string, body: string): Promise<SmsDeliveryResult> {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      this.logger.log(`[DEV] SMS to ${to}: ${body}`);
      return {
        success: true,
        providerMessageId: `dev-${Date.now()}`,
        status: 'sent',
      };
    }

    try {
      const formattedTo = this.formatPhone(to);
      const from = this.configService.get<string>('TWILIO_SMS_FROM') ?? '+15005550006'; // Twilio test number

      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        from,
        to: formattedTo,
        body,
      });

      this.logger.log(`[SMS] Sent to ${formattedTo}: sid=${message.sid}, status=${message.status}`);
      return {
        success: true,
        providerMessageId: message.sid,
        status: 'sent',
      };
    } catch (err: any) {
      this.logger.error(`[SMS] Failed to send to ${to}: ${err?.message}`);
      return {
        success: false,
        providerMessageId: null,
        status: 'failed',
        error: err?.message ?? 'Unknown SMS error',
      };
    }
  }

  private formatPhone(phone: string): string {
    // Strip non-digits
    let digits = phone.replace(/\D/g, '');
    // If 10-digit Indian number, prepend +91
    if (digits.length === 10) {
      digits = `91${digits}`;
    }
    // Ensure + prefix
    if (!digits.startsWith('+')) {
      digits = `+${digits}`;
    }
    return digits;
  }
}
