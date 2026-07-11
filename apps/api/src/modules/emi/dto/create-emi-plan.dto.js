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
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max, MinLength, MaxLength, IsUUID } from 'class-validator';
let CreateEmiPlanDto = (() => {
    var _a;
    let _providerId_decorators;
    let _providerId_initializers = [];
    let _providerId_extraInitializers = [];
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
    return _a = class CreateEmiPlanDto {
            constructor() {
                this.providerId = __runInitializers(this, _providerId_initializers, void 0);
                this.label = (__runInitializers(this, _providerId_extraInitializers), __runInitializers(this, _label_initializers, void 0));
                this.tenureMonths = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _tenureMonths_initializers, void 0));
                this.minAmount = (__runInitializers(this, _tenureMonths_extraInitializers), __runInitializers(this, _minAmount_initializers, void 0));
                this.maxAmount = (__runInitializers(this, _minAmount_extraInitializers), __runInitializers(this, _maxAmount_initializers, void 0));
                this.annualRate = (__runInitializers(this, _maxAmount_extraInitializers), __runInitializers(this, _annualRate_initializers, void 0));
                this.processingFee = (__runInitializers(this, _annualRate_extraInitializers), __runInitializers(this, _processingFee_initializers, void 0));
                this.isActive = (__runInitializers(this, _processingFee_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
                this.sortOrder = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
                __runInitializers(this, _sortOrder_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _providerId_decorators = [IsUUID()];
            _label_decorators = [IsString(), MinLength(2), MaxLength(100)];
            _tenureMonths_decorators = [IsNumber(), Min(1), Max(84)];
            _minAmount_decorators = [IsOptional(), IsNumber(), Min(0)];
            _maxAmount_decorators = [IsOptional(), IsNumber(), Min(0)];
            _annualRate_decorators = [IsNumber(), Min(0), Max(100)];
            _processingFee_decorators = [IsOptional(), IsNumber(), Min(0)];
            _isActive_decorators = [IsOptional(), IsBoolean()];
            _sortOrder_decorators = [IsOptional(), IsNumber()];
            __esDecorate(null, null, _providerId_decorators, { kind: "field", name: "providerId", static: false, private: false, access: { has: obj => "providerId" in obj, get: obj => obj.providerId, set: (obj, value) => { obj.providerId = value; } }, metadata: _metadata }, _providerId_initializers, _providerId_extraInitializers);
            __esDecorate(null, null, _label_decorators, { kind: "field", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            __esDecorate(null, null, _tenureMonths_decorators, { kind: "field", name: "tenureMonths", static: false, private: false, access: { has: obj => "tenureMonths" in obj, get: obj => obj.tenureMonths, set: (obj, value) => { obj.tenureMonths = value; } }, metadata: _metadata }, _tenureMonths_initializers, _tenureMonths_extraInitializers);
            __esDecorate(null, null, _minAmount_decorators, { kind: "field", name: "minAmount", static: false, private: false, access: { has: obj => "minAmount" in obj, get: obj => obj.minAmount, set: (obj, value) => { obj.minAmount = value; } }, metadata: _metadata }, _minAmount_initializers, _minAmount_extraInitializers);
            __esDecorate(null, null, _maxAmount_decorators, { kind: "field", name: "maxAmount", static: false, private: false, access: { has: obj => "maxAmount" in obj, get: obj => obj.maxAmount, set: (obj, value) => { obj.maxAmount = value; } }, metadata: _metadata }, _maxAmount_initializers, _maxAmount_extraInitializers);
            __esDecorate(null, null, _annualRate_decorators, { kind: "field", name: "annualRate", static: false, private: false, access: { has: obj => "annualRate" in obj, get: obj => obj.annualRate, set: (obj, value) => { obj.annualRate = value; } }, metadata: _metadata }, _annualRate_initializers, _annualRate_extraInitializers);
            __esDecorate(null, null, _processingFee_decorators, { kind: "field", name: "processingFee", static: false, private: false, access: { has: obj => "processingFee" in obj, get: obj => obj.processingFee, set: (obj, value) => { obj.processingFee = value; } }, metadata: _metadata }, _processingFee_initializers, _processingFee_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreateEmiPlanDto };
let UpdateEmiPlanDto = (() => {
    var _a;
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
    return _a = class UpdateEmiPlanDto {
            constructor() {
                this.label = __runInitializers(this, _label_initializers, void 0);
                this.tenureMonths = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _tenureMonths_initializers, void 0));
                this.minAmount = (__runInitializers(this, _tenureMonths_extraInitializers), __runInitializers(this, _minAmount_initializers, void 0));
                this.maxAmount = (__runInitializers(this, _minAmount_extraInitializers), __runInitializers(this, _maxAmount_initializers, void 0));
                this.annualRate = (__runInitializers(this, _maxAmount_extraInitializers), __runInitializers(this, _annualRate_initializers, void 0));
                this.processingFee = (__runInitializers(this, _annualRate_extraInitializers), __runInitializers(this, _processingFee_initializers, void 0));
                this.isActive = (__runInitializers(this, _processingFee_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
                this.sortOrder = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
                __runInitializers(this, _sortOrder_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _label_decorators = [IsOptional(), IsString(), MinLength(2), MaxLength(100)];
            _tenureMonths_decorators = [IsOptional(), IsNumber(), Min(1), Max(84)];
            _minAmount_decorators = [IsOptional(), IsNumber(), Min(0)];
            _maxAmount_decorators = [IsOptional(), IsNumber(), Min(0)];
            _annualRate_decorators = [IsOptional(), IsNumber(), Min(0), Max(100)];
            _processingFee_decorators = [IsOptional(), IsNumber(), Min(0)];
            _isActive_decorators = [IsOptional(), IsBoolean()];
            _sortOrder_decorators = [IsOptional(), IsNumber()];
            __esDecorate(null, null, _label_decorators, { kind: "field", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            __esDecorate(null, null, _tenureMonths_decorators, { kind: "field", name: "tenureMonths", static: false, private: false, access: { has: obj => "tenureMonths" in obj, get: obj => obj.tenureMonths, set: (obj, value) => { obj.tenureMonths = value; } }, metadata: _metadata }, _tenureMonths_initializers, _tenureMonths_extraInitializers);
            __esDecorate(null, null, _minAmount_decorators, { kind: "field", name: "minAmount", static: false, private: false, access: { has: obj => "minAmount" in obj, get: obj => obj.minAmount, set: (obj, value) => { obj.minAmount = value; } }, metadata: _metadata }, _minAmount_initializers, _minAmount_extraInitializers);
            __esDecorate(null, null, _maxAmount_decorators, { kind: "field", name: "maxAmount", static: false, private: false, access: { has: obj => "maxAmount" in obj, get: obj => obj.maxAmount, set: (obj, value) => { obj.maxAmount = value; } }, metadata: _metadata }, _maxAmount_initializers, _maxAmount_extraInitializers);
            __esDecorate(null, null, _annualRate_decorators, { kind: "field", name: "annualRate", static: false, private: false, access: { has: obj => "annualRate" in obj, get: obj => obj.annualRate, set: (obj, value) => { obj.annualRate = value; } }, metadata: _metadata }, _annualRate_initializers, _annualRate_extraInitializers);
            __esDecorate(null, null, _processingFee_decorators, { kind: "field", name: "processingFee", static: false, private: false, access: { has: obj => "processingFee" in obj, get: obj => obj.processingFee, set: (obj, value) => { obj.processingFee = value; } }, metadata: _metadata }, _processingFee_initializers, _processingFee_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { UpdateEmiPlanDto };
let EmiQueryDto = (() => {
    var _a;
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _providerSlug_decorators;
    let _providerSlug_initializers = [];
    let _providerSlug_extraInitializers = [];
    return _a = class EmiQueryDto {
            constructor() {
                this.amount = __runInitializers(this, _amount_initializers, void 0);
                this.providerSlug = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _providerSlug_initializers, void 0));
                __runInitializers(this, _providerSlug_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _amount_decorators = [IsOptional(), IsNumber(), Min(0)];
            _providerSlug_decorators = [IsOptional(), IsString()];
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _providerSlug_decorators, { kind: "field", name: "providerSlug", static: false, private: false, access: { has: obj => "providerSlug" in obj, get: obj => obj.providerSlug, set: (obj, value) => { obj.providerSlug = value; } }, metadata: _metadata }, _providerSlug_initializers, _providerSlug_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { EmiQueryDto };
let CalculateEmiDto = (() => {
    var _a;
    let _principal_decorators;
    let _principal_initializers = [];
    let _principal_extraInitializers = [];
    let _tenureMonths_decorators;
    let _tenureMonths_initializers = [];
    let _tenureMonths_extraInitializers = [];
    let _annualRate_decorators;
    let _annualRate_initializers = [];
    let _annualRate_extraInitializers = [];
    let _processingFee_decorators;
    let _processingFee_initializers = [];
    let _processingFee_extraInitializers = [];
    return _a = class CalculateEmiDto {
            constructor() {
                this.principal = __runInitializers(this, _principal_initializers, void 0);
                this.tenureMonths = (__runInitializers(this, _principal_extraInitializers), __runInitializers(this, _tenureMonths_initializers, void 0));
                this.annualRate = (__runInitializers(this, _tenureMonths_extraInitializers), __runInitializers(this, _annualRate_initializers, void 0));
                this.processingFee = (__runInitializers(this, _annualRate_extraInitializers), __runInitializers(this, _processingFee_initializers, void 0));
                __runInitializers(this, _processingFee_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _principal_decorators = [IsNumber(), Min(0)];
            _tenureMonths_decorators = [IsNumber(), Min(1), Max(84)];
            _annualRate_decorators = [IsNumber(), Min(0), Max(100)];
            _processingFee_decorators = [IsOptional(), IsNumber(), Min(0)];
            __esDecorate(null, null, _principal_decorators, { kind: "field", name: "principal", static: false, private: false, access: { has: obj => "principal" in obj, get: obj => obj.principal, set: (obj, value) => { obj.principal = value; } }, metadata: _metadata }, _principal_initializers, _principal_extraInitializers);
            __esDecorate(null, null, _tenureMonths_decorators, { kind: "field", name: "tenureMonths", static: false, private: false, access: { has: obj => "tenureMonths" in obj, get: obj => obj.tenureMonths, set: (obj, value) => { obj.tenureMonths = value; } }, metadata: _metadata }, _tenureMonths_initializers, _tenureMonths_extraInitializers);
            __esDecorate(null, null, _annualRate_decorators, { kind: "field", name: "annualRate", static: false, private: false, access: { has: obj => "annualRate" in obj, get: obj => obj.annualRate, set: (obj, value) => { obj.annualRate = value; } }, metadata: _metadata }, _annualRate_initializers, _annualRate_extraInitializers);
            __esDecorate(null, null, _processingFee_decorators, { kind: "field", name: "processingFee", static: false, private: false, access: { has: obj => "processingFee" in obj, get: obj => obj.processingFee, set: (obj, value) => { obj.processingFee = value; } }, metadata: _metadata }, _processingFee_initializers, _processingFee_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CalculateEmiDto };
//# sourceMappingURL=create-emi-plan.dto.js.map