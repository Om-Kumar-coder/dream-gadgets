import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Validates incoming Twilio webhook requests by checking the
 * X-Twilio-Signature header against a computed HMAC-SHA1 hash.
 * Falls back to allowing the request in dev mode when Twilio is not configured.
 */
@Injectable()
export class TwilioWebhookGuard implements CanActivate {
  private readonly logger = new Logger(TwilioWebhookGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-twilio-signature'] as string | undefined;

    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    // If Twilio is not configured, allow all requests in dev mode
    if (!authToken) {
      this.logger.log('[TwilioWebhook] No TWILIO_AUTH_TOKEN — allowing request (dev mode)');
      return true;
    }

    // If no signature header, check if this might be a Meta Cloud API request instead
    if (!signature) {
      // Allow through — Meta API uses different security (bearer token in webhook URL)
      return true;
    }

    const url = `${request.protocol}://${request.hostname}${request.originalUrl}`;
    const payload = request.body ? this.buildPayload(url, request.body) : url;

    const expectedSignature = crypto
      .createHmac('sha1', authToken)
      .update(payload)
      .digest('base64');

    if (signature !== expectedSignature) {
      this.logger.warn('[TwilioWebhook] Invalid signature — rejecting request');
      return false;
    }

    return true;
  }

  private buildPayload(url: string, body: Record<string, any>): string {
    // Twilio signature validation requires sorted keys
    const sortedKeys = Object.keys(body).sort();
    const params = sortedKeys.map((key) => `${key}${body[key]}`).join('');
    return url + params;
  }
}
