var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, BadRequestException, NotFoundException, Logger, } from '@nestjs/common';
import { createHmac } from 'crypto';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
// Redis key for idempotency
const WEBHOOK_IDEMPOTENCY_KEY = (webhookId) => `webhook:processed:${webhookId}`;
const WEBHOOK_TTL = 24 * 60 * 60; // 24 hours
let PaymentService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentService = _classThis = class {
        constructor(paymentRepo, orderRepo, configService, notificationService, redisService, eventService) {
            this.paymentRepo = paymentRepo;
            this.orderRepo = orderRepo;
            this.configService = configService;
            this.notificationService = notificationService;
            this.redisService = redisService;
            this.eventService = eventService;
            this.logger = new Logger(PaymentService.name);
        }
        // ─── 13.2 Create Razorpay order ──────────────────────────────────────────────
        async createRazorpayOrder(params) {
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
                    key_id: this.configService.get('RAZORPAY_KEY_ID'),
                    key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
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
            }
            catch (err) {
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
        verifyWebhookSignature(payload, signature) {
            const secret = this.configService.get('RAZORPAY_WEBHOOK_SECRET') ?? '';
            const expectedSignature = createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            return expectedSignature === signature;
        }
        // ─── 13.3 / 13.4 Handle Razorpay webhook ────────────────────────────────────
        async handleWebhook(rawBody, signature, event) {
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
            }
            catch (err) {
                // If Redis is unavailable, still process but log warning
                if (err?.code === 'WEBHOOK_SIGNATURE_INVALID')
                    throw err;
                this.logger.warn(`Redis unavailable for idempotency check, processing anyway: ${err?.message}`);
                await this.processWebhookEvent(event);
            }
            return { processed: true, message: `Webhook event ${event?.event} processed` };
        }
        async processWebhookEvent(event) {
            const eventType = event?.event;
            const paymentEntity = event?.payload?.payment?.entity;
            switch (eventType) {
                case 'payment.captured': {
                    if (paymentEntity?.id) {
                        // Update payment record with Razorpay payment ID
                        await this.paymentRepo.update({ razorpayOrderId: paymentEntity.order_id }, {
                            razorpayPaymentId: paymentEntity.id,
                            status: 'completed',
                        }).catch(() => {
                            // Payment record may not exist yet — log and continue
                            this.logger.log(`No payment record found for order ${paymentEntity.order_id}`);
                        });
                    }
                    break;
                }
                case 'payment.failed': {
                    if (paymentEntity?.id) {
                        await this.paymentRepo.update({ razorpayOrderId: paymentEntity.order_id }, { status: 'failed' }).catch((err) => {
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
        async createRefund(params) {
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
                    key_id: this.configService.get('RAZORPAY_KEY_ID'),
                    key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
                });
                const refundPayload = { notes };
                if (amount)
                    refundPayload.amount = amount;
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
                    await this.sendRefundNotifications(dbPaymentId, refund.id, refundAmountRupees).catch((err) => this.logger.warn(`Failed to send refund notifications for payment ${dbPaymentId}: ${err?.message}`));
                }
                return result;
            }
            catch (err) {
                throw new BadRequestException({
                    code: 'RAZORPAY_REFUND_FAILED',
                    message: err?.message ?? 'Failed to create Razorpay refund',
                });
            }
        }
        // ─── Verify Razorpay payment (frontend callback) ────────────────────────────
        async verifyPayment(params) {
            const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = params;
            // Verify signature using Razorpay's method:
            // expected = HMAC_SHA256(order_id + "|" + payment_id, secret)
            const secret = this.configService.get('RAZORPAY_KEY_SECRET') ?? '';
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
            }
            catch (err) {
                this.logger.warn(`[Event] Failed to emit payment.confirmed: ${err?.message}`);
            }
            return { verified: true, payment, order };
        }
        // ─── Get payment by ID ───────────────────────────────────────────────────────
        async findById(id) {
            const payment = await this.paymentRepo.findOne({ where: { id } });
            if (!payment)
                throw new NotFoundException(`Payment ${id} not found`);
            return payment;
        }
        // ─── Send refund notifications to customer ───────────────────────────────────
        async sendRefundNotifications(dbPaymentId, refundId, refundAmountRupees) {
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
        async findBySaleId(saleId) {
            return this.paymentRepo.find({ where: { saleId } });
        }
        // ─── 13.6 List refunds needing manual action ──────────────────────────────────
        async findRefundsNeedingAction() {
            // Find cancelled online orders where payment was completed
            // but refund was not successfully processed
            const orders = await this.orderRepo.find({
                where: { status: OnlineOrderStatus.CANCELLED },
                relations: ['payments', 'client', 'branch'],
                order: { orderedAt: 'DESC' },
            });
            // Filter to orders with completed payments that need refund attention
            return orders
                .filter(order => order.payments?.some(p => p.status === 'completed' &&
                p.method === 'razorpay' &&
                (!p.razorpayRefundId || p.refundStatus === 'failed' || p.refundStatus === 'pending')))
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
        async retryRefund(params) {
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
    };
    __setFunctionName(_classThis, "PaymentService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentService = _classThis;
})();
export { PaymentService };
//# sourceMappingURL=payment.service.js.map