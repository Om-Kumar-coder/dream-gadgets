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
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, } from 'typeorm';
import { Sale } from './sale.entity';
import { OnlineOrder } from './online-order.entity';
let Payment = (() => {
    let _classDecorators = [Entity('payments')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _sale_decorators;
    let _sale_initializers = [];
    let _sale_extraInitializers = [];
    let _saleId_decorators;
    let _saleId_initializers = [];
    let _saleId_extraInitializers = [];
    let _onlineOrder_decorators;
    let _onlineOrder_initializers = [];
    let _onlineOrder_extraInitializers = [];
    let _onlineOrderId_decorators;
    let _onlineOrderId_initializers = [];
    let _onlineOrderId_extraInitializers = [];
    let _method_decorators;
    let _method_initializers = [];
    let _method_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _reference_decorators;
    let _reference_initializers = [];
    let _reference_extraInitializers = [];
    let _note_decorators;
    let _note_initializers = [];
    let _note_extraInitializers = [];
    let _razorpayOrderId_decorators;
    let _razorpayOrderId_initializers = [];
    let _razorpayOrderId_extraInitializers = [];
    let _razorpayPaymentId_decorators;
    let _razorpayPaymentId_initializers = [];
    let _razorpayPaymentId_extraInitializers = [];
    let _razorpaySignature_decorators;
    let _razorpaySignature_initializers = [];
    let _razorpaySignature_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _emiPlan_decorators;
    let _emiPlan_initializers = [];
    let _emiPlan_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _razorpayRefundId_decorators;
    let _razorpayRefundId_initializers = [];
    let _razorpayRefundId_extraInitializers = [];
    let _refundAmount_decorators;
    let _refundAmount_initializers = [];
    let _refundAmount_extraInitializers = [];
    let _refundStatus_decorators;
    let _refundStatus_initializers = [];
    let _refundStatus_extraInitializers = [];
    let _refundedAt_decorators;
    let _refundedAt_initializers = [];
    let _refundedAt_extraInitializers = [];
    var Payment = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.sale = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _sale_initializers, void 0));
            this.saleId = (__runInitializers(this, _sale_extraInitializers), __runInitializers(this, _saleId_initializers, void 0));
            this.onlineOrder = (__runInitializers(this, _saleId_extraInitializers), __runInitializers(this, _onlineOrder_initializers, void 0));
            this.onlineOrderId = (__runInitializers(this, _onlineOrder_extraInitializers), __runInitializers(this, _onlineOrderId_initializers, void 0));
            this.method = (__runInitializers(this, _onlineOrderId_extraInitializers), __runInitializers(this, _method_initializers, void 0));
            this.amount = (__runInitializers(this, _method_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
            this.reference = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _reference_initializers, void 0));
            this.note = (__runInitializers(this, _reference_extraInitializers), __runInitializers(this, _note_initializers, void 0));
            this.razorpayOrderId = (__runInitializers(this, _note_extraInitializers), __runInitializers(this, _razorpayOrderId_initializers, void 0));
            this.razorpayPaymentId = (__runInitializers(this, _razorpayOrderId_extraInitializers), __runInitializers(this, _razorpayPaymentId_initializers, void 0));
            this.razorpaySignature = (__runInitializers(this, _razorpayPaymentId_extraInitializers), __runInitializers(this, _razorpaySignature_initializers, void 0));
            this.status = (__runInitializers(this, _razorpaySignature_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.emiPlan = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _emiPlan_initializers, void 0));
            this.createdAt = (__runInitializers(this, _emiPlan_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            // ─── Refund fields ─────────────────────────────────────────────────────────
            this.razorpayRefundId = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _razorpayRefundId_initializers, void 0));
            this.refundAmount = (__runInitializers(this, _razorpayRefundId_extraInitializers), __runInitializers(this, _refundAmount_initializers, void 0));
            this.refundStatus = (__runInitializers(this, _refundAmount_extraInitializers), __runInitializers(this, _refundStatus_initializers, void 0));
            this.refundedAt = (__runInitializers(this, _refundStatus_extraInitializers), __runInitializers(this, _refundedAt_initializers, void 0));
            __runInitializers(this, _refundedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Payment");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _sale_decorators = [ManyToOne(() => Sale, (s) => s.payments, { nullable: true, onDelete: 'CASCADE' }), JoinColumn({ name: 'sale_id' })];
        _saleId_decorators = [Column({ name: 'sale_id', nullable: true, type: 'varchar' })];
        _onlineOrder_decorators = [ManyToOne(() => OnlineOrder, (o) => o.payments, { nullable: true, onDelete: 'CASCADE' }), JoinColumn({ name: 'online_order_id' })];
        _onlineOrderId_decorators = [Column({ name: 'online_order_id', nullable: true, type: 'varchar' })];
        _method_decorators = [Column({ length: 50 })];
        _amount_decorators = [Column('decimal', { precision: 12, scale: 2 })];
        _reference_decorators = [Column({ nullable: true, type: 'varchar', length: 200 })];
        _note_decorators = [Column({ nullable: true, type: 'text' })];
        _razorpayOrderId_decorators = [Column({ name: 'razorpay_order_id', nullable: true, type: 'varchar' })];
        _razorpayPaymentId_decorators = [Column({ name: 'razorpay_payment_id', nullable: true, type: 'varchar' })];
        _razorpaySignature_decorators = [Column({ name: 'razorpay_signature', nullable: true, type: 'varchar' })];
        _status_decorators = [Column({ default: 'completed' })];
        _emiPlan_decorators = [Column({ name: 'emi_plan', nullable: true, type: 'jsonb' })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _razorpayRefundId_decorators = [Column({ name: 'razorpay_refund_id', nullable: true, type: 'varchar' })];
        _refundAmount_decorators = [Column({ name: 'refund_amount', nullable: true, type: 'decimal', precision: 12, scale: 2 })];
        _refundStatus_decorators = [Column({ name: 'refund_status', nullable: true, type: 'varchar', length: 50 })];
        _refundedAt_decorators = [Column({ name: 'refunded_at', nullable: true, type: 'timestamp' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _sale_decorators, { kind: "field", name: "sale", static: false, private: false, access: { has: obj => "sale" in obj, get: obj => obj.sale, set: (obj, value) => { obj.sale = value; } }, metadata: _metadata }, _sale_initializers, _sale_extraInitializers);
        __esDecorate(null, null, _saleId_decorators, { kind: "field", name: "saleId", static: false, private: false, access: { has: obj => "saleId" in obj, get: obj => obj.saleId, set: (obj, value) => { obj.saleId = value; } }, metadata: _metadata }, _saleId_initializers, _saleId_extraInitializers);
        __esDecorate(null, null, _onlineOrder_decorators, { kind: "field", name: "onlineOrder", static: false, private: false, access: { has: obj => "onlineOrder" in obj, get: obj => obj.onlineOrder, set: (obj, value) => { obj.onlineOrder = value; } }, metadata: _metadata }, _onlineOrder_initializers, _onlineOrder_extraInitializers);
        __esDecorate(null, null, _onlineOrderId_decorators, { kind: "field", name: "onlineOrderId", static: false, private: false, access: { has: obj => "onlineOrderId" in obj, get: obj => obj.onlineOrderId, set: (obj, value) => { obj.onlineOrderId = value; } }, metadata: _metadata }, _onlineOrderId_initializers, _onlineOrderId_extraInitializers);
        __esDecorate(null, null, _method_decorators, { kind: "field", name: "method", static: false, private: false, access: { has: obj => "method" in obj, get: obj => obj.method, set: (obj, value) => { obj.method = value; } }, metadata: _metadata }, _method_initializers, _method_extraInitializers);
        __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
        __esDecorate(null, null, _reference_decorators, { kind: "field", name: "reference", static: false, private: false, access: { has: obj => "reference" in obj, get: obj => obj.reference, set: (obj, value) => { obj.reference = value; } }, metadata: _metadata }, _reference_initializers, _reference_extraInitializers);
        __esDecorate(null, null, _note_decorators, { kind: "field", name: "note", static: false, private: false, access: { has: obj => "note" in obj, get: obj => obj.note, set: (obj, value) => { obj.note = value; } }, metadata: _metadata }, _note_initializers, _note_extraInitializers);
        __esDecorate(null, null, _razorpayOrderId_decorators, { kind: "field", name: "razorpayOrderId", static: false, private: false, access: { has: obj => "razorpayOrderId" in obj, get: obj => obj.razorpayOrderId, set: (obj, value) => { obj.razorpayOrderId = value; } }, metadata: _metadata }, _razorpayOrderId_initializers, _razorpayOrderId_extraInitializers);
        __esDecorate(null, null, _razorpayPaymentId_decorators, { kind: "field", name: "razorpayPaymentId", static: false, private: false, access: { has: obj => "razorpayPaymentId" in obj, get: obj => obj.razorpayPaymentId, set: (obj, value) => { obj.razorpayPaymentId = value; } }, metadata: _metadata }, _razorpayPaymentId_initializers, _razorpayPaymentId_extraInitializers);
        __esDecorate(null, null, _razorpaySignature_decorators, { kind: "field", name: "razorpaySignature", static: false, private: false, access: { has: obj => "razorpaySignature" in obj, get: obj => obj.razorpaySignature, set: (obj, value) => { obj.razorpaySignature = value; } }, metadata: _metadata }, _razorpaySignature_initializers, _razorpaySignature_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _emiPlan_decorators, { kind: "field", name: "emiPlan", static: false, private: false, access: { has: obj => "emiPlan" in obj, get: obj => obj.emiPlan, set: (obj, value) => { obj.emiPlan = value; } }, metadata: _metadata }, _emiPlan_initializers, _emiPlan_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _razorpayRefundId_decorators, { kind: "field", name: "razorpayRefundId", static: false, private: false, access: { has: obj => "razorpayRefundId" in obj, get: obj => obj.razorpayRefundId, set: (obj, value) => { obj.razorpayRefundId = value; } }, metadata: _metadata }, _razorpayRefundId_initializers, _razorpayRefundId_extraInitializers);
        __esDecorate(null, null, _refundAmount_decorators, { kind: "field", name: "refundAmount", static: false, private: false, access: { has: obj => "refundAmount" in obj, get: obj => obj.refundAmount, set: (obj, value) => { obj.refundAmount = value; } }, metadata: _metadata }, _refundAmount_initializers, _refundAmount_extraInitializers);
        __esDecorate(null, null, _refundStatus_decorators, { kind: "field", name: "refundStatus", static: false, private: false, access: { has: obj => "refundStatus" in obj, get: obj => obj.refundStatus, set: (obj, value) => { obj.refundStatus = value; } }, metadata: _metadata }, _refundStatus_initializers, _refundStatus_extraInitializers);
        __esDecorate(null, null, _refundedAt_decorators, { kind: "field", name: "refundedAt", static: false, private: false, access: { has: obj => "refundedAt" in obj, get: obj => obj.refundedAt, set: (obj, value) => { obj.refundedAt = value; } }, metadata: _metadata }, _refundedAt_initializers, _refundedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Payment = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Payment = _classThis;
})();
export { Payment };
//# sourceMappingURL=payment.entity.js.map