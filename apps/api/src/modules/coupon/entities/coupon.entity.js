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
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
let Coupon = (() => {
    let _classDecorators = [Entity('coupons')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    let _minOrderAmount_decorators;
    let _minOrderAmount_initializers = [];
    let _minOrderAmount_extraInitializers = [];
    let _maxDiscount_decorators;
    let _maxDiscount_initializers = [];
    let _maxDiscount_extraInitializers = [];
    let _usageLimit_decorators;
    let _usageLimit_initializers = [];
    let _usageLimit_extraInitializers = [];
    let _perUserLimit_decorators;
    let _perUserLimit_initializers = [];
    let _perUserLimit_extraInitializers = [];
    let _usedCount_decorators;
    let _usedCount_initializers = [];
    let _usedCount_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _startsAt_decorators;
    let _startsAt_initializers = [];
    let _startsAt_extraInitializers = [];
    let _expiresAt_decorators;
    let _expiresAt_initializers = [];
    let _expiresAt_extraInitializers = [];
    let _applicableBrands_decorators;
    let _applicableBrands_initializers = [];
    let _applicableBrands_extraInitializers = [];
    let _applicableCategories_decorators;
    let _applicableCategories_initializers = [];
    let _applicableCategories_extraInitializers = [];
    let _freeItemSku_decorators;
    let _freeItemSku_initializers = [];
    let _freeItemSku_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _createdById_decorators;
    let _createdById_initializers = [];
    let _createdById_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var Coupon = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.code = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _code_initializers, void 0));
            this.type = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            /** For percentage: the percent (e.g. 10 = 10%). For fixed_amount: the rupee amount */
            this.value = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _value_initializers, void 0));
            /** Minimum order subtotal required to apply this coupon */
            this.minOrderAmount = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _minOrderAmount_initializers, void 0));
            /** Maximum discount this coupon can give (for percentage coupons) */
            this.maxDiscount = (__runInitializers(this, _minOrderAmount_extraInitializers), __runInitializers(this, _maxDiscount_initializers, void 0));
            /** Total times this coupon can be used across all users */
            this.usageLimit = (__runInitializers(this, _maxDiscount_extraInitializers), __runInitializers(this, _usageLimit_initializers, void 0));
            /** How many times a single user can use this coupon */
            this.perUserLimit = (__runInitializers(this, _usageLimit_extraInitializers), __runInitializers(this, _perUserLimit_initializers, void 0));
            /** Running count of how many times the coupon has been used */
            this.usedCount = (__runInitializers(this, _perUserLimit_extraInitializers), __runInitializers(this, _usedCount_initializers, void 0));
            this.isActive = (__runInitializers(this, _usedCount_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
            this.startsAt = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _startsAt_initializers, void 0));
            this.expiresAt = (__runInitializers(this, _startsAt_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
            /** Optional: comma-separated list of brand IDs this coupon applies to (empty = all) */
            this.applicableBrands = (__runInitializers(this, _expiresAt_extraInitializers), __runInitializers(this, _applicableBrands_initializers, void 0));
            /** Optional: comma-separated list of category slugs this coupon applies to (empty = all) */
            this.applicableCategories = (__runInitializers(this, _applicableBrands_extraInitializers), __runInitializers(this, _applicableCategories_initializers, void 0));
            /** For BOGO: the accessory/product SKU that is free when buying a phone */
            this.freeItemSku = (__runInitializers(this, _applicableCategories_extraInitializers), __runInitializers(this, _freeItemSku_initializers, void 0));
            /** Internal description / admin notes */
            this.description = (__runInitializers(this, _freeItemSku_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.createdBy = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.createdById = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _createdById_initializers, void 0));
            this.createdAt = (__runInitializers(this, _createdById_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Coupon");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _code_decorators = [Column({ unique: true, length: 50 })];
        _type_decorators = [Column({ type: 'varchar', length: 20 })];
        _value_decorators = [Column('decimal', { precision: 12, scale: 2, default: 0 })];
        _minOrderAmount_decorators = [Column('decimal', { name: 'min_order_amount', precision: 12, scale: 2, default: 0 })];
        _maxDiscount_decorators = [Column('decimal', { name: 'max_discount', precision: 12, scale: 2, nullable: true })];
        _usageLimit_decorators = [Column({ name: 'usage_limit', default: 0 })];
        _perUserLimit_decorators = [Column({ name: 'per_user_limit', default: 1 })];
        _usedCount_decorators = [Column({ name: 'used_count', default: 0 })];
        _isActive_decorators = [Column({ name: 'is_active', default: true })];
        _startsAt_decorators = [Column({ name: 'starts_at', type: 'timestamptz', nullable: true })];
        _expiresAt_decorators = [Column({ name: 'expires_at', type: 'timestamptz', nullable: true })];
        _applicableBrands_decorators = [Column({ name: 'applicable_brands', type: 'text', nullable: true })];
        _applicableCategories_decorators = [Column({ name: 'applicable_categories', type: 'text', nullable: true })];
        _freeItemSku_decorators = [Column({ name: 'free_item_sku', type: 'varchar', length: 100, nullable: true })];
        _description_decorators = [Column({ type: 'text', nullable: true })];
        _createdBy_decorators = [ManyToOne(() => User, { eager: false, nullable: true }), JoinColumn({ name: 'created_by' })];
        _createdById_decorators = [Column({ name: 'created_by', nullable: true, type: 'varchar' })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
        __esDecorate(null, null, _minOrderAmount_decorators, { kind: "field", name: "minOrderAmount", static: false, private: false, access: { has: obj => "minOrderAmount" in obj, get: obj => obj.minOrderAmount, set: (obj, value) => { obj.minOrderAmount = value; } }, metadata: _metadata }, _minOrderAmount_initializers, _minOrderAmount_extraInitializers);
        __esDecorate(null, null, _maxDiscount_decorators, { kind: "field", name: "maxDiscount", static: false, private: false, access: { has: obj => "maxDiscount" in obj, get: obj => obj.maxDiscount, set: (obj, value) => { obj.maxDiscount = value; } }, metadata: _metadata }, _maxDiscount_initializers, _maxDiscount_extraInitializers);
        __esDecorate(null, null, _usageLimit_decorators, { kind: "field", name: "usageLimit", static: false, private: false, access: { has: obj => "usageLimit" in obj, get: obj => obj.usageLimit, set: (obj, value) => { obj.usageLimit = value; } }, metadata: _metadata }, _usageLimit_initializers, _usageLimit_extraInitializers);
        __esDecorate(null, null, _perUserLimit_decorators, { kind: "field", name: "perUserLimit", static: false, private: false, access: { has: obj => "perUserLimit" in obj, get: obj => obj.perUserLimit, set: (obj, value) => { obj.perUserLimit = value; } }, metadata: _metadata }, _perUserLimit_initializers, _perUserLimit_extraInitializers);
        __esDecorate(null, null, _usedCount_decorators, { kind: "field", name: "usedCount", static: false, private: false, access: { has: obj => "usedCount" in obj, get: obj => obj.usedCount, set: (obj, value) => { obj.usedCount = value; } }, metadata: _metadata }, _usedCount_initializers, _usedCount_extraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
        __esDecorate(null, null, _startsAt_decorators, { kind: "field", name: "startsAt", static: false, private: false, access: { has: obj => "startsAt" in obj, get: obj => obj.startsAt, set: (obj, value) => { obj.startsAt = value; } }, metadata: _metadata }, _startsAt_initializers, _startsAt_extraInitializers);
        __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: obj => "expiresAt" in obj, get: obj => obj.expiresAt, set: (obj, value) => { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
        __esDecorate(null, null, _applicableBrands_decorators, { kind: "field", name: "applicableBrands", static: false, private: false, access: { has: obj => "applicableBrands" in obj, get: obj => obj.applicableBrands, set: (obj, value) => { obj.applicableBrands = value; } }, metadata: _metadata }, _applicableBrands_initializers, _applicableBrands_extraInitializers);
        __esDecorate(null, null, _applicableCategories_decorators, { kind: "field", name: "applicableCategories", static: false, private: false, access: { has: obj => "applicableCategories" in obj, get: obj => obj.applicableCategories, set: (obj, value) => { obj.applicableCategories = value; } }, metadata: _metadata }, _applicableCategories_initializers, _applicableCategories_extraInitializers);
        __esDecorate(null, null, _freeItemSku_decorators, { kind: "field", name: "freeItemSku", static: false, private: false, access: { has: obj => "freeItemSku" in obj, get: obj => obj.freeItemSku, set: (obj, value) => { obj.freeItemSku = value; } }, metadata: _metadata }, _freeItemSku_initializers, _freeItemSku_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _createdById_decorators, { kind: "field", name: "createdById", static: false, private: false, access: { has: obj => "createdById" in obj, get: obj => obj.createdById, set: (obj, value) => { obj.createdById = value; } }, metadata: _metadata }, _createdById_initializers, _createdById_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Coupon = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Coupon = _classThis;
})();
export { Coupon };
//# sourceMappingURL=coupon.entity.js.map