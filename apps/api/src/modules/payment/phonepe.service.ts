import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';

export interface PhonePeInitiateParams {
  amount: number;           // in paise (INR * 100)
  merchantTransactionId: string;
  merchantUserId?: string;
  mobileNumber?: string;
  redirectUrl: string;
  callbackUrl?: string;
}

export interface PhonePeInitiateResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantTransactionId: string;
    instrumentResponse: {
      type: string;
      redirectInfo: {
        url: string;
        method: string;
      };
    };
  };
}

export interface PhonePeStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantTransactionId: string;
    transactionId: string | null;
    amount: number;
    state: string;
    responseCode: string;
    paymentInstrument?: {
      type: string;
      pgTransactionId?: string;
      pgServiceTransactionId?: string;
      bankTransactionId?: string;
      bankId?: string;
    };
  };
}

export interface PhonePeRefundResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
  };
}

@Injectable()
export class PhonePeService {
  private readonly logger = new Logger(PhonePeService.name);
  private readonly baseUrl: string;
  private readonly merchantId: string;
  private readonly saltKey: string;
  private readonly saltIndex: number;

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('PHONEPE_MERCHANT_ID') ?? '';
    this.saltKey = this.configService.get<string>('PHONEPE_SALT_KEY') ?? '';
    this.saltIndex = Number(this.configService.get<string>('PHONEPE_SALT_INDEX') ?? '1');
    const env = this.configService.get<string>('PHONEPE_ENV') ?? 'uat';

    this.baseUrl = env === 'production' || env === 'prod'
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  }

  get isConfigured(): boolean {
    return !!(this.merchantId && this.saltKey);
  }

  // ─── Checksum Generation ─────────────────────────────────────────────────────

  generateChecksum(base64Payload: string, apiEndpoint: string): string {
    const stringToHash = base64Payload + apiEndpoint + this.saltKey;
    const sha256 = createHash('sha256')
      .update(stringToHash)
      .digest('hex');
    return `${sha256}###${this.saltIndex}`;
  }

  verifyChecksum(base64Payload: string, apiEndpoint: string, expectedSignature: string): boolean {
    const computed = this.generateChecksum(base64Payload, apiEndpoint);
    // Expected signature format: SHA256###saltIndex (for callbacks)
    // We compare the SHA256 part
    const actualSha = computed.split('###')[0];
    const expectedSha = expectedSignature.split('###')[0];
    // Also try direct comparison
    return actualSha === expectedSha || computed === expectedSignature;
  }

  // ─── Payment Initiation ──────────────────────────────────────────────────────

  async initiatePayment(params: PhonePeInitiateParams): Promise<{ redirectUrl: string; merchantTransactionId: string }> {
    if (!this.isConfigured) {
      this.logger.warn('[PhonePe] Not configured — returning mock redirect URL for development');
      return {
        redirectUrl: this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001') + '/orders/payment-mock',
        merchantTransactionId: params.merchantTransactionId,
      };
    }

    const endpoint = '/pg/v1/pay';
    const payload = {
      merchantId: this.merchantId,
      merchantTransactionId: params.merchantTransactionId,
      merchantUserId: params.merchantUserId ?? `user_${Date.now()}`,
      amount: params.amount,
      redirectUrl: params.redirectUrl,
      redirectMode: 'POST',
      callbackUrl: params.callbackUrl ?? params.redirectUrl,
      mobileNumber: params.mobileNumber ?? '',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = this.generateChecksum(base64Payload, endpoint);
    const url = `${this.baseUrl}${endpoint}`;

    this.logger.log(`[PhonePe] Initiating payment: ${params.merchantTransactionId}, amount=${params.amount}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        body: JSON.stringify({ request: base64Payload }),
      });

      const json: PhonePeInitiateResponse = await response.json();
      this.logger.log(`[PhonePe] Initiate response: ${JSON.stringify({ success: json.success, code: json.code })}`);

      if (!json.success || !json.data?.instrumentResponse?.redirectInfo?.url) {
        throw new BadRequestException({
          code: 'PHONEPE_INITIATE_FAILED',
          message: json.message ?? 'Failed to initiate PhonePe payment',
        });
      }

      return {
        redirectUrl: json.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId: json.data.merchantTransactionId,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`[PhonePe] Initiate failed: ${err?.message}`);
      throw new BadRequestException({
        code: 'PHONEPE_INITIATE_FAILED',
        message: err?.message ?? 'Failed to initiate PhonePe payment',
      });
    }
  }

  // ─── Payment Status Check ────────────────────────────────────────────────────

  async checkPaymentStatus(merchantTransactionId: string): Promise<PhonePeStatusResponse['data']> {
    if (!this.isConfigured) {
      this.logger.warn(`[PhonePe] Not configured — returning mock status for ${merchantTransactionId}`);
      return {
        merchantTransactionId,
        transactionId: `mock_txn_${Date.now()}`,
        amount: 0,
        state: 'COMPLETED',
        responseCode: 'SUCCESS',
      };
    }

    const endpoint = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
    const checksum = this.generateChecksum('', endpoint);
    const url = `${this.baseUrl}${endpoint}`;

    this.logger.log(`[PhonePe] Checking status: ${merchantTransactionId}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': this.merchantId,
        },
      });

      const json: PhonePeStatusResponse = await response.json();
      this.logger.log(`[PhonePe] Status response: ${JSON.stringify({ success: json.success, code: json.code, state: json.data?.state })}`);

      if (!json.success || !json.data) {
        throw new BadRequestException({
          code: 'PHONEPE_STATUS_FAILED',
          message: json.message ?? 'Failed to check PhonePe payment status',
        });
      }

      return json.data;
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`[PhonePe] Status check failed: ${err?.message}`);
      throw new BadRequestException({
        code: 'PHONEPE_STATUS_FAILED',
        message: err?.message ?? 'Failed to check PhonePe payment status',
      });
    }
  }

  // ─── Process Redirect Callback ──────────────────────────────────────────────

  async processRedirectCallback(body: {
    merchantId: string;
    transactionId: string;
    code?: string;
  }): Promise<{ merchantTransactionId: string; status: string }> {
    // After PhonePe redirects, the frontend will hit our redirect endpoint.
    // We use the transactionId (which is our merchantTransactionId) to check status.
    const merchantTransactionId = body.transactionId;
    if (!merchantTransactionId) {
      throw new BadRequestException({
        code: 'MISSING_TRANSACTION_ID',
        message: 'Missing transaction ID in redirect callback',
      });
    }

    // Always verify via status API — never trust redirect params
    const statusData = await this.checkPaymentStatus(merchantTransactionId);

    return {
      merchantTransactionId: statusData!.merchantTransactionId,
      status: statusData!.state === 'COMPLETED' ? 'completed' : 'failed',
    };
  }

  // ─── Webhook/Callback Processing ────────────────────────────────────────────

  async processCallback(
    rawBody: string,
    xVerifyHeader: string,
  ): Promise<{ merchantTransactionId: string; status: string; amount: number }> {
    if (!this.isConfigured) {
      this.logger.warn('[PhonePe] Not configured — skipping callback verification');
      return { merchantTransactionId: 'mock', status: 'completed', amount: 0 };
    }

    // Decode the base64 response
    const raw = JSON.parse(rawBody);
    let decoded: any;
    try {
      decoded = raw.response
        ? JSON.parse(Buffer.from(raw.response, 'base64').toString('utf8'))
        : raw;
    } catch {
      throw new BadRequestException({
        code: 'INVALID_CALLBACK_BODY',
        message: 'Invalid callback body format',
      });
    }

    // Verify checksum
    const responseBase64 = raw.response ?? rawBody;
    const endpoint = '/pg/v1/pay';  // Callback uses the pay endpoint for checksum
    if (!this.verifyChecksum(responseBase64, endpoint, xVerifyHeader)) {
      throw new BadRequestException({
        code: 'CALLBACK_VERIFICATION_FAILED',
        message: 'PhonePe callback checksum verification failed',
      });
    }

    this.logger.log(`[PhonePe] Callback processed: ${decoded.merchantTransactionId}, state=${decoded.state}`);

    return {
      merchantTransactionId: decoded.merchantTransactionId,
      status: decoded.state === 'COMPLETED' ? 'completed' : 'failed',
      amount: decoded.amount ?? 0,
    };
  }

  // ─── Refund ──────────────────────────────────────────────────────────────────

  async refundPayment(params: {
    originalTransactionId: string;  // PhonePe merchantTransactionId from original payment
    amount?: number;                // in paise; omit for full refund
  }): Promise<{ refundId: string; status: string }> {
    if (!this.isConfigured) {
      this.logger.warn(`[PhonePe] Not configured — returning mock refund for ${params.originalTransactionId}`);
      return { refundId: `mock_refund_${Date.now()}`, status: 'COMPLETED' };
    }

    const endpoint = '/pg/v1/refund';
    const merchantTransactionId = `REFUND_${Date.now()}`;

    const payload = {
      merchantId: this.merchantId,
      merchantTransactionId,
      originalTransactionId: params.originalTransactionId,
      amount: params.amount,  // Optional; omit for full refund
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = this.generateChecksum(base64Payload, endpoint);
    const url = `${this.baseUrl}${endpoint}`;

    this.logger.log(`[PhonePe] Initiating refund: ${merchantTransactionId}, original=${params.originalTransactionId}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        body: JSON.stringify({ request: base64Payload }),
      });

      const json: PhonePeRefundResponse = await response.json();
      this.logger.log(`[PhonePe] Refund response: ${JSON.stringify({ success: json.success, code: json.code, state: json.data?.state })}`);

      if (!json.success || !json.data) {
        throw new BadRequestException({
          code: 'PHONEPE_REFUND_FAILED',
          message: json.message ?? 'Failed to initiate PhonePe refund',
        });
      }

      return {
        refundId: json.data.transactionId,
        status: json.data.state,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`[PhonePe] Refund failed: ${err?.message}`);
      throw new BadRequestException({
        code: 'PHONEPE_REFUND_FAILED',
        message: err?.message ?? 'Failed to initiate PhonePe refund',
      });
    }
  }
}
