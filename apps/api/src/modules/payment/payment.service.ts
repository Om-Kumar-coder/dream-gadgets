import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Payment } from '../sales/entities/payment.entity';
import { OnlineOrder } from '../sales/entities/online-order.entity';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../../common/redis/redis.service';
import { EventService } from '../../common/events/event.service';

// Redis key for idempotency
const WEBHOOK_IDEMPOTENCY_KEY = (webhookId: string) => `webhook:processed:${webhookId}`;
const WEBHOOK_TTL = 24 * 60 * 60; // 24 hours

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(OnlineOrder)
    private orderRepo: Repository<OnlineOrder>,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private redisService: RedisService,
    private eventService: EventService,
  ) {}

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
      this.logger.error(`Razorpay order creation failed: ${JSON.stringify({
        message: err?.message,
        statusCode: err?.statusCode,
        error: err?.error,
        name: err?.name,
      })}`);
      throw new BadRequestException({
        code: 'RAZORPAY_ORDER_FAILED',
        message: err?.error?.description ?? err?.message ?? 'Failed to create Razorpay order',
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

    try {
      const alreadyProcessed = await this.redisService.isWebhookProcessed(webhookId);
      if (alreadyProcessed) {
        return { processed: false, message: 'Webhook already processed (idempotent)' };
      }

      // Process the event
      await this.processWebhookEvent(event);

      // Mark as processed with TTL
      await this.redisService.setWebhookIdempotency(webhookId, WEBHOOK_TTL);
    } catch (err: any) {
      // If Redis is unavailable, still process but log warning
      if (err?.code === 'WEBHOOK_SIGNATURE_INVALID') throw err;
      this.logger.warn(`Redis unavailable for idempotency check, processing anyway: ${err?.message}`);
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
            this.logger.log(`No payment record found for order ${paymentEntity.order_id}`);
          });
        }
        break;
      }
      case 'payment.failed': {
        if (paymentEntity?.id) {
          await this.paymentRepo.update(
            { razorpayOrderId: paymentEntity.order_id },
            { status: 'failed' },
          ).catch((err) => {
            this.logger.warn(`Failed updating payment status for ${paymentEntity.order_id}: ${err?.message}`);
          });
        }
        break;
      }
      default:
        this.logger.warn(`Unhandled webhook event: ${eventType}`);
    }
  }

  // ─── 13.5 Razorpay refund ────────────────────────────────────────────────────

  async createRefund(params: {
    paymentId: string;         // Razorpay payment ID ("pay_xxx")
    amount?: number;           // in paise; if omitted, full refund
    notes?: Record<string, string>;
    dbPaymentId?: string;      // Local DB payment UUID to persist refund on
  }): Promise<{ refundId: string; amount: number; status: string }> {
    const { paymentId, amount, notes, dbPaymentId } = params;

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

      const result = {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
      };

      // Persist refund details on the local payment record
      if (dbPaymentId) {
        const refundAmountRupees = refund.amount ? refund.amount / 100 : null;
        await this.paymentRepo.update(dbPaymentId, {
          razorpayRefundId: refund.id,
          refundAmount: refundAmountRupees,
          refundStatus: refund.status,
          refundedAt: new Date(),
        }).catch((err) => {
          this.logger.warn(`Failed to persist refund on payment ${dbPaymentId}: ${err?.message}`);
        });

        // Send customer notifications
        await this.sendRefundNotifications(dbPaymentId, refund.id, refundAmountRupees).catch((err) =>
          this.logger.warn(`Failed to send refund notifications for payment ${dbPaymentId}: ${err?.message}`),
        );
      }

      return result;
    } catch (err: any) {
      throw new BadRequestException({
        code: 'RAZORPAY_REFUND_FAILED',
        message: err?.message ?? 'Failed to create Razorpay refund',
      });
    }
  }

  // ─── Verify Razorpay payment (frontend callback) ────────────────────────────

  async verifyPayment(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }): Promise<{ verified: boolean; payment: Payment; order: OnlineOrder }> {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = params;

    // Verify signature using Razorpay's method:
    // expected = HMAC_SHA256(order_id + "|" + payment_id, secret)
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET') ?? '';
    const expectedSignature = createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException({
        code: 'PAYMENT_VERIFICATION_FAILED',
        message: 'Razorpay payment signature verification failed',
      });
    }

    // Find the order
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: `Order ${orderId} not found`,
      });
    }

    // Create payment record
    const payment = this.paymentRepo.create({
      onlineOrderId: orderId,
      method: 'razorpay',
      amount: order.totalAmount,
      status: 'completed',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    await this.paymentRepo.save(payment);

    // Update order status
    if (order.status === OnlineOrderStatus.PENDING_PAYMENT) {
      order.status = OnlineOrderStatus.PAYMENT_CONFIRMED;
      await this.orderRepo.save(order);
    }

    // Emit realtime event
    try {
      this.eventService.emitPaymentConfirmed({
        orderId: params.orderId,
        paymentId: payment.id,
        amount: Number(order.totalAmount),
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      this.logger.warn(`[Event] Failed to emit payment.confirmed: ${err?.message}`);
    }

    return { verified: true, payment, order };
  }

  // ─── Get payment by ID ───────────────────────────────────────────────────────

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  // ─── Send refund notifications to customer ───────────────────────────────────

  private async sendRefundNotifications(
    dbPaymentId: string,
    refundId: string,
    refundAmountRupees: number | null,
  ): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { id: dbPaymentId },
      relations: ['onlineOrder', 'onlineOrder.client'],
    });

    const order = payment?.onlineOrder;
    const client = order?.client;

    if (!order || !client) {
      this.logger.warn(`Cannot send refund notifications: order/client not found for payment ${dbPaymentId}`);
      return;
    }

    const name = [client.firstName, client.lastName].filter(Boolean).join(' ');
    const formattedAmount = refundAmountRupees != null
      ? Number(refundAmountRupees).toLocaleString('en-IN')
      : Number(payment.amount).toLocaleString('en-IN');

    const templateVars = {
      name,
      orderNumber: order.orderNumber,
      amount: formattedAmount,
      refundId,
    };

    // Send email if client has an email address
    if (client.email) {
      await this.notificationService.sendEmail({
        to: client.email,
        type: 'refund_processed',
        templateKey: 'refund_processed',
        templateVars,
        metadata: { paymentId: dbPaymentId, refundId, orderId: order.id, orderNumber: order.orderNumber },
      }).catch((err) => {
        this.logger.warn(`Failed to send refund email to ${client.email}: ${err?.message}`);
      });
    }

    // Send SMS
    await this.notificationService.sendSms({
      to: client.phone,
      type: 'refund_processed',
      body: `Refund of ₹${formattedAmount} initiated for order ${order.orderNumber}. Will be credited to your payment method within 2–5 business days. — Dream Gadgets`,
      metadata: { paymentId: dbPaymentId, refundId, orderId: order.id, orderNumber: order.orderNumber },
    }).catch((err) => {
      this.logger.warn(`Failed to send refund SMS to ${client.phone}: ${err?.message}`);
    });
  }

  // ─── List payments for a sale ────────────────────────────────────────────────

  async findBySaleId(saleId: string): Promise<Payment[]> {
    return this.paymentRepo.find({ where: { saleId } });
  }

  // ─── 13.6 List refunds needing manual action ──────────────────────────────────

  async findRefundsNeedingAction(): Promise<any[]> {
    // Find cancelled online orders where payment was completed
    // but refund was not successfully processed
    const orders = await this.orderRepo.find({
      where: { status: OnlineOrderStatus.CANCELLED },
      relations: ['payments', 'client', 'branch'],
      order: { orderedAt: 'DESC' },
    });

    // Filter to orders with completed payments that need refund attention
    return orders
      .filter(order =>
        order.payments?.some(p =>
          p.status === 'completed' &&
          p.method === 'razorpay' &&
          (!p.razorpayRefundId || p.refundStatus === 'failed' || p.refundStatus === 'pending')
        ),
      )
      .map(order => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        cancelledAt: order.orderedAt, // No dedicated cancelledAt column; use orderedAt
        clientName: order.client
          ? `${order.client.firstName} ${order.client.lastName}`
          : 'Guest',
        clientEmail: order.client?.email ?? null,
        branchName: order.branch?.name ?? 'N/A',
        totalAmount: order.totalAmount,
        payments: order.payments
          .filter(p => p.status === 'completed' && p.method === 'razorpay')
          .map(p => ({
            paymentId: p.id,
            amount: p.amount,
            razorpayPaymentId: p.razorpayPaymentId,
            razorpayRefundId: p.razorpayRefundId,
            refundAmount: p.refundAmount,
            refundStatus: p.refundStatus,
            refundedAt: p.refundedAt,
          })),
      }));
  }

  // ─── 13.7 Retry refund for a payment ──────────────────────────────────────────

  async retryRefund(params: {
    paymentId: string;
    amount?: number;    // in paise; omit for full refund
    adminId: string;
    notes?: Record<string, string>;
  }): Promise<{ refundId: string; amount: number; status: string }> {
    const { paymentId, amount, adminId, notes } = params;

    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException({
        code: 'PAYMENT_NOT_FOUND',
        message: `Payment ${paymentId} not found`,
      });
    }

    if (!payment.razorpayPaymentId) {
      throw new BadRequestException({
        code: 'NO_RAZORPAY_PAYMENT',
        message: 'This payment has no associated Razorpay payment ID',
      });
    }

    if (payment.status !== 'completed') {
      throw new BadRequestException({
        code: 'PAYMENT_NOT_COMPLETED',
        message: 'Only completed payments can be refunded',
      });
    }

    return this.createRefund({
      paymentId: payment.razorpayPaymentId,
      amount,
      notes: {
        ...notes,
        initiatedBy: `admin:${adminId}`,
        reason: 'Manual refund via admin panel',
      },
      dbPaymentId: payment.id,
    });
  }
}
