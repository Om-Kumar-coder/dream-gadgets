import { ConfigService } from '@nestjs/config';
export interface TwilioVerifyResult {
    success: boolean;
    status: string;
    error?: string;
}
export declare class TwilioVerifyService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    /**
     * Send an OTP via Twilio Verify service.
     * Falls back to dev log when Twilio Verify is not configured.
     */
    sendOtp(phone: string): Promise<TwilioVerifyResult>;
    /**
     * Verify an OTP code via Twilio Verify service.
     */
    verifyOtp(phone: string, code: string): Promise<TwilioVerifyResult>;
    private formatPhone;
}
//# sourceMappingURL=twilio-verify.service.d.ts.map