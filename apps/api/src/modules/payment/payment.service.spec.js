import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { PaymentService } from './payment.service';
import { Payment } from '../sales/entities/payment.entity';
import { OnlineOrder } from '../sales/entities/online-order.entity';
import { NotificationService } from '../notification/notification.service';
// ─── Helpers ────────────────────────────────────────────────────────────────
function makePayment(overrides = {}) {
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
    };
}
function makePaymentRepo() {
    return {
        findOne: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
    };
}
// ─── Build a valid HMAC-SHA256 signature ─────────────────────────────────────
function buildSignature(payload, secret) {
    return createHmac('sha256', secret).update(payload).digest('hex');
}
// ─── Test suite ──────────────────────────────────────────────────────────────
describe('PaymentService', () => {
    let service;
    let paymentRepo;
    let orderRepo;
    let configService;
    let notificationService;
    const WEBHOOK_SECRET = 'test_webhook_secret';
    beforeEach(async () => {
        paymentRepo = makePaymentRepo();
        orderRepo = {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
        };
        configService = {
            get: jest.fn((key) => {
                const config = {
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
            sendEmail: jest.fn().mockResolvedValue(undefined),
            sendSms: jest.fn().mockResolvedValue(undefined),
        };
        const module = await Test.createTestingModule({
            providers: [
                PaymentService,
                { provide: getRepositoryToken(Payment), useValue: paymentRepo },
                { provide: getRepositoryToken(OnlineOrder), useValue: orderRepo },
                { provide: ConfigService, useValue: configService },
                { provide: NotificationService, useValue: notificationService },
            ],
        }).compile();
        service = module.get(PaymentService);
    });
    // ─── 13.2 createRazorpayOrder ─────────────────────────────────────────────
    describe('createRazorpayOrder()', () => {
        it('should reject amount <= 0', async () => {
            await expect(service.createRazorpayOrder({ amount: 0 })).rejects.toThrow(BadRequestException);
            await expect(service.createRazorpayOrder({ amount: 0 })).rejects.toMatchObject({ response: { code: 'INVALID_AMOUNT' } });
        });
        it('should reject negative amount', async () => {
            await expect(service.createRazorpayOrder({ amount: -100 })).rejects.toThrow(BadRequestException);
        });
        it('should return a mock order when Razorpay is unavailable', async () => {
            // Razorpay package may not be installed in test env — service handles gracefully
            const result = await service.createRazorpayOrder({ amount: 50000, currency: 'INR' });
            expect(result).toBeDefined();
            expect(result.orderId).toBeDefined();
            expect(result.amount).toBe(50000);
            expect(result.currency).toBe('INR');
        });
        it('should include receipt when provided', async () => {
            const result = await service.createRazorpayOrder({
                amount: 10000,
                receipt: 'receipt_001',
            });
            expect(result.receipt).toBe('receipt_001');
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
        function makeWebhookEvent(eventType, paymentId = 'pay_test_123', orderId = 'order_test_123') {
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
            await expect(service.handleWebhook(rawBody, 'bad_signature', event)).rejects.toThrow(BadRequestException);
            await expect(service.handleWebhook(rawBody, 'bad_signature', event)).rejects.toMatchObject({ response: { code: 'WEBHOOK_SIGNATURE_INVALID' } });
        });
        it('should process a valid payment.captured webhook', async () => {
            const event = makeWebhookEvent('payment.captured');
            const rawBody = JSON.stringify(event);
            const signature = buildSignature(rawBody, WEBHOOK_SECRET);
            paymentRepo.update.mockResolvedValue({ affected: 1 });
            // Mock Redis to avoid connection
            service.redisClient = {
                get: jest.fn().mockResolvedValue(null),
                set: jest.fn().mockResolvedValue('OK'),
            };
            const result = await service.handleWebhook(rawBody, signature, event);
            expect(result.processed).toBe(true);
            expect(result.message).toContain('payment.captured');
        });
        it('should update payment status to completed on payment.captured', async () => {
            const event = makeWebhookEvent('payment.captured', 'pay_abc', 'order_xyz');
            const rawBody = JSON.stringify(event);
            const signature = buildSignature(rawBody, WEBHOOK_SECRET);
            paymentRepo.update.mockResolvedValue({ affected: 1 });
            service.redisClient = {
                get: jest.fn().mockResolvedValue(null),
                set: jest.fn().mockResolvedValue('OK'),
            };
            await service.handleWebhook(rawBody, signature, event);
            expect(paymentRepo.update).toHaveBeenCalledWith({ razorpayOrderId: 'order_xyz' }, { razorpayPaymentId: 'pay_abc', status: 'completed' });
        });
        it('should update payment status to failed on payment.failed', async () => {
            const event = makeWebhookEvent('payment.failed', 'pay_fail', 'order_fail');
            const rawBody = JSON.stringify(event);
            const signature = buildSignature(rawBody, WEBHOOK_SECRET);
            paymentRepo.update.mockResolvedValue({ affected: 1 });
            service.redisClient = {
                get: jest.fn().mockResolvedValue(null),
                set: jest.fn().mockResolvedValue('OK'),
            };
            await service.handleWebhook(rawBody, signature, event);
            expect(paymentRepo.update).toHaveBeenCalledWith({ razorpayOrderId: 'order_fail' }, { status: 'failed' });
        });
        // ─── 13.4 Idempotency ──────────────────────────────────────────────────
        it('should skip processing if webhook was already processed (idempotency)', async () => {
            const event = makeWebhookEvent('payment.captured');
            const rawBody = JSON.stringify(event);
            const signature = buildSignature(rawBody, WEBHOOK_SECRET);
            // Redis returns a value — already processed
            service.redisClient = {
                get: jest.fn().mockResolvedValue('1'),
                set: jest.fn().mockResolvedValue('OK'),
            };
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
            paymentRepo.update.mockResolvedValue({ affected: 1 });
            const mockRedis = {
                get: jest.fn().mockResolvedValue(null),
                set: jest.fn().mockResolvedValue('OK'),
            };
            service.redisClient = mockRedis;
            await service.handleWebhook(rawBody, signature, event);
            expect(mockRedis.set).toHaveBeenCalledWith(expect.stringContaining('webhook:processed:pay_new'), '1', expect.objectContaining({ EX: expect.any(Number) }));
        });
    });
    // ─── 13.5 createRefund ────────────────────────────────────────────────────
    describe('createRefund()', () => {
        it('should reject empty paymentId', async () => {
            await expect(service.createRefund({ paymentId: '' })).rejects.toThrow(BadRequestException);
            await expect(service.createRefund({ paymentId: '' })).rejects.toMatchObject({ response: { code: 'MISSING_PAYMENT_ID' } });
        });
        it('should return a mock refund when Razorpay is unavailable', async () => {
            const result = await service.createRefund({ paymentId: 'pay_test_123', amount: 5000 });
            expect(result).toBeDefined();
            expect(result.refundId).toBeDefined();
            expect(result.status).toBeDefined();
        });
        it('should include amount in refund when provided', async () => {
            const result = await service.createRefund({ paymentId: 'pay_test_123', amount: 5000 });
            expect(result.amount).toBe(5000);
        });
    });
    // ─── findById ─────────────────────────────────────────────────────────────
    describe('findById()', () => {
        it('should return payment by ID', async () => {
            const payment = makePayment();
            paymentRepo.findOne.mockResolvedValue(payment);
            const result = await service.findById('payment-uuid-1');
            expect(result).toBeDefined();
            expect(result.id).toBe('payment-uuid-1');
        });
        it('should throw NotFoundException when payment not found', async () => {
            paymentRepo.findOne.mockResolvedValue(null);
            await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
        });
    });
    // ─── findBySaleId ─────────────────────────────────────────────────────────
    describe('findBySaleId()', () => {
        it('should return all payments for a sale', async () => {
            const payments = [makePayment(), makePayment({ id: 'payment-uuid-2', method: 'cash' })];
            paymentRepo.find.mockResolvedValue(payments);
            const result = await service.findBySaleId('sale-uuid-1');
            expect(result).toHaveLength(2);
            expect(paymentRepo.find).toHaveBeenCalledWith({ where: { saleId: 'sale-uuid-1' } });
        });
        it('should return empty array when no payments found', async () => {
            paymentRepo.find.mockResolvedValue([]);
            const result = await service.findBySaleId('sale-uuid-1');
            expect(result).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=payment.service.spec.js.map