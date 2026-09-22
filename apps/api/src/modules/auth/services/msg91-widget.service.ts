import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizePhone } from '../../../common/utils/phone';

export interface Msg91WidgetVerifyResult {
  success: boolean;
  error?: string;
  /** Verified phone in E.164 digits (e.g. '919876543210'), when the identifier is a mobile. */
  phone?: string;
  /** Verified email, when the widget identifier is an email. */
  email?: string;
  /** Raw identifier message reported by MSG91 (best-effort). */
  message?: string;
}

const MSG91_WIDGET_TIMEOUT_MS = 10_000;

/**
 * Server-side verification for MSG91's OTP Widget/SDK.
 *
 * Client flow: the widget (otp-provider.js) sends + verifies the OTP itself and
 * hands the browser a JWT "access token". The frontend posts that token here,
 * and we exchange it with MSG91's verifyAccessToken API using the widget
 * authkey (server-only secret) to learn which phone/email was actually
 * verified. Trust the phone/email from MSG91's response — never values the
 * client typed in alongside the token.
 */
@Injectable()
export class Msg91WidgetService {
  private readonly logger = new Logger(Msg91WidgetService.name);

  constructor(private readonly configService: ConfigService) {}

  async verifyAccessToken(accessToken: string): Promise<Msg91WidgetVerifyResult> {
    const authKey = this.configService.get<string>('MSG91_WIDGET_AUTH_KEY');

    if (!authKey) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.error('[MSG91-Widget] MSG91_WIDGET_AUTH_KEY not configured in production');
        return { success: false, error: 'Widget verification is not configured' };
      }
      // Non-production: log clearly and fail — there is no meaningful way to
      // fake a widget verification locally, tests inject mocks instead.
      this.logger.warn('[MSG91-Widget] MSG91_WIDGET_AUTH_KEY not configured — rejecting token');
      return { success: false, error: 'Widget verification is not configured' };
    }

    // MSG91_VERIFY_URL exists so tests/integration environments can point the
    // exchange at a stub; production uses the default MSG91 endpoint.
    const verifyUrl =
      this.configService.get<string>('MSG91_VERIFY_URL') ??
      'https://control.msg91.com/api/v5/widget/verifyAccessToken';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MSG91_WIDGET_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authkey: authKey,
          'access-token': accessToken,
        }),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeout);
      this.logger.error(`[MSG91-Widget] verifyAccessToken request failed: ${err?.message}`);
      return { success: false, error: 'Could not verify OTP with provider' };
    }
    clearTimeout(timeout);

    const raw = await response.text().catch(() => '');

    if (!response.ok) {
      this.logger.error(
        `[MSG91-Widget] verifyAccessToken HTTP ${response.status}: ${raw.slice(0, 300)}`,
      );
      return { success: false, error: `Widget verification failed (HTTP ${response.status})` };
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      this.logger.error(`[MSG91-Widget] verifyAccessToken returned non-JSON body: ${raw.slice(0, 200)}`);
      return { success: false, error: 'Unexpected response from widget verification' };
    }

    if (data?.type !== 'success') {
      this.logger.warn(
        `[MSG91-Widget] token rejected: ${data?.message ?? 'unknown error'} (HTTP ${response.status})`,
      );
      return { success: false, error: data?.message ?? 'OTP verification failed' };
    }

    const message = typeof data?.message === 'string' ? data.message : undefined;
    const phone = extractPhone(message);
    const email = extractEmail(message);

    if (!phone && !email) {
      this.logger.error(
        `[MSG91-Widget] token accepted but no identifier found in message: ${raw.slice(0, 200)}`,
      );
      return { success: false, error: 'Verified contact details missing from provider response' };
    }

    if (phone) {
      this.logger.log(`[MSG91-Widget] token verified for phone=***${phone.slice(-4)}`);
    } else if (email) {
      this.logger.log(`[MSG91-Widget] token verified for email=${email.replace(/.{2,}@/, '***@')}`);
    }

    return { success: true, phone, email, message };
  }
}

/**
 * Extract a phone number from MSG91's identifier message.
 * Handles common formats: '91xxxxxxxxxx', '+91 98765 43210',
 * 'phone: 919876543210', 'OTP verified for 919876543210', etc.
 */
function extractPhone(message?: string): string | undefined {
  if (!message) return undefined;
  // MSG91 may format the identifier as '+91 98765 43210' — join separator
  // runs that sit between digits (only), so surrounding words stay separate
  // and the country-code-led run matches as a whole.
  const compacted = message.replace(/(?<=\d)[\s().-]+(?=\d)/g, '');
  // Prefer a country-code-led run of digits (10-15 digits total).
  const match = compacted.match(/\b(\d{10,15})\b/);
  if (!match) return undefined;
  const digits = normalizePhone(match[1]);
  // Only treat as a mobile if it plausibly starts with a country code (not 0/1).
  if (/^[2-9]\d{9,14}$/.test(digits)) {
    return digits;
  }
  return undefined;
}

/** Extract an email address from MSG91's identifier message, if present. */
function extractEmail(message?: string): string | undefined {
  if (!message) return undefined;
  const match = message.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match ? match[0].toLowerCase() : undefined;
}
