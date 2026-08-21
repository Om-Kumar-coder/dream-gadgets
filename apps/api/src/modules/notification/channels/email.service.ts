import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailDeliveryResult {
  success: boolean;
  providerMessageId: string | null;
  status: 'sent' | 'failed';
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Send an email via Nodemailer SMTP.
   * Throws on connection/auth failure so callers can handle retries.
   */
  async send(to: string, subject: string, html: string): Promise<EmailDeliveryResult> {
    const smtpHost = this.configService.get<string>('SMTP_HOST');

    if (!smtpHost) {
      // Never silently fall back to dev-mode in production — fail loudly so a
      // misconfigured deployment is obvious instead of faking deliveries.
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(`[Email] SMTP not configured in production — cannot send to ${to}`);
        return {
          success: false,
          providerMessageId: null,
          status: 'failed',
          error: 'SMTP is not configured',
        };
      }
      this.logger.log(`[DEV] Email to ${to}: ${subject}`);
      return {
        success: true,
        providerMessageId: `dev-${Date.now()}`,
        status: 'sent',
      };
    }

    try {
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT') ?? 587,
        secure: String(this.configService.get('SMTP_SECURE') ?? 'false').toLowerCase() === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
        connectionTimeout: 10000, // 10s
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const info = await transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') ?? '"Dream Gadgets" <noreply@dreamgadgets.in>',
        to,
        subject,
        html,
      });

      this.logger.log(`[Email] Sent to ${to}: messageId=${info.messageId}`);
      return {
        success: true,
        providerMessageId: info.messageId ?? `sent-${Date.now()}`,
        status: 'sent',
      };
    } catch (err: any) {
      this.logger.error(`[Email] Failed to send to ${to}: ${err?.message}`);
      return {
        success: false,
        providerMessageId: null,
        status: 'failed',
        error: err?.message ?? 'Unknown SMTP error',
      };
    }
  }
}
