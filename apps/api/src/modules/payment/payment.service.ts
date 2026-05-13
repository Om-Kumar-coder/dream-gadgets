import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Payment } from '../sales/entities/payment.entity';

// Redis key for idempotency
const WEBHOOK_IDEMPOTENCY_KEY = (webhookId: string) => `webhook:processed:${webhookId}`;
const WEBHOOK_TTL = 24 * 60 * 60; // 24 hours

@Injectable()
export class PaymentService {
  private redisClient: any;

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private configService: ConfigService,
  ) {}

  // ─── Redis lazy init ─────────────────────────────────────────────────────────

  private async getRedis(): Promise<any> {
    if (!this.redisClient) {
      const { createClient } = await import('redis');
      const client = createClient({ url: this.configService.get<string>('redis.url') ?? this.configService.get<string>('REDIS_URL') });
      await client.connect();
      this.redisClient = client;
    }
    return this.redisClient;
  }

  // ─── 13.2 Create Razorpay order ──────────────────────────────────────────────

  async createRazorpayOrder(params: {
    amount: number;       // in paise (INR * 100)
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
  }): Promise<{ orderId: string; amount: number; currency: string; receipt?: string }> {
    const { amount, currency = 'INR', receipt, notes } = params;

    if (amount <= 0) {
      throw new BadRequestException({
        code: 'INVALID_AMOUNT',
        message: 'Amount must be greater than 0',
      });
    }

    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
        key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
      });

      const order = await razorpay.orders.create({
        amount,
        currency,
        receipt,
        notes,
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      };
    } catch (err: any) {
      if (err?.code === 'MODULE_NOT_FOUND' || err?.message?.includes('Cannot find module')) {
        // Razorpay not installed — return mock for development
        console.warn('[Payment] Razorpay package not available, returning mock order');
        const mockOrderId = `order_mock_${Date.now()}`;
        return { orderId: mockOrderId, amount, currency, receipt };
      }
      throw new BadRequestException({
        code: 'RAZORPAY_ORDER_FAILED',
        message: err?.message ?? 'Failed to create Razorpay order',
      });
    }
  }

  // ─── 13.3 Verify Razorpay webhook signature ──────────────────────────────────

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') ?? '';
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  }

  // ─── 13.3 / 13.4 Handle Razorpay webhook ────────────────────────────────────

  async handleWebhook(
    rawBody: string,
    signature: string,
    event: any,
  ): Promise<{ processed: boolean; message: string }> {
    // 13.3 Verify signature
    if (!this.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException({
        code: 'WEBHOOK_SIGNATURE_INVALID',
        message: 'Razorpay webhook signature verification failed',
      });
    }

    // 13.4 Idempotency check — use event ID or composite key
    const webhookId = event?.payload?.payment?.entity?.id
      ?? event?.payload?.order?.entity?.id
      ?? `${event?.event}:${Date.now()}`;

    const idempotencyKey = WEBHOOK_IDEMPOTENCY_KEY(webhookId);

    try {
      const redis = await this.getRedis();
      const alreadyProcessed = await redis.get(idempotencyKey);
      if (alreadyProcessed) {
        return { processed: false, message: 'Webhook already processed (idempotent)' };
      }

      // Process the event
      await this.processWebhookEvent(event);

      // Mark as processed with TTL
      await redis.set(idempotencyKey, '1', { EX: WEBHOOK_TTL });
    } catch (err: any) {
      // If Redis is unavailable, still process but log warning
      if (err?.code === 'WEBHOOK_SIGNATURE_INVALID') throw err;
      console.warn('[Payment] Redis unavailable for idempotency check, processing anyway:', err?.message);
      await this.processWebhookEvent(event);
    }

    return { processed: true, message: `Webhook event ${event?.event} processed` };
  }

  private async processWebhookEvent(event: any): Promise<void> {
    const eventType = event?.event;
    const paymentEntity = event?.payload?.payment?.entity;

    switch (eventType) {
      case 'payment.captured': {
        if (paymentEntity?.id) {
          // Update payment record with Razorpay payment ID
          await this.paymentRepo.update(
            { razorpayOrderId: paymentEntity.order_id },
            {
              razorpayPaymentId: paymentEntity.id,
              status: 'completed',
            },
          ).catch(() => {
            // Payment record may not exist yet — log and continue
            console.log(`[Payment] No payment record found for order ${paymentEntity.order_id}`);
          });
        }
        break;
      }
      case 'payment.failed': {
        if (paymentEntity?.id) {
          await this.paymentRepo.update(
            { razorpayOrderId: paymentEntity.order_id },
            { status: 'failed' },
          ).catch(() => {});
        }
        break;
      }
      default:
        console.log(`[Payment] Unhandled webhook event: ${eventType}`);
    }
  }

  // ─── 13.5 Razorpay refund ────────────────────────────────────────────────────

  async createRefund(params: {
    paymentId: string;
    amount?: number;   // in paise; if omitted, full refund
    notes?: Record<string, string>;
  }): Promise<{ refundId: string; amount: number; status: string }> {
    const { paymentId, amount, notes } = params;

    if (!paymentId) {
      throw new BadRequestException({
        code: 'MISSING_PAYMENT_ID',
        message: 'Razorpay payment ID is required for refund',
      });
    }

    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
        key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
      });

      const refundPayload: any = { notes };
      if (amount) refundPayload.amount = amount;

      const refund = await razorpay.payments.refund(paymentId, refundPayload);

      return {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
      };
    } catch (err: any) {
      if (err?.code === 'MODULE_NOT_FOUND' || err?.message?.includes('Cannot find module')) {
        // Razorpay not installed — return mock for development
        console.warn('[Payment] Razorpay package not available, returning mock refund');
        return {
          refundId: `rfnd_mock_${Date.now()}`,
          amount: amount ?? 0,
          status: 'processed',
        };
      }
      throw new BadRequestException({
        code: 'RAZORPAY_REFUND_FAILED',
        message: err?.message ?? 'Failed to create Razorpay refund',
      });
    }
  }

  // ─── Get payment by ID ───────────────────────────────────────────────────────

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  // ─── List payments for a sale ────────────────────────────────────────────────

  async findBySaleId(saleId: string): Promise<Payment[]> {
    return this.paymentRepo.find({ where: { saleId } });
  }
}
