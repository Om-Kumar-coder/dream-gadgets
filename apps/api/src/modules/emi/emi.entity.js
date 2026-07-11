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
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
let EmiProvider = (() => {
    let _classDecorators = [Entity('emi_providers')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _slug_decorators;
    let _slug_initializers = [];
    let _slug_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _logoUrl_decorators;
    let _logoUrl_initializers = [];
    let _logoUrl_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    let _plans_decorators;
    let _plans_initializers = [];
    let _plans_extraInitializers = [];
    var EmiProvider = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.slug = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _slug_initializers, void 0));
            this.description = (__runInitializers(this, _slug_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.logoUrl = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _logoUrl_initializers, void 0));
            this.isActive = (__runInitializers(this, _logoUrl_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
            this.sortOrder = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
            this.createdAt = (__runInitializers(this, _sortOrder_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            this.plans = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _plans_initializers, void 0));
            __runInitializers(this, _plans_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "EmiProvider");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _name_decorators = [Column({ type: 'varchar', length: 100 })];
        _slug_decorators = [Column({ type: 'varchar', length: 50, unique: true })];
        _description_decorators = [Column({ type: 'text', nullable: true })];
        _logoUrl_decorators = [Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })];
        _isActive_decorators = [Column({ name: 'is_active', type: 'boolean', default: true })];
        _sortOrder_decorators = [Column({ name: 'sort_order', type: 'integer', default: 0 })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
        _plans_decorators = [OneToMany(() => EmiPlan, (plan) => plan.provider)];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _slug_decorators, { kind: "field", name: "slug", static: false, private: false, access: { has: obj => "slug" in obj, get: obj => obj.slug, set: (obj, value) => { obj.slug = value; } }, metadata: _metadata }, _slug_initializers, _slug_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _logoUrl_decorators, { kind: "field", name: "logoUrl", static: false, private: false, access: { has: obj => "logoUrl" in obj, get: obj => obj.logoUrl, set: (obj, value) => { obj.logoUrl = value; } }, metadata: _metadata }, _logoUrl_initializers, _logoUrl_extraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
        __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _plans_decorators, { kind: "field", name: "plans", static: false, private: false, access: { has: obj => "plans" in obj, get: obj => obj.plans, set: (obj, value) => { obj.plans = value; } }, metadata: _metadata }, _plans_initializers, _plans_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EmiProvider = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EmiProvider = _classThis;
})();
export { EmiProvider };
let EmiPlan = (() => {
    let _classDecorators = [Entity('emi_plans')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _providerId_decorators;
    let _providerId_initializers = [];
    let _providerId_extraInitializers = [];
    let _provider_decorators;
    let _provider_initializers = [];
    let _provider_extraInitializers = [];
    let _label_decorators;
    let _label_initializers = [];
    let _label_extraInitializers = [];
    let _tenureMonths_decorators;
    let _tenureMonths_initializers = [];
    let _tenureMonths_extraInitializers = [];
    let _minAmount_decorators;
    let _minAmount_initializers = [];
    let _minAmount_extraInitializers = [];
    let _maxAmount_decorators;
    let _maxAmount_initializers = [];
    let _maxAmount_extraInitializers = [];
    let _annualRate_decorators;
    let _annualRate_initializers = [];
    let _annualRate_extraInitializers = [];
    let _processingFee_decorators;
    let _processingFee_initializers = [];
    let _processingFee_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var EmiPlan = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.providerId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _providerId_initializers, void 0));
            this.provider = (__runInitializers(this, _providerId_extraInitializers), __runInitializers(this, _provider_initializers, void 0));
            this.label = (__runInitializers(this, _provider_extraInitializers), __runInitializers(this, _label_initializers, void 0));
            this.tenureMonths = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _tenureMonths_initializers, void 0));
            this.minAmount = (__runInitializers(this, _tenureMonths_extraInitializers), __runInitializers(this, _minAmount_initializers, void 0));
            this.maxAmount = (__runInitializers(this, _minAmount_extraInitializers), __runInitializers(this, _maxAmount_initializers, void 0));
            this.annualRate = (__runInitializers(this, _maxAmount_extraInitializers), __runInitializers(this, _annualRate_initializers, void 0));
            this.processingFee = (__runInitializers(this, _annualRate_extraInitializers), __runInitializers(this, _processingFee_initializers, void 0));
            this.isActive = (__runInitializers(this, _processingFee_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
            this.sortOrder = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
            this.createdAt = (__runInitializers(this, _sortOrder_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "EmiPlan");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _providerId_decorators = [Column({ name: 'provider_id', type: 'uuid' })];
        _provider_decorators = [ManyToOne(() => EmiProvider, (provider) => provider.plans, { onDelete: 'CASCADE' }), JoinColumn({ name: 'provider_id' })];
        _label_decorators = [Column({ type: 'varchar', length: 100 })];
        _tenureMonths_decorators = [Column({ name: 'tenure_months', type: 'integer' })];
        _minAmount_decorators = [Column({ name: 'min_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })];
        _maxAmount_decorators = [Column({ name: 'max_amount', type: 'numeric', precision: 10, scale: 2, nullable: true })];
        _annualRate_decorators = [Column({ name: 'annual_rate', type: 'numeric', precision: 5, scale: 2 })];
        _processingFee_decorators = [Column({ name: 'processing_fee', type: 'numeric', precision: 10, scale: 2, default: 0 })];
        _isActive_decorators = [Column({ name: 'is_active', type: 'boolean', default: true })];
        _sortOrder_decorators = [Column({ name: 'sort_order', type: 'integer', default: 0 })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _providerId_decorators, { kind: "field", name: "providerId", static: false, private: false, access: { has: obj => "providerId" in obj, get: obj => obj.providerId, set: (obj, value) => { obj.providerId = value; } }, metadata: _metadata }, _providerId_initializers, _providerId_extraInitializers);
        __esDecorate(null, null, _provider_decorators, { kind: "field", name: "provider", static: false, private: false, access: { has: obj => "provider" in obj, get: obj => obj.provider, set: (obj, value) => { obj.provider = value; } }, metadata: _metadata }, _provider_initializers, _provider_extraInitializers);
        __esDecorate(null, null, _label_decorators, { kind: "field", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
        __esDecorate(null, null, _tenureMonths_decorators, { kind: "field", name: "tenureMonths", static: false, private: false, access: { has: obj => "tenureMonths" in obj, get: obj => obj.tenureMonths, set: (obj, value) => { obj.tenureMonths = value; } }, metadata: _metadata }, _tenureMonths_initializers, _tenureMonths_extraInitializers);
        __esDecorate(null, null, _minAmount_decorators, { kind: "field", name: "minAmount", static: false, private: false, access: { has: obj => "minAmount" in obj, get: obj => obj.minAmount, set: (obj, value) => { obj.minAmount = value; } }, metadata: _metadata }, _minAmount_initializers, _minAmount_extraInitializers);
        __esDecorate(null, null, _maxAmount_decorators, { kind: "field", name: "maxAmount", static: false, private: false, access: { has: obj => "maxAmount" in obj, get: obj => obj.maxAmount, set: (obj, value) => { obj.maxAmount = value; } }, metadata: _metadata }, _maxAmount_initializers, _maxAmount_extraInitializers);
        __esDecorate(null, null, _annualRate_decorators, { kind: "field", name: "annualRate", static: false, private: false, access: { has: obj => "annualRate" in obj, get: obj => obj.annualRate, set: (obj, value) => { obj.annualRate = value; } }, metadata: _metadata }, _annualRate_initializers, _annualRate_extraInitializers);
        __esDecorate(null, null, _processingFee_decorators, { kind: "field", name: "processingFee", static: false, private: false, access: { has: obj => "processingFee" in obj, get: obj => obj.processingFee, set: (obj, value) => { obj.processingFee = value; } }, metadata: _metadata }, _processingFee_initializers, _processingFee_extraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
        __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EmiPlan = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EmiPlan = _classThis;
})();
export { EmiPlan };
//# sourceMappingURL=emi.entity.js.map