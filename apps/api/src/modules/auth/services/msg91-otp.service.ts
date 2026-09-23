import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt, timingSafeEqual } from 'crypto';
import { RedisService } from '../../../common/redis/redis.service';
import {
  normalizePhone,
  normalizeAndValidatePhone,
  formatPhoneWithoutPlus,
} from '../../../common/utils/phone';

export interface Msg91OtpResult {
  success: boolean;
  status: string;
  error?: string;
  /** Delivery channel actually used (when sent via the provider). */
  channel?: 'whatsapp' | 'sms';
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
    // Validate early so we return an actionable error instead of a generic
    // "Failed to send OTP" when the number is malformed or missing a country code.
    // Uses the shared util: bare 10-digit numbers are treated as Indian (+91).
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeAndValidatePhone(phone).digits;
    } catch (err: any) {
      this.logger.warn(`[MSG91] Rejected OTP request for invalid phone "${phone}": ${err?.message}`);
      return {
        success: false,
        status: 'failed',
        error: err?.message ?? 'Invalid phone number',
      };
    }

    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    const templateId = this.configService.get<string>('MSG91_TEMPLATE_ID');

    // Do not generate/spend an OTP until we know the provider is configured.
    // Generating first leaves a valid OTP in Redis that the user never receives.
    if (!authKey || !templateId) {
      // Never silently fall back to dev-mode in production — fail loudly so a
      // misconfigured deployment is obvious instead of leaving users stuck with
      // an OTP that is stored but never delivered.
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(`[MSG91] MSG91 not configured in production — cannot send OTP to ${normalizedPhone}`);
        return {
          success: false,
          status: 'failed',
          error: 'SMS service is not configured',
        };
      }

      // Expose the OTP only in non-production environments so local/CI testing
      // can complete the flow without real SMS.
      const otp = this.generateOtp();
      const ttl = this.getOtpTtlSeconds();
      await this.redisService.setOtp(normalizedPhone, otp, ttl);
      await this.redisService.clearOtpAttempts(normalizedPhone);
      this.logger.log(`[DEV] Would send OTP to ${normalizedPhone}: ${otp}`);
      return {
        success: true,
        status: 'dev-mode',
        otp,
      };
    }

    // Prevent rapid repeated requests from hammering the provider and confusing
    // the user with rate-limit failures after each typed character.
    const keyPhone = normalizedPhone;
    const resendCooldownSeconds = parseInt(this.configService.get<string>('OTP_RESEND_COOLDOWN_SECONDS') ?? '', 10) || 10;
    try {
      const existingAttempts = await this.redisService.get(`otp:resend:${keyPhone}`);
      if (existingAttempts) {
        return {
          success: false,
          status: 'failed',
          error: `Please wait ${resendCooldownSeconds}s before requesting another OTP`,
        };
      }
      await this.redisService.set(`otp:resend:${keyPhone}`, '1', { EX: resendCooldownSeconds });
    } catch {
      // Redis unavailable during cooldown check is not a hard block — log and continue.
      this.logger.warn(`[MSG91] Could not check resend cooldown for ${normalizedPhone}`);
    }

    // Generate & store the OTP only when we are about to send.
    const otp = this.generateOtp();
    const ttl = this.getOtpTtlSeconds();
    await this.redisService.setOtp(keyPhone, otp, ttl);
    // A fresh OTP resets the brute-force counter (resend shouldn't inherit old failures)
    await this.redisService.clearOtpAttempts(keyPhone);

    const mobile = formatPhoneWithoutPlus(normalizedPhone);

    // WhatsApp-first delivery (roughly a third of the SMS cost per MSG91),
    // falling back to the DLT SMS template when WhatsApp is disabled,
    // misconfigured or the send fails. Same OTP value for both channels —
    // verification is channel-agnostic (Redis).
    if (this.isWhatsappOtpEnabled()) {
      const wa = await this.sendWhatsappOtp(mobile, otp);
      if (wa.success) {
        this.logger.log(
          `[MSG91] OTP sent via WhatsApp to ${mobile}: request_id=${wa.requestId ?? 'n/a'}`,
        );
        return { success: true, status: 'sent', channel: 'whatsapp' };
      }
      this.logger.warn(
        `[MSG91] WhatsApp OTP to ${mobile} failed (${wa.error ?? 'unknown'}) — falling back to SMS`,
      );
    }

    try {
      // MSG91 caps otp_expiry at 15 minutes; clamp to keep Redis TTL and
      // MSG91 expiry in sync even if MSG91_OTP_TTL is misconfigured.
      const expiryMinutes = Math.min(15, Math.max(1, Math.ceil(ttl / 60)));
      const params = new URLSearchParams({
        authkey: authKey,
        template_id: templateId,
        mobile,
        otp,
        otp_expiry: String(expiryMinutes),
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

      if (!response.ok) {
        // Distinguish transport/auth failures (HTTP error + non-JSON body)
        // from MSG91-level template errors.
        const raw = await response.text().catch(() => '');
        this.logger.error(
          `[MSG91] HTTP ${response.status} sending OTP to ${mobile}: ${raw.slice(0, 300)}`,
        );
        await this.redisService.delOtp(keyPhone);
        return {
          success: false,
          status: 'failed',
          error: `SMS provider returned HTTP ${response.status}`,
        };
      }

      const data = await response.json().catch(() => ({})) as {
        type?: string;
        message?: string;
        request_id?: string;
      };

      if (data.type === 'success') {
        this.logger.log(`[MSG91] OTP sent via SMS to ${mobile}: request_id=${data.request_id}`);
        return { success: true, status: 'sent', channel: 'sms' };
      }

      this.logger.error(
        `[MSG91] Failed to send OTP to ${mobile}: ${data.message ?? 'unknown error'}` +
          (data.request_id ? ` (request_id=${data.request_id})` : ''),
      );
      // Don't leave a valid OTP in Redis that the user never received
      await this.redisService.delOtp(keyPhone);
      return {
        success: false,
        status: 'failed',
        error: data.message ?? 'SMS provider failed to send OTP',
      };
    } catch (err: any) {
      this.logger.error(`[MSG91] Failed to send OTP to ${normalizedPhone}: ${err?.message}`);
      await this.redisService.delOtp(keyPhone);
      return {
        success: false,
        status: 'failed',
        error: err?.message ?? 'SMS provider request failed',
      };
    }
  }

  /**
   * Send the OTP over WhatsApp using MSG91's WhatsApp outbound API with an
   * approved authentication template. The OTP is injected into the template's
   * first body variable and its copy-code/URL button (the layout MSG91's OTP
   * template builder produces). Delivery here is best-effort: the caller falls
   * back to SMS on any failure, so failures must NOT clear the stored OTP.
   */
  private async sendWhatsappOtp(
    mobile: string,
    otp: string,
  ): Promise<{ success: boolean; error?: string; requestId?: string }> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    const integratedNumber = this.configService.get<string>('MSG91_WHATSAPP_INTEGRATED_NUMBER');
    const templateName = this.configService.get<string>('MSG91_WHATSAPP_TEMPLATE_NAME');
    const namespace = this.configService.get<string>('MSG91_WHATSAPP_NAMESPACE');
    const language =
      this.configService.get<string>('MSG91_WHATSAPP_TEMPLATE_LANG') || 'en';

    if (!authKey || !integratedNumber || !templateName) {
      return { success: false, error: 'WhatsApp OTP not fully configured' };
    }

    const template: Record<string, unknown> = {
      name: templateName,
      language: { code: language, policy: 'deterministic' },
      to_and_components: [
        {
          to: [mobile],
          components: {
            body_1: { type: 'text', value: otp },
            button_1: { subtype: 'url', type: 'text', value: otp },
          },
        },
      ],
    };
    if (namespace) template.namespace = namespace;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MSG91_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(
        'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', authkey: authKey },
          body: JSON.stringify({
            integrated_number: integratedNumber,
            content_type: 'template',
            payload: {
              messaging_product: 'whatsapp',
              type: 'template',
              template,
            },
          }),
          signal: controller.signal,
        },
      );
    } catch (err: any) {
      clearTimeout(timeout);
      return { success: false, error: err?.message ?? 'WhatsApp request failed' };
    }
    clearTimeout(timeout);

    const raw = await response.text().catch(() => '');
    if (!response.ok) {
      return {
        success: false,
        error: `WhatsApp API returned HTTP ${response.status}: ${raw.slice(0, 200)}`,
      };
    }

    let data: any;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }
    // MSG91 v5 endpoints signal success via `type` or `status`; treat anything
    // else as a failure so the SMS fallback always fires when unsure.
    if (data?.type !== 'success' && data?.status !== 'success') {
      return {
        success: false,
        error: data?.message ?? `Unexpected WhatsApp API response: ${raw.slice(0, 200)}`,
      };
    }
    return { success: true, requestId: data?.request_id };
  }

  /** WhatsApp-first delivery is opt-in via MSG91_WHATSAPP_ENABLED=true. */
  private isWhatsappOtpEnabled(): boolean {
    const flag = this.configService.get<string>('MSG91_WHATSAPP_ENABLED');
    return (flag ?? '').toLowerCase() === 'true';
  }

  /**
   * Verify an OTP code against the value we generated and stored in Redis.
   * Single-use — the stored OTP is deleted on success.
   * Brute-force protected: max 5 attempts per OTP, then the code is invalidated.
   */
  async verifyOtp(phone: string, code: string): Promise<Msg91OtpResult> {
    // MUST match sendOtp's keying: normalized E.164 digits ('919876543210').
    // A bare 10-digit input ('9876543210') is Indian +91 → same Redis key.
    let keyPhone: string;
    try {
      keyPhone = normalizeAndValidatePhone(phone).digits;
    } catch (err: any) {
      this.logger.warn(`[MSG91] Rejected OTP verification for invalid phone "${phone}": ${err?.message}`);
      return { success: false, status: 'expired', error: err?.message ?? 'Invalid phone number' };
    }

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
