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
import { Branch, User } from '../../auth/entities/user.entity';
import { SaleItem } from './sale-item.entity';
import { Payment } from './payment.entity';
let Sale = (() => {
    let _classDecorators = [Entity('sales')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _invoiceNumber_decorators;
    let _invoiceNumber_initializers = [];
    let _invoiceNumber_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _branch_decorators;
    let _branch_initializers = [];
    let _branch_extraInitializers = [];
    let _branchId_decorators;
    let _branchId_initializers = [];
    let _branchId_extraInitializers = [];
    let _subtotal_decorators;
    let _subtotal_initializers = [];
    let _subtotal_extraInitializers = [];
    let _discountAmount_decorators;
    let _discountAmount_initializers = [];
    let _discountAmount_extraInitializers = [];
    let _taxAmount_decorators;
    let _taxAmount_initializers = [];
    let _taxAmount_extraInitializers = [];
    let _totalAmount_decorators;
    let _totalAmount_initializers = [];
    let _totalAmount_extraInitializers = [];
    let _paymentStatus_decorators;
    let _paymentStatus_initializers = [];
    let _paymentStatus_extraInitializers = [];
    let _saleType_decorators;
    let _saleType_initializers = [];
    let _saleType_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _createdById_decorators;
    let _createdById_initializers = [];
    let _createdById_extraInitializers = [];
    let _saleDate_decorators;
    let _saleDate_initializers = [];
    let _saleDate_extraInitializers = [];
    let _isVoided_decorators;
    let _isVoided_initializers = [];
    let _isVoided_extraInitializers = [];
    let _voidedById_decorators;
    let _voidedById_initializers = [];
    let _voidedById_extraInitializers = [];
    let _voidedAt_decorators;
    let _voidedAt_initializers = [];
    let _voidedAt_extraInitializers = [];
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
    var Sale = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.invoiceNumber = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _invoiceNumber_initializers, void 0));
            this.clientId = (__runInitializers(this, _invoiceNumber_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
            this.branch = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _branch_initializers, void 0));
            this.branchId = (__runInitializers(this, _branch_extraInitializers), __runInitializers(this, _branchId_initializers, void 0));
            this.subtotal = (__runInitializers(this, _branchId_extraInitializers), __runInitializers(this, _subtotal_initializers, void 0));
            this.discountAmount = (__runInitializers(this, _subtotal_extraInitializers), __runInitializers(this, _discountAmount_initializers, void 0));
            this.taxAmount = (__runInitializers(this, _discountAmount_extraInitializers), __runInitializers(this, _taxAmount_initializers, void 0));
            this.totalAmount = (__runInitializers(this, _taxAmount_extraInitializers), __runInitializers(this, _totalAmount_initializers, void 0));
            this.paymentStatus = (__runInitializers(this, _totalAmount_extraInitializers), __runInitializers(this, _paymentStatus_initializers, void 0));
            this.saleType = (__runInitializers(this, _paymentStatus_extraInitializers), __runInitializers(this, _saleType_initializers, void 0));
            this.notes = (__runInitializers(this, _saleType_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
            // DB column is 'created_by' not 'created_by_id'
            this.createdBy = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.createdById = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _createdById_initializers, void 0));
            this.saleDate = (__runInitializers(this, _createdById_extraInitializers), __runInitializers(this, _saleDate_initializers, void 0));
            this.isVoided = (__runInitializers(this, _saleDate_extraInitializers), __runInitializers(this, _isVoided_initializers, false));
            this.voidedById = (__runInitializers(this, _isVoided_extraInitializers), __runInitializers(this, _voidedById_initializers, null));
            this.voidedAt = (__runInitializers(this, _voidedById_extraInitializers), __runInitializers(this, _voidedAt_initializers, null));
            this.items = (__runInitializers(this, _voidedAt_extraInitializers), __runInitializers(this, _items_initializers, void 0));
            this.payments = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _payments_initializers, void 0));
            this.createdAt = (__runInitializers(this, _payments_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Sale");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _invoiceNumber_decorators = [Column({ name: 'invoice_number', unique: true })];
        _clientId_decorators = [Column({ name: 'client_id', nullable: true, type: 'varchar' })];
        _branch_decorators = [ManyToOne(() => Branch, { eager: false, nullable: false }), JoinColumn({ name: 'branch_id' })];
        _branchId_decorators = [Column({ name: 'branch_id' })];
        _subtotal_decorators = [Column('decimal', { precision: 12, scale: 2 })];
        _discountAmount_decorators = [Column('decimal', { name: 'discount_amount', precision: 12, scale: 2, default: 0 })];
        _taxAmount_decorators = [Column('decimal', { name: 'tax_amount', precision: 12, scale: 2, default: 0 })];
        _totalAmount_decorators = [Column('decimal', { name: 'total_amount', precision: 12, scale: 2 })];
        _paymentStatus_decorators = [Column({ name: 'payment_status', default: 'paid' })];
        _saleType_decorators = [Column({ name: 'sale_type', default: 'in-store' })];
        _notes_decorators = [Column({ nullable: true, type: 'text' })];
        _createdBy_decorators = [ManyToOne(() => User, { eager: false, nullable: true }), JoinColumn({ name: 'created_by' })];
        _createdById_decorators = [Column({ name: 'created_by', nullable: true, type: 'varchar' })];
        _saleDate_decorators = [Column({ name: 'sale_date', type: 'timestamptz', default: () => 'NOW()' })];
        _isVoided_decorators = [Column({ name: 'is_voided', default: false })];
        _voidedById_decorators = [Column({ name: 'voided_by', nullable: true, type: 'varchar' })];
        _voidedAt_decorators = [Column({ name: 'voided_at', nullable: true, type: 'timestamptz' })];
        _items_decorators = [OneToMany(() => SaleItem, (i) => i.sale)];
        _payments_decorators = [OneToMany(() => Payment, (p) => p.sale)];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _invoiceNumber_decorators, { kind: "field", name: "invoiceNumber", static: false, private: false, access: { has: obj => "invoiceNumber" in obj, get: obj => obj.invoiceNumber, set: (obj, value) => { obj.invoiceNumber = value; } }, metadata: _metadata }, _invoiceNumber_initializers, _invoiceNumber_extraInitializers);
        __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
        __esDecorate(null, null, _branch_decorators, { kind: "field", name: "branch", static: false, private: false, access: { has: obj => "branch" in obj, get: obj => obj.branch, set: (obj, value) => { obj.branch = value; } }, metadata: _metadata }, _branch_initializers, _branch_extraInitializers);
        __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: obj => "branchId" in obj, get: obj => obj.branchId, set: (obj, value) => { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
        __esDecorate(null, null, _subtotal_decorators, { kind: "field", name: "subtotal", static: false, private: false, access: { has: obj => "subtotal" in obj, get: obj => obj.subtotal, set: (obj, value) => { obj.subtotal = value; } }, metadata: _metadata }, _subtotal_initializers, _subtotal_extraInitializers);
        __esDecorate(null, null, _discountAmount_decorators, { kind: "field", name: "discountAmount", static: false, private: false, access: { has: obj => "discountAmount" in obj, get: obj => obj.discountAmount, set: (obj, value) => { obj.discountAmount = value; } }, metadata: _metadata }, _discountAmount_initializers, _discountAmount_extraInitializers);
        __esDecorate(null, null, _taxAmount_decorators, { kind: "field", name: "taxAmount", static: false, private: false, access: { has: obj => "taxAmount" in obj, get: obj => obj.taxAmount, set: (obj, value) => { obj.taxAmount = value; } }, metadata: _metadata }, _taxAmount_initializers, _taxAmount_extraInitializers);
        __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: obj => "totalAmount" in obj, get: obj => obj.totalAmount, set: (obj, value) => { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _totalAmount_extraInitializers);
        __esDecorate(null, null, _paymentStatus_decorators, { kind: "field", name: "paymentStatus", static: false, private: false, access: { has: obj => "paymentStatus" in obj, get: obj => obj.paymentStatus, set: (obj, value) => { obj.paymentStatus = value; } }, metadata: _metadata }, _paymentStatus_initializers, _paymentStatus_extraInitializers);
        __esDecorate(null, null, _saleType_decorators, { kind: "field", name: "saleType", static: false, private: false, access: { has: obj => "saleType" in obj, get: obj => obj.saleType, set: (obj, value) => { obj.saleType = value; } }, metadata: _metadata }, _saleType_initializers, _saleType_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _createdById_decorators, { kind: "field", name: "createdById", static: false, private: false, access: { has: obj => "createdById" in obj, get: obj => obj.createdById, set: (obj, value) => { obj.createdById = value; } }, metadata: _metadata }, _createdById_initializers, _createdById_extraInitializers);
        __esDecorate(null, null, _saleDate_decorators, { kind: "field", name: "saleDate", static: false, private: false, access: { has: obj => "saleDate" in obj, get: obj => obj.saleDate, set: (obj, value) => { obj.saleDate = value; } }, metadata: _metadata }, _saleDate_initializers, _saleDate_extraInitializers);
        __esDecorate(null, null, _isVoided_decorators, { kind: "field", name: "isVoided", static: false, private: false, access: { has: obj => "isVoided" in obj, get: obj => obj.isVoided, set: (obj, value) => { obj.isVoided = value; } }, metadata: _metadata }, _isVoided_initializers, _isVoided_extraInitializers);
        __esDecorate(null, null, _voidedById_decorators, { kind: "field", name: "voidedById", static: false, private: false, access: { has: obj => "voidedById" in obj, get: obj => obj.voidedById, set: (obj, value) => { obj.voidedById = value; } }, metadata: _metadata }, _voidedById_initializers, _voidedById_extraInitializers);
        __esDecorate(null, null, _voidedAt_decorators, { kind: "field", name: "voidedAt", static: false, private: false, access: { has: obj => "voidedAt" in obj, get: obj => obj.voidedAt, set: (obj, value) => { obj.voidedAt = value; } }, metadata: _metadata }, _voidedAt_initializers, _voidedAt_extraInitializers);
        __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
        __esDecorate(null, null, _payments_decorators, { kind: "field", name: "payments", static: false, private: false, access: { has: obj => "payments" in obj, get: obj => obj.payments, set: (obj, value) => { obj.payments = value; } }, metadata: _metadata }, _payments_initializers, _payments_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Sale = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Sale = _classThis;
})();
export { Sale };
//# sourceMappingURL=sale.entity.js.map