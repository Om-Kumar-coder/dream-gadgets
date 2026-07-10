import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TwilioVerifyResult {
  success: boolean;
  status: string;
  error?: string;
}

@Injectable()
export class TwilioVerifyService {
  private readonly logger = new Logger(TwilioVerifyService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Send an OTP via Twilio Verify service.
   * Falls back to dev log when Twilio Verify is not configured.
   */
  async sendOtp(phone: string): Promise<TwilioVerifyResult> {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const serviceSid = this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID');

    if (!accountSid || !authToken || !serviceSid) {
      this.logger.log(`[DEV] Would send OTP to ${phone} via Twilio Verify`);
      return { success: true, status: 'dev-mode' };
    }

    try {
      const formattedTo = this.formatPhone(phone);
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      const verification = await client.verify.v2
        .services(serviceSid)
        .verifications.create({
          to: formattedTo,
          channel: 'sms',
        });

      this.logger.log(`[Twilio Verify] OTP sent to ${formattedTo}: sid=${verification.sid}, status=${verification.status}`);
      return { success: true, status: verification.status };
    } catch (err: any) {
      this.logger.error(`[Twilio Verify] Failed to send OTP to ${phone}: ${err?.message}`);
      return {
        success: false,
        status: 'failed',
        error: err?.message ?? 'Unknown Twilio Verify error',
      };
    }
  }

  /**
   * Verify an OTP code via Twilio Verify service.
   */
  async verifyOtp(phone: string, code: string): Promise<TwilioVerifyResult> {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const serviceSid = this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID');

    if (!accountSid || !authToken || !serviceSid) {
      this.logger.log(`[DEV] Would verify OTP for ${phone} with code ${code}`);
      // In dev mode, accept any 6-digit code
      if (code.length === 6 && /^\d{6}$/.test(code)) {
        return { success: true, status: 'approved' };
      }
      return { success: false, status: 'pending', error: 'Invalid code format' };
    }

    try {
      const formattedTo = this.formatPhone(phone);
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      const check = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({
          to: formattedTo,
          code,
        });

      if (check.status === 'approved') {
        this.logger.log(`[Twilio Verify] OTP verified for ${formattedTo}`);
        return { success: true, status: check.status };
      }

      this.logger.warn(`[Twilio Verify] OTP verification failed for ${formattedTo}: status=${check.status}`);
      return { success: false, status: check.status, error: `Verification ${check.status}` };
    } catch (err: any) {
      this.logger.error(`[Twilio Verify] Failed to verify OTP for ${phone}: ${err?.message}`);
      return {
        success: false,
        status: 'failed',
        error: err?.message ?? 'Unknown Twilio Verify error',
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
