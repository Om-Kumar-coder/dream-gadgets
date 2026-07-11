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
import { Controller, Post, Get, UseGuards, HttpCode, HttpStatus, BadRequestException, } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsNumber, IsOptional, IsString, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
let CreateRazorpayOrderDto = (() => {
    var _a;
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _currency_decorators;
    let _currency_initializers = [];
    let _currency_extraInitializers = [];
    let _receipt_decorators;
    let _receipt_initializers = [];
    let _receipt_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return _a = class CreateRazorpayOrderDto {
            constructor() {
                this.amount = __runInitializers(this, _amount_initializers, void 0);
                this.currency = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
                this.receipt = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _receipt_initializers, void 0));
                this.notes = (__runInitializers(this, _receipt_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _amount_decorators = [ApiProperty({ description: 'Amount in paise (INR * 100)' }), IsNumber(), Min(1)];
            _currency_decorators = [ApiPropertyOptional({ default: 'INR' }), IsOptional(), IsString()];
            _receipt_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _notes_decorators = [ApiPropertyOptional(), IsOptional(), IsObject()];
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: obj => "currency" in obj, get: obj => obj.currency, set: (obj, value) => { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            __esDecorate(null, null, _receipt_decorators, { kind: "field", name: "receipt", static: false, private: false, access: { has: obj => "receipt" in obj, get: obj => obj.receipt, set: (obj, value) => { obj.receipt = value; } }, metadata: _metadata }, _receipt_initializers, _receipt_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
let VerifyPaymentDto = (() => {
    var _a;
    let _razorpayOrderId_decorators;
    let _razorpayOrderId_initializers = [];
    let _razorpayOrderId_extraInitializers = [];
    let _razorpayPaymentId_decorators;
    let _razorpayPaymentId_initializers = [];
    let _razorpayPaymentId_extraInitializers = [];
    let _razorpaySignature_decorators;
    let _razorpaySignature_initializers = [];
    let _razorpaySignature_extraInitializers = [];
    let _orderId_decorators;
    let _orderId_initializers = [];
    let _orderId_extraInitializers = [];
    return _a = class VerifyPaymentDto {
            constructor() {
                this.razorpayOrderId = __runInitializers(this, _razorpayOrderId_initializers, void 0);
                this.razorpayPaymentId = (__runInitializers(this, _razorpayOrderId_extraInitializers), __runInitializers(this, _razorpayPaymentId_initializers, void 0));
                this.razorpaySignature = (__runInitializers(this, _razorpayPaymentId_extraInitializers), __runInitializers(this, _razorpaySignature_initializers, void 0));
                this.orderId = (__runInitializers(this, _razorpaySignature_extraInitializers), __runInitializers(this, _orderId_initializers, void 0));
                __runInitializers(this, _orderId_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _razorpayOrderId_decorators = [IsString()];
            _razorpayPaymentId_decorators = [IsString()];
            _razorpaySignature_decorators = [IsString()];
            _orderId_decorators = [IsString()];
            __esDecorate(null, null, _razorpayOrderId_decorators, { kind: "field", name: "razorpayOrderId", static: false, private: false, access: { has: obj => "razorpayOrderId" in obj, get: obj => obj.razorpayOrderId, set: (obj, value) => { obj.razorpayOrderId = value; } }, metadata: _metadata }, _razorpayOrderId_initializers, _razorpayOrderId_extraInitializers);
            __esDecorate(null, null, _razorpayPaymentId_decorators, { kind: "field", name: "razorpayPaymentId", static: false, private: false, access: { has: obj => "razorpayPaymentId" in obj, get: obj => obj.razorpayPaymentId, set: (obj, value) => { obj.razorpayPaymentId = value; } }, metadata: _metadata }, _razorpayPaymentId_initializers, _razorpayPaymentId_extraInitializers);
            __esDecorate(null, null, _razorpaySignature_decorators, { kind: "field", name: "razorpaySignature", static: false, private: false, access: { has: obj => "razorpaySignature" in obj, get: obj => obj.razorpaySignature, set: (obj, value) => { obj.razorpaySignature = value; } }, metadata: _metadata }, _razorpaySignature_initializers, _razorpaySignature_extraInitializers);
            __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: obj => "orderId" in obj, get: obj => obj.orderId, set: (obj, value) => { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
let CreateRefundDto = (() => {
    var _a;
    let _paymentId_decorators;
    let _paymentId_initializers = [];
    let _paymentId_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return _a = class CreateRefundDto {
            constructor() {
                this.paymentId = __runInitializers(this, _paymentId_initializers, void 0);
                this.amount = (__runInitializers(this, _paymentId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
                this.notes = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _paymentId_decorators = [ApiProperty({ description: 'Razorpay payment ID' }), IsString()];
            _amount_decorators = [ApiPropertyOptional({ description: 'Amount in paise; omit for full refund' }), IsOptional(), IsNumber(), Min(1)];
            _notes_decorators = [ApiPropertyOptional(), IsOptional(), IsObject()];
            __esDecorate(null, null, _paymentId_decorators, { kind: "field", name: "paymentId", static: false, private: false, access: { has: obj => "paymentId" in obj, get: obj => obj.paymentId, set: (obj, value) => { obj.paymentId = value; } }, metadata: _metadata }, _paymentId_initializers, _paymentId_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
let PaymentController = (() => {
    let _classDecorators = [ApiTags('Payments'), Controller()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createPublicOrder_decorators;
    let _handleWebhook_decorators;
    let _verifyPayment_decorators;
    let _createRefund_decorators;
    let _findById_decorators;
    let _findBySaleId_decorators;
    let _findRefundsNeedingAction_decorators;
    let _retryRefund_decorators;
    var PaymentController = _classThis = class {
        constructor(paymentService) {
            this.paymentService = (__runInitializers(this, _instanceExtraInitializers), paymentService);
        }
        // ─── POST /payments/razorpay/order ────────────────────────────────────────────
        // PUBLIC endpoint for guest & authenticated checkout
        async createPublicOrder(dto, req) {
            // Allow both authenticated and unauthenticated access
            // In production, you might want to rate-limit guest orders
            return this.paymentService.createRazorpayOrder(dto);
        }
        // ─── POST /webhooks/razorpay ──────────────────────────────────────────────────
        async handleWebhook(req, signature, body) {
            if (!signature) {
                throw new BadRequestException({
                    code: 'MISSING_SIGNATURE',
                    message: 'x-razorpay-signature header is required',
                });
            }
            // Use raw body for signature verification
            const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
            return this.paymentService.handleWebhook(rawBody, signature, body);
        }
        // ─── POST /payments/razorpay/verify ───────────────────────────────────────────
        // PUBLIC endpoint for frontend payment verification callback
        async verifyPayment(dto) {
            return this.paymentService.verifyPayment({
                razorpayOrderId: dto.razorpayOrderId,
                razorpayPaymentId: dto.razorpayPaymentId,
                razorpaySignature: dto.razorpaySignature,
                orderId: dto.orderId,
            });
        }
        // ─── POST /payments/razorpay/refund ───────────────────────────────────────────
        // PROTECTED admin endpoint
        async createRefund(dto) {
            return this.paymentService.createRefund(dto);
        }
        // ─── GET /payments/:id ─────────────────────────────────────────────────────────
        // PROTECTED admin endpoint
        async findById(id) {
            return this.paymentService.findById(id);
        }
        // ─── GET /sales/:id/payments ──────────────────────────────────────────────────
        // PROTECTED admin endpoint
        async findBySaleId(saleId) {
            return this.paymentService.findBySaleId(saleId);
        }
        // ─── GET /admin/refunds ──────────────────────────────────────────────────────
        // PROTECTED admin endpoint
        async findRefundsNeedingAction() {
            return this.paymentService.findRefundsNeedingAction();
        }
        // ─── POST /admin/refunds/:paymentId/retry ────────────────────────────────────
        // PROTECTED admin endpoint
        async retryRefund(paymentId, amount, user) {
            return this.paymentService.retryRefund({
                paymentId,
                amount: amount ? parseInt(amount, 10) : undefined,
                adminId: user.sub,
            });
        }
    };
    __setFunctionName(_classThis, "PaymentController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createPublicOrder_decorators = [Post('payments/razorpay/order'), Throttle({ default: { ttl: 60000, limit: 10 } }), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Create a Razorpay order for online payment (public access for checkout)' }), ApiSecurity('optional')];
        _handleWebhook_decorators = [Post('webhooks/razorpay'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Razorpay webhook handler (HMAC-SHA256 verified)' })];
        _verifyPayment_decorators = [Post('payments/razorpay/verify'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Verify Razorpay payment signature and confirm order' })];
        _createRefund_decorators = [Post('payments/razorpay/refund'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.approve'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Trigger a Razorpay refund (admin only)' })];
        _findById_decorators = [Get('payments/:id'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.view'), ApiOperation({ summary: 'Get payment by ID (admin only)' })];
        _findBySaleId_decorators = [Get('sales/:id/payments'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.view'), ApiOperation({ summary: 'List payments for a sale (admin only)' })];
        _findRefundsNeedingAction_decorators = [Get('admin/refunds'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.approve'), ApiOperation({ summary: 'List cancelled orders needing manual refund action' })];
        _retryRefund_decorators = [Post('admin/refunds/:paymentId/retry'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.approve'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Retry a manual refund for a specific payment' }), ApiQuery({ name: 'amount', required: false, type: Number, description: 'Amount in paise; omit for full refund' })];
        __esDecorate(_classThis, null, _createPublicOrder_decorators, { kind: "method", name: "createPublicOrder", static: false, private: false, access: { has: obj => "createPublicOrder" in obj, get: obj => obj.createPublicOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleWebhook_decorators, { kind: "method", name: "handleWebhook", static: false, private: false, access: { has: obj => "handleWebhook" in obj, get: obj => obj.handleWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verifyPayment_decorators, { kind: "method", name: "verifyPayment", static: false, private: false, access: { has: obj => "verifyPayment" in obj, get: obj => obj.verifyPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createRefund_decorators, { kind: "method", name: "createRefund", static: false, private: false, access: { has: obj => "createRefund" in obj, get: obj => obj.createRefund }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findBySaleId_decorators, { kind: "method", name: "findBySaleId", static: false, private: false, access: { has: obj => "findBySaleId" in obj, get: obj => obj.findBySaleId }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findRefundsNeedingAction_decorators, { kind: "method", name: "findRefundsNeedingAction", static: false, private: false, access: { has: obj => "findRefundsNeedingAction" in obj, get: obj => obj.findRefundsNeedingAction }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _retryRefund_decorators, { kind: "method", name: "retryRefund", static: false, private: false, access: { has: obj => "retryRefund" in obj, get: obj => obj.retryRefund }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentController = _classThis;
})();
export { PaymentController };
//# sourceMappingURL=payment.controller.js.map