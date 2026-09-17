import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { PaymentService } from './payment.service';
import { Payment } from '../sales/entities/payment.entity';
import { OnlineOrder } from '../sales/entities/online-order.entity';
import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../../common/redis/redis.service';
import { EventService } from '../../common/events/event.service';

// The Razorpay SDK is installed in the test env, so mock it to avoid real API calls.
jest.mock('razorpay', () => {
  const ordersCreate = jest.fn();
  const paymentsRefund = jest.fn();
  const Razorpay: any = jest.fn().mockImplementation(() => ({
    orders: { create: ordersCreate },
    payments: { refund: paymentsRefund },
  }));
  // Expose shared mocks so tests can program responses / assert calls
  (Razorpay as any).ordersCreate = ordersCreate;
  (Razorpay as any).paymentsRefund = paymentsRefund;
  return Razorpay;
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const RazorpayMock: any = jest.requireMock('razorpay');
const mockOrdersCreate = RazorpayMock.ordersCreate;
const mockPaymentsRefund = RazorpayMock.paymentsRefund;

// ─── Helpers ────────────────────────────────────────────────────────────────

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'payment-uuid-1',
    saleId: 'sale-uuid-1',
    onlineOrderId: null,
    method: 'online',
    amount: 10000,
    reference: null,
    note: null,
    razorpayOrderId: 'order_test_123',
    razorpayPaymentId: null,
    razorpaySignature: null,
    status: 'completed',
    emiPlan: null,
    createdAt: new Date(),
    ...overrides,
  } as Payment;
}

function makePaymentRepo(): any {
  return {
    findOne: jest.fn() as any,
    find: jest.fn() as any,
    update: jest.fn() as any,
  };
}

// ─── Build a valid HMAC-SHA256 signature ─────────────────────────────────────

function buildSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepo: any;
  let orderRepo: any;
  let configService: any;
  let notificationService: any;
  let redisService: any;
  let eventService: any;

  const WEBHOOK_SECRET = 'test_webhook_secret';

  beforeEach(async () => {
    mockOrdersCreate.mockReset();
    mockPaymentsRefund.mockReset();
    paymentRepo = makePaymentRepo();
    orderRepo = {
      findOne: jest.fn() as any,
      find: jest.fn() as any,
      save: jest.fn() as any,
    };
    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          RAZORPAY_KEY_ID: 'rzp_test_key',
          RAZORPAY_KEY_SECRET: 'rzp_test_secret',
          RAZORPAY_WEBHOOK_SECRET: WEBHOOK_SECRET,
          'redis.url': 'redis://localhost:6379',
          REDIS_URL: 'redis://localhost:6379',
        };
        return config[key];
      }),
    };
    notificationService = {
      sendEmail: (jest.fn() as any).mockResolvedValue(undefined),
      sendSms: (jest.fn() as any).mockResolvedValue(undefined),
    };
    redisService = {
      isWebhookProcessed: (jest.fn() as any).mockResolvedValue(false),
      setWebhookIdempotency: (jest.fn() as any).mockResolvedValue(undefined),
    };
    eventService = {
      emitPaymentConfirmed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(OnlineOrder), useValue: orderRepo },
        { provide: ConfigService, useValue: configService },
        { provide: NotificationService, useValue: notificationService },
        { provide: RedisService, useValue: redisService },
        { provide: EventService, useValue: eventService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  // ─── 13.2 createRazorpayOrder ─────────────────────────────────────────────

  describe('createRazorpayOrder()', () => {
    it('should reject amount <= 0', async () => {
      await expect(
        service.createRazorpayOrder({ amount: 0 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createRazorpayOrder({ amount: 0 }),
      ).rejects.toMatchObject({ response: { code: 'INVALID_AMOUNT' } });
    });

    it('should reject negative amount', async () => {
      await expect(
        service.createRazorpayOrder({ amount: -100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create an order via the Razorpay SDK', async () => {
      mockOrdersCreate.mockResolvedValue({ id: 'order_new_1', amount: 50000, currency: 'INR' });

      const result = await service.createRazorpayOrder({ amount: 50000, currency: 'INR' });

      expect(result).toBeDefined();
      expect(result.orderId).toBe('order_new_1');
      expect(result.amount).toBe(50000);
      expect(result.currency).toBe('INR');
      expect(mockOrdersCreate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 50000, currency: 'INR' }),
      );
    });

    it('should include receipt when provided', async () => {
      mockOrdersCreate.mockResolvedValue({ id: 'order_new_2', amount: 10000, currency: 'INR', receipt: 'receipt_001' });

      const result = await service.createRazorpayOrder({
        amount: 10000,
        receipt: 'receipt_001',      });

      expect(result.receipt).toBe('receipt_001');
      expect(mockOrdersCreate).toHaveBeenCalledWith(
        expect.objectContaining({ receipt: 'receipt_001' }),
      );
    });
  });

  // ─── 13.3 verifyWebhookSignature ─────────────────────────────────────────

  describe('verifyWebhookSignature()', () => {
    it('should return true for a valid signature', () => {
      const payload = JSON.stringify({ event: 'payment.captured' });
      const signature = buildSignature(payload, WEBHOOK_SECRET);

      const result = service.verifyWebhookSignature(payload, signature);

      expect(result).toBe(true);
    });

    it('should return false for an invalid signature', () => {
      const payload = JSON.stringify({ event: 'payment.captured' });
      const result = service.verifyWebhookSignature(payload, 'invalid_signature');

      expect(result).toBe(false);
    });

    it('should return false for a tampered payload', () => {
      const originalPayload = JSON.stringify({ event: 'payment.captured', amount: 1000 });
      const signature = buildSignature(originalPayload, WEBHOOK_SECRET);

      // Tamper with payload
      const tamperedPayload = JSON.stringify({ event: 'payment.captured', amount: 99999 });
      const result = service.verifyWebhookSignature(tamperedPayload, signature);

      expect(result).toBe(false);
    });

    it('should return false for empty signature', () => {
      const payload = JSON.stringify({ event: 'payment.captured' });
      const result = service.verifyWebhookSignature(payload, '');

      expect(result).toBe(false);
    });
  });

  // ─── 13.3 / 13.4 handleWebhook ───────────────────────────────────────────

  describe('handleWebhook()', () => {
    function makeWebhookEvent(eventType: string, paymentId = 'pay_test_123', orderId = 'order_test_123') {
      return {
        event: eventType,
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: 50000,
              status: 'captured',
            },
          },
        },
      };
    }

    it('should reject webhook with invalid signature', async () => {
      const event = makeWebhookEvent('payment.captured');
      const rawBody = JSON.stringify(event);

      await expect(
        service.handleWebhook(rawBody, 'bad_signature', event),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.handleWebhook(rawBody, 'bad_signature', event),
      ).rejects.toMatchObject({ response: { code: 'WEBHOOK_SIGNATURE_INVALID' } });
    });

    it('should process a valid payment.captured webhook', async () => {
      const event = makeWebhookEvent('payment.captured');
      const rawBody = JSON.stringify(event);
      const signature = buildSignature(rawBody, WEBHOOK_SECRET);

      (paymentRepo.update as any).mockResolvedValue({ affected: 1 });

      const result = await service.handleWebhook(rawBody, signature, event);

      expect(result.processed).toBe(true);
      expect(result.message).toContain('payment.captured');
    });

    it('should update payment status to completed on payment.captured', async () => {
      const event = makeWebhookEvent('payment.captured', 'pay_abc', 'order_xyz');
      const rawBody = JSON.stringify(event);
      const signature = buildSignature(rawBody, WEBHOOK_SECRET);

      (paymentRepo.update as any).mockResolvedValue({ affected: 1 });

      await service.handleWebhook(rawBody, signature, event);

      expect(paymentRepo.update).toHaveBeenCalledWith(
        { razorpayOrderId: 'order_xyz' },
        { razorpayPaymentId: 'pay_abc', status: 'completed' },
      );
    });

    it('should update payment status to failed on payment.failed', async () => {
      const event = makeWebhookEvent('payment.failed', 'pay_fail', 'order_fail');
      const rawBody = JSON.stringify(event);
      const signature = buildSignature(rawBody, WEBHOOK_SECRET);

      (paymentRepo.update as any).mockResolvedValue({ affected: 1 });

      await service.handleWebhook(rawBody, signature, event);

      expect(paymentRepo.update).toHaveBeenCalledWith(
        { razorpayOrderId: 'order_fail' },
        { status: 'failed' },
      );
    });

    // ─── 13.4 Idempotency ──────────────────────────────────────────────────

    it('should skip processing if webhook was already processed (idempotency)', async () => {
      const event = makeWebhookEvent('payment.captured');
      const rawBody = JSON.stringify(event);
      const signature = buildSignature(rawBody, WEBHOOK_SECRET);

      // Redis reports the webhook as already processed
      (redisService.isWebhookProcessed as any).mockResolvedValue(true);

      const result = await service.handleWebhook(rawBody, signature, event);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('idempotent');
      // Should NOT call paymentRepo.update
      expect(paymentRepo.update).not.toHaveBeenCalled();
    });

    it('should store webhook ID in Redis after processing', async () => {
      const event = makeWebhookEvent('payment.captured', 'pay_new', 'order_new');
      const rawBody = JSON.stringify(event);
      const signature = buildSignature(rawBody, WEBHOOK_SECRET);

      (paymentRepo.update as any).mockResolvedValue({ affected: 1 });

      await service.handleWebhook(rawBody, signature, event);

      expect(redisService.setWebhookIdempotency).toHaveBeenCalledWith(
        'pay_new',
        expect.any(Number),
      );
    });
  });

  // ─── 13.5 createRefund ────────────────────────────────────────────────────

  describe('createRefund()', () => {
    it('should reject empty paymentId', async () => {
      await expect(
        service.createRefund({ paymentId: '' }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createRefund({ paymentId: '' }),
      ).rejects.toMatchObject({ response: { code: 'MISSING_PAYMENT_ID' } });
    });

    it('should create a refund via the Razorpay SDK', async () => {
      mockPaymentsRefund.mockResolvedValue({ id: 'rfnd_test_1', amount: 5000, status: 'processed' });

      const result = await service.createRefund({ paymentId: 'pay_test_123', amount: 5000 });

      expect(result).toBeDefined();
      expect(result.refundId).toBe('rfnd_test_1');
      expect(result.status).toBe('processed');
      expect(mockPaymentsRefund).toHaveBeenCalledWith('pay_test_123', expect.objectContaining({ amount: 5000 }));
    });

    it('should include amount in refund when provided', async () => {
      mockPaymentsRefund.mockResolvedValue({ id: 'rfnd_test_2', amount: 5000, status: 'processed' });

      const result = await service.createRefund({ paymentId: 'pay_test_123', amount: 5000 });

      expect(result.amount).toBe(5000);
    });
  });

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('should return payment by ID', async () => {
      const payment = makePayment();
      (paymentRepo.findOne as any).mockResolvedValue(payment);

      const result = await service.findById('payment-uuid-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('payment-uuid-1');
    });

    it('should throw NotFoundException when payment not found', async () => {
      (paymentRepo.findOne as any).mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findBySaleId ─────────────────────────────────────────────────────────

  describe('findBySaleId()', () => {
    it('should return all payments for a sale', async () => {
      const payments = [makePayment(), makePayment({ id: 'payment-uuid-2', method: 'cash' })];
      (paymentRepo.find as any).mockResolvedValue(payments);

      const result = await service.findBySaleId('sale-uuid-1');

      expect(result).toHaveLength(2);
      expect(paymentRepo.find).toHaveBeenCalledWith({ where: { saleId: 'sale-uuid-1' } });
    });

    it('should return empty array when no payments found', async () => {
      (paymentRepo.find as any).mockResolvedValue([]);

      const result = await service.findBySaleId('sale-uuid-1');

      expect(result).toHaveLength(0);
    });
  });
});
