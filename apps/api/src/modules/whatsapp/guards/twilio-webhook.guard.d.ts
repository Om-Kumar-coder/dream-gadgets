import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Validates incoming Twilio webhook requests by checking the
 * X-Twilio-Signature header against a computed HMAC-SHA1 hash.
 * Falls back to allowing the request in dev mode when Twilio is not configured.
 */
export declare class TwilioWebhookGuard implements CanActivate {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    canActivate(context: ExecutionContext): boolean;
    private buildPayload;
}
//# sourceMappingURL=twilio-webhook.guard.d.ts.map