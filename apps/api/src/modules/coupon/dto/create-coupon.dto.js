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
import { IsString, IsNumber, IsOptional, IsBoolean, IsIn, Min, MaxLength, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export const COUPON_TYPES = ['percentage', 'fixed_amount', 'free_shipping', 'bogo'];
let CreateCouponDto = (() => {
    var _a;
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
    return _a = class CreateCouponDto {
            constructor() {
                this.code = __runInitializers(this, _code_initializers, void 0);
                this.type = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.value = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _value_initializers, void 0));
                this.minOrderAmount = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _minOrderAmount_initializers, void 0));
                this.maxDiscount = (__runInitializers(this, _minOrderAmount_extraInitializers), __runInitializers(this, _maxDiscount_initializers, void 0));
                this.usageLimit = (__runInitializers(this, _maxDiscount_extraInitializers), __runInitializers(this, _usageLimit_initializers, void 0));
                this.perUserLimit = (__runInitializers(this, _usageLimit_extraInitializers), __runInitializers(this, _perUserLimit_initializers, void 0));
                this.isActive = (__runInitializers(this, _perUserLimit_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
                this.startsAt = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _startsAt_initializers, void 0));
                this.expiresAt = (__runInitializers(this, _startsAt_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
                this.applicableBrands = (__runInitializers(this, _expiresAt_extraInitializers), __runInitializers(this, _applicableBrands_initializers, void 0));
                this.applicableCategories = (__runInitializers(this, _applicableBrands_extraInitializers), __runInitializers(this, _applicableCategories_initializers, void 0));
                this.freeItemSku = (__runInitializers(this, _applicableCategories_extraInitializers), __runInitializers(this, _freeItemSku_initializers, void 0));
                this.description = (__runInitializers(this, _freeItemSku_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                __runInitializers(this, _description_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _code_decorators = [ApiProperty({ description: 'Coupon code (user-facing, unique)' }), IsString(), MaxLength(50)];
            _type_decorators = [ApiProperty({ description: 'Discount type', enum: COUPON_TYPES }), IsIn(COUPON_TYPES)];
            _value_decorators = [ApiProperty({ description: 'Discount value (percentage or fixed amount)' }), IsNumber(), Min(0)];
            _minOrderAmount_decorators = [ApiPropertyOptional({ description: 'Minimum order amount to apply', default: 0 }), IsOptional(), IsNumber(), Min(0)];
            _maxDiscount_decorators = [ApiPropertyOptional({ description: 'Max discount cap (for percentage coupons)' }), IsOptional(), IsNumber(), Min(0)];
            _usageLimit_decorators = [ApiPropertyOptional({ description: 'Total usage limit (0 = unlimited)', default: 0 }), IsOptional(), IsNumber(), Min(0)];
            _perUserLimit_decorators = [ApiPropertyOptional({ description: 'Per-user usage limit', default: 1 }), IsOptional(), IsNumber(), Min(1)];
            _isActive_decorators = [ApiPropertyOptional({ description: 'Whether the coupon is active', default: true }), IsOptional(), IsBoolean()];
            _startsAt_decorators = [ApiPropertyOptional({ description: 'Start date (ISO string)' }), IsOptional(), IsString()];
            _expiresAt_decorators = [ApiPropertyOptional({ description: 'Expiry date (ISO string)' }), IsOptional(), IsString()];
            _applicableBrands_decorators = [ApiPropertyOptional({ description: 'Comma-separated brand IDs (empty = all brands)' }), IsOptional(), IsString()];
            _applicableCategories_decorators = [ApiPropertyOptional({ description: 'Comma-separated category slugs (empty = all)' }), IsOptional(), IsString()];
            _freeItemSku_decorators = [ApiPropertyOptional({ description: 'Free item SKU for BOGO coupons' }), IsOptional(), IsString()];
            _description_decorators = [ApiPropertyOptional({ description: 'Internal description / notes' }), IsOptional(), IsString()];
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            __esDecorate(null, null, _minOrderAmount_decorators, { kind: "field", name: "minOrderAmount", static: false, private: false, access: { has: obj => "minOrderAmount" in obj, get: obj => obj.minOrderAmount, set: (obj, value) => { obj.minOrderAmount = value; } }, metadata: _metadata }, _minOrderAmount_initializers, _minOrderAmount_extraInitializers);
            __esDecorate(null, null, _maxDiscount_decorators, { kind: "field", name: "maxDiscount", static: false, private: false, access: { has: obj => "maxDiscount" in obj, get: obj => obj.maxDiscount, set: (obj, value) => { obj.maxDiscount = value; } }, metadata: _metadata }, _maxDiscount_initializers, _maxDiscount_extraInitializers);
            __esDecorate(null, null, _usageLimit_decorators, { kind: "field", name: "usageLimit", static: false, private: false, access: { has: obj => "usageLimit" in obj, get: obj => obj.usageLimit, set: (obj, value) => { obj.usageLimit = value; } }, metadata: _metadata }, _usageLimit_initializers, _usageLimit_extraInitializers);
            __esDecorate(null, null, _perUserLimit_decorators, { kind: "field", name: "perUserLimit", static: false, private: false, access: { has: obj => "perUserLimit" in obj, get: obj => obj.perUserLimit, set: (obj, value) => { obj.perUserLimit = value; } }, metadata: _metadata }, _perUserLimit_initializers, _perUserLimit_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _startsAt_decorators, { kind: "field", name: "startsAt", static: false, private: false, access: { has: obj => "startsAt" in obj, get: obj => obj.startsAt, set: (obj, value) => { obj.startsAt = value; } }, metadata: _metadata }, _startsAt_initializers, _startsAt_extraInitializers);
            __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: obj => "expiresAt" in obj, get: obj => obj.expiresAt, set: (obj, value) => { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
            __esDecorate(null, null, _applicableBrands_decorators, { kind: "field", name: "applicableBrands", static: false, private: false, access: { has: obj => "applicableBrands" in obj, get: obj => obj.applicableBrands, set: (obj, value) => { obj.applicableBrands = value; } }, metadata: _metadata }, _applicableBrands_initializers, _applicableBrands_extraInitializers);
            __esDecorate(null, null, _applicableCategories_decorators, { kind: "field", name: "applicableCategories", static: false, private: false, access: { has: obj => "applicableCategories" in obj, get: obj => obj.applicableCategories, set: (obj, value) => { obj.applicableCategories = value; } }, metadata: _metadata }, _applicableCategories_initializers, _applicableCategories_extraInitializers);
            __esDecorate(null, null, _freeItemSku_decorators, { kind: "field", name: "freeItemSku", static: false, private: false, access: { has: obj => "freeItemSku" in obj, get: obj => obj.freeItemSku, set: (obj, value) => { obj.freeItemSku = value; } }, metadata: _metadata }, _freeItemSku_initializers, _freeItemSku_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreateCouponDto };
//# sourceMappingURL=create-coupon.dto.js.map