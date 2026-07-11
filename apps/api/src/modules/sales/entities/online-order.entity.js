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
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, } from 'typeorm';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { Client } from '../../client/entities/client.entity';
import { Branch, User } from '../../auth/entities/user.entity';
import { Payment } from './payment.entity';
import { OnlineOrderItem } from './online-order-item.entity';
let OnlineOrder = (() => {
    let _classDecorators = [Entity('online_orders')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _orderNumber_decorators;
    let _orderNumber_initializers = [];
    let _orderNumber_extraInitializers = [];
    let _client_decorators;
    let _client_initializers = [];
    let _client_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _branch_decorators;
    let _branch_initializers = [];
    let _branch_extraInitializers = [];
    let _branchId_decorators;
    let _branchId_initializers = [];
    let _branchId_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _subtotal_decorators;
    let _subtotal_initializers = [];
    let _subtotal_extraInitializers = [];
    let _shippingCharge_decorators;
    let _shippingCharge_initializers = [];
    let _shippingCharge_extraInitializers = [];
    let _discountAmount_decorators;
    let _discountAmount_initializers = [];
    let _discountAmount_extraInitializers = [];
    let _taxAmount_decorators;
    let _taxAmount_initializers = [];
    let _taxAmount_extraInitializers = [];
    let _totalAmount_decorators;
    let _totalAmount_initializers = [];
    let _totalAmount_extraInitializers = [];
    let _shippingAddress_decorators;
    let _shippingAddress_initializers = [];
    let _shippingAddress_extraInitializers = [];
    let _trackingNumber_decorators;
    let _trackingNumber_initializers = [];
    let _trackingNumber_extraInitializers = [];
    let _courier_decorators;
    let _courier_initializers = [];
    let _courier_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _assignedTo_decorators;
    let _assignedTo_initializers = [];
    let _assignedTo_extraInitializers = [];
    let _assignedToId_decorators;
    let _assignedToId_initializers = [];
    let _assignedToId_extraInitializers = [];
    let _orderedAt_decorators;
    let _orderedAt_initializers = [];
    let _orderedAt_extraInitializers = [];
    let _shippedAt_decorators;
    let _shippedAt_initializers = [];
    let _shippedAt_extraInitializers = [];
    let _deliveredAt_decorators;
    let _deliveredAt_initializers = [];
    let _deliveredAt_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    let _payments_decorators;
    let _payments_initializers = [];
    let _payments_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var OnlineOrder = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.orderNumber = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _orderNumber_initializers, void 0));
            this.client = (__runInitializers(this, _orderNumber_extraInitializers), __runInitializers(this, _client_initializers, void 0));
            this.clientId = (__runInitializers(this, _client_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
            this.branch = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _branch_initializers, void 0));
            this.branchId = (__runInitializers(this, _branch_extraInitializers), __runInitializers(this, _branchId_initializers, void 0));
            this.status = (__runInitializers(this, _branchId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.subtotal = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _subtotal_initializers, void 0));
            this.shippingCharge = (__runInitializers(this, _subtotal_extraInitializers), __runInitializers(this, _shippingCharge_initializers, void 0));
            this.discountAmount = (__runInitializers(this, _shippingCharge_extraInitializers), __runInitializers(this, _discountAmount_initializers, void 0));
            this.taxAmount = (__runInitializers(this, _discountAmount_extraInitializers), __runInitializers(this, _taxAmount_initializers, void 0));
            this.totalAmount = (__runInitializers(this, _taxAmount_extraInitializers), __runInitializers(this, _totalAmount_initializers, void 0));
            this.shippingAddress = (__runInitializers(this, _totalAmount_extraInitializers), __runInitializers(this, _shippingAddress_initializers, void 0));
            this.trackingNumber = (__runInitializers(this, _shippingAddress_extraInitializers), __runInitializers(this, _trackingNumber_initializers, void 0));
            this.courier = (__runInitializers(this, _trackingNumber_extraInitializers), __runInitializers(this, _courier_initializers, void 0));
            this.notes = (__runInitializers(this, _courier_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
            this.assignedTo = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _assignedTo_initializers, void 0));
            this.assignedToId = (__runInitializers(this, _assignedTo_extraInitializers), __runInitializers(this, _assignedToId_initializers, void 0));
            this.orderedAt = (__runInitializers(this, _assignedToId_extraInitializers), __runInitializers(this, _orderedAt_initializers, void 0));
            this.shippedAt = (__runInitializers(this, _orderedAt_extraInitializers), __runInitializers(this, _shippedAt_initializers, void 0));
            this.deliveredAt = (__runInitializers(this, _shippedAt_extraInitializers), __runInitializers(this, _deliveredAt_initializers, void 0));
            this.items = (__runInitializers(this, _deliveredAt_extraInitializers), __runInitializers(this, _items_initializers, void 0));
            this.payments = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _payments_initializers, void 0));
            this.createdAt = (__runInitializers(this, _payments_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "OnlineOrder");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _orderNumber_decorators = [Column({ name: 'order_number', unique: true })];
        _client_decorators = [ManyToOne(() => Client, { eager: false, nullable: true }), JoinColumn({ name: 'client_id' })];
        _clientId_decorators = [Column({ name: 'client_id', nullable: true, type: 'varchar' })];
        _branch_decorators = [ManyToOne(() => Branch, { eager: false, nullable: false }), JoinColumn({ name: 'branch_id' })];
        _branchId_decorators = [Column({ name: 'branch_id' })];
        _status_decorators = [Column({
                name: 'status',
                type: 'varchar',
                length: 50,
                default: OnlineOrderStatus.PENDING_PAYMENT,
            })];
        _subtotal_decorators = [Column('decimal', { precision: 12, scale: 2 })];
        _shippingCharge_decorators = [Column('decimal', { name: 'shipping_charge', precision: 12, scale: 2, default: 0 })];
        _discountAmount_decorators = [Column('decimal', { name: 'discount_amount', precision: 12, scale: 2, default: 0 })];
        _taxAmount_decorators = [Column('decimal', { name: 'tax_amount', precision: 12, scale: 2, default: 0 })];
        _totalAmount_decorators = [Column('decimal', { name: 'total_amount', precision: 12, scale: 2 })];
        _shippingAddress_decorators = [Column({ name: 'shipping_address', type: 'jsonb' })];
        _trackingNumber_decorators = [Column({ name: 'tracking_number', type: 'varchar', nullable: true })];
        _courier_decorators = [Column({ name: 'courier', type: 'varchar', nullable: true })];
        _notes_decorators = [Column({ nullable: true, type: 'text' })];
        _assignedTo_decorators = [ManyToOne(() => User, { eager: false, nullable: true }), JoinColumn({ name: 'assigned_to' })];
        _assignedToId_decorators = [Column({ name: 'assigned_to', nullable: true, type: 'varchar' })];
        _orderedAt_decorators = [Column({ name: 'ordered_at', type: 'timestamptz', default: () => 'NOW()' })];
        _shippedAt_decorators = [Column({ name: 'shipped_at', nullable: true, type: 'timestamptz' })];
        _deliveredAt_decorators = [Column({ name: 'delivered_at', nullable: true, type: 'timestamptz' })];
        _items_decorators = [OneToMany(() => OnlineOrderItem, (i) => i.order, { cascade: ['insert'] })];
        _payments_decorators = [OneToMany(() => Payment, (p) => p.onlineOrder)];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _orderNumber_decorators, { kind: "field", name: "orderNumber", static: false, private: false, access: { has: obj => "orderNumber" in obj, get: obj => obj.orderNumber, set: (obj, value) => { obj.orderNumber = value; } }, metadata: _metadata }, _orderNumber_initializers, _orderNumber_extraInitializers);
        __esDecorate(null, null, _client_decorators, { kind: "field", name: "client", static: false, private: false, access: { has: obj => "client" in obj, get: obj => obj.client, set: (obj, value) => { obj.client = value; } }, metadata: _metadata }, _client_initializers, _client_extraInitializers);
        __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
        __esDecorate(null, null, _branch_decorators, { kind: "field", name: "branch", static: false, private: false, access: { has: obj => "branch" in obj, get: obj => obj.branch, set: (obj, value) => { obj.branch = value; } }, metadata: _metadata }, _branch_initializers, _branch_extraInitializers);
        __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: obj => "branchId" in obj, get: obj => obj.branchId, set: (obj, value) => { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _subtotal_decorators, { kind: "field", name: "subtotal", static: false, private: false, access: { has: obj => "subtotal" in obj, get: obj => obj.subtotal, set: (obj, value) => { obj.subtotal = value; } }, metadata: _metadata }, _subtotal_initializers, _subtotal_extraInitializers);
        __esDecorate(null, null, _shippingCharge_decorators, { kind: "field", name: "shippingCharge", static: false, private: false, access: { has: obj => "shippingCharge" in obj, get: obj => obj.shippingCharge, set: (obj, value) => { obj.shippingCharge = value; } }, metadata: _metadata }, _shippingCharge_initializers, _shippingCharge_extraInitializers);
        __esDecorate(null, null, _discountAmount_decorators, { kind: "field", name: "discountAmount", static: false, private: false, access: { has: obj => "discountAmount" in obj, get: obj => obj.discountAmount, set: (obj, value) => { obj.discountAmount = value; } }, metadata: _metadata }, _discountAmount_initializers, _discountAmount_extraInitializers);
        __esDecorate(null, null, _taxAmount_decorators, { kind: "field", name: "taxAmount", static: false, private: false, access: { has: obj => "taxAmount" in obj, get: obj => obj.taxAmount, set: (obj, value) => { obj.taxAmount = value; } }, metadata: _metadata }, _taxAmount_initializers, _taxAmount_extraInitializers);
        __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: obj => "totalAmount" in obj, get: obj => obj.totalAmount, set: (obj, value) => { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _totalAmount_extraInitializers);
        __esDecorate(null, null, _shippingAddress_decorators, { kind: "field", name: "shippingAddress", static: false, private: false, access: { has: obj => "shippingAddress" in obj, get: obj => obj.shippingAddress, set: (obj, value) => { obj.shippingAddress = value; } }, metadata: _metadata }, _shippingAddress_initializers, _shippingAddress_extraInitializers);
        __esDecorate(null, null, _trackingNumber_decorators, { kind: "field", name: "trackingNumber", static: false, private: false, access: { has: obj => "trackingNumber" in obj, get: obj => obj.trackingNumber, set: (obj, value) => { obj.trackingNumber = value; } }, metadata: _metadata }, _trackingNumber_initializers, _trackingNumber_extraInitializers);
        __esDecorate(null, null, _courier_decorators, { kind: "field", name: "courier", static: false, private: false, access: { has: obj => "courier" in obj, get: obj => obj.courier, set: (obj, value) => { obj.courier = value; } }, metadata: _metadata }, _courier_initializers, _courier_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, null, _assignedTo_decorators, { kind: "field", name: "assignedTo", static: false, private: false, access: { has: obj => "assignedTo" in obj, get: obj => obj.assignedTo, set: (obj, value) => { obj.assignedTo = value; } }, metadata: _metadata }, _assignedTo_initializers, _assignedTo_extraInitializers);
        __esDecorate(null, null, _assignedToId_decorators, { kind: "field", name: "assignedToId", static: false, private: false, access: { has: obj => "assignedToId" in obj, get: obj => obj.assignedToId, set: (obj, value) => { obj.assignedToId = value; } }, metadata: _metadata }, _assignedToId_initializers, _assignedToId_extraInitializers);
        __esDecorate(null, null, _orderedAt_decorators, { kind: "field", name: "orderedAt", static: false, private: false, access: { has: obj => "orderedAt" in obj, get: obj => obj.orderedAt, set: (obj, value) => { obj.orderedAt = value; } }, metadata: _metadata }, _orderedAt_initializers, _orderedAt_extraInitializers);
        __esDecorate(null, null, _shippedAt_decorators, { kind: "field", name: "shippedAt", static: false, private: false, access: { has: obj => "shippedAt" in obj, get: obj => obj.shippedAt, set: (obj, value) => { obj.shippedAt = value; } }, metadata: _metadata }, _shippedAt_initializers, _shippedAt_extraInitializers);
        __esDecorate(null, null, _deliveredAt_decorators, { kind: "field", name: "deliveredAt", static: false, private: false, access: { has: obj => "deliveredAt" in obj, get: obj => obj.deliveredAt, set: (obj, value) => { obj.deliveredAt = value; } }, metadata: _metadata }, _deliveredAt_initializers, _deliveredAt_extraInitializers);
        __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
        __esDecorate(null, null, _payments_decorators, { kind: "field", name: "payments", static: false, private: false, access: { has: obj => "payments" in obj, get: obj => obj.payments, set: (obj, value) => { obj.payments = value; } }, metadata: _metadata }, _payments_initializers, _payments_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OnlineOrder = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OnlineOrder = _classThis;
})();
export { OnlineOrder };
//# sourceMappingURL=online-order.entity.js.map