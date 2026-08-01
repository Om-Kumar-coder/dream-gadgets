import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt, timingSafeEqual } from 'crypto';
import { RedisService } from '../../../common/redis/redis.service';
import { normalizePhone, formatPhoneWithoutPlus } from '../../../common/utils/phone';

export interface Msg91OtpResult {
  success: boolean;
  status: string;
  error?: string;
  /** Only populated in dev-mode so the frontend can surface it for local testing. */
  otp?: string;
}

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const OTP_LENGTH = 6;
const MAX_OTP_ATTEMPTS = 5;
const MSG91_TIMEOUT_MS = 10_000;

@Injectable()
export class Msg91OtpService {
  private readonly logger = new Logger(Msg91OtpService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Send an OTP via MSG91 SMS.
   * The OTP is generated in our backend and stored in Redis (10-min TTL),
   * then sent via MSG91's OTP API passing our custom OTP value.
   * Falls back to a dev log when MSG91 is not configured.
   */
  async sendOtp(phone: string): Promise<Msg91OtpResult> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    const templateId = this.configService.get<string>('MSG91_TEMPLATE_ID');

    // Generate & store the OTP first so verification works even if SMS fails
    const otp = this.generateOtp();
    const ttl = this.getOtpTtlSeconds();
    const keyPhone = normalizePhone(phone);
    await this.redisService.setOtp(keyPhone, otp, ttl);
    // A fresh OTP resets the brute-force counter (resend shouldn't inherit old failures)
    await this.redisService.clearOtpAttempts(keyPhone);

    if (!authKey || !templateId) {
      // Never silently fall back to dev-mode in production — fail loudly so a
      // misconfigured deployment is obvious instead of leaving users stuck with
      // an OTP that is stored but never delivered.
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(`[MSG91] MSG91 not configured in production — cannot send OTP to ${phone}`);
        await this.redisService.delOtp(keyPhone);
        return {
          success: false,
          status: 'failed',
          error: 'SMS service is not configured',
        };
      }

      this.logger.log(`[DEV] Would send OTP to ${phone}: ${otp}`);
      // Expose the OTP in non-production environments so local/CI testing can
      // complete the flow without real SMS.
      return {
        success: true,
        status: 'dev-mode',
        otp,
      };
    }

    try {
      const mobile = formatPhoneWithoutPlus(phone);
      const params = new URLSearchParams({
        authkey: authKey,
        template_id: templateId,
        mobile,
        otp,
        otp_expiry: String(Math.ceil(ttl / 60)),
        real_time_response: '1',
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), MSG91_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(`https://control.msg91.com/api/v5/otp?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      const data = await response.json().catch(() => ({})) as {
        type?: string;
        message?: string;
        request_id?: string;
      };

      if (data.type === 'success') {
        this.logger.log(`[MSG91] OTP sent to ${mobile}: request_id=${data.request_id}`);
        return { success: true, status: 'sent' };
      }

      this.logger.error(`[MSG91] Failed to send OTP to ${mobile}: ${data.message ?? 'unknown error'}`);
      // Don't leave a valid OTP in Redis that the user never received
      await this.redisService.delOtp(keyPhone);
      return {
        success: false,
        status: 'failed',
        error: data.message ?? 'MSG91 send failed',
      };
    } catch (err: any) {
      this.logger.error(`[MSG91] Failed to send OTP to ${phone}: ${err?.message}`);
      await this.redisService.delOtp(keyPhone);
      return {
        success: false,
        status: 'failed',
        error: err?.message ?? 'Unknown MSG91 error',
      };
    }
  }

  /**
   * Verify an OTP code against the value we generated and stored in Redis.
   * Single-use — the stored OTP is deleted on success.
   * Brute-force protected: max 5 attempts per OTP, then the code is invalidated.
   */
  async verifyOtp(phone: string, code: string): Promise<Msg91OtpResult> {
    const keyPhone = normalizePhone(phone);

    const stored = await this.redisService.getOtp(keyPhone);
    if (!stored) {
      return { success: false, status: 'expired', error: 'OTP expired or not requested' };
    }

    const attempts = await this.redisService.incrementOtpAttempts(keyPhone, this.getOtpTtlSeconds());
    if (attempts > MAX_OTP_ATTEMPTS) {
      await this.redisService.delOtp(keyPhone);
      await this.redisService.clearOtpAttempts(keyPhone);
      return { success: false, status: 'locked', error: 'Too many attempts. Please request a new OTP.' };
    }

    if (!this.codesEqual(stored, code)) {
      return { success: false, status: 'pending', error: 'Invalid OTP' };
    }

    await this.redisService.delOtp(keyPhone);
    await this.redisService.clearOtpAttempts(keyPhone);
    return { success: true, status: 'approved' };
  }

  private generateOtp(): string {
    // Cryptographically random 6-digit code (100000..999999)
    return String(randomInt(100000, 1000000));
  }

  private getOtpTtlSeconds(): number {
    const configured = parseInt(this.configService.get<string>('MSG91_OTP_TTL') ?? '', 10);
    return Number.isFinite(configured) && configured > 0 ? configured : OTP_TTL_SECONDS;
  }

  private codesEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

}
