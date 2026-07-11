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
import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
let CreateSaleReturnDto = (() => {
    var _a;
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _refundMethod_decorators;
    let _refundMethod_initializers = [];
    let _refundMethod_extraInitializers = [];
    let _refundAmount_decorators;
    let _refundAmount_initializers = [];
    let _refundAmount_extraInitializers = [];
    let _conditionAssessment_decorators;
    let _conditionAssessment_initializers = [];
    let _conditionAssessment_extraInitializers = [];
    let _managerOverride_decorators;
    let _managerOverride_initializers = [];
    let _managerOverride_extraInitializers = [];
    let _approvedById_decorators;
    let _approvedById_initializers = [];
    let _approvedById_extraInitializers = [];
    return _a = class CreateSaleReturnDto {
            constructor() {
                this.reason = __runInitializers(this, _reason_initializers, void 0);
                this.refundMethod = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _refundMethod_initializers, void 0));
                this.refundAmount = (__runInitializers(this, _refundMethod_extraInitializers), __runInitializers(this, _refundAmount_initializers, void 0));
                this.conditionAssessment = (__runInitializers(this, _refundAmount_extraInitializers), __runInitializers(this, _conditionAssessment_initializers, void 0));
                this.managerOverride = (__runInitializers(this, _conditionAssessment_extraInitializers), __runInitializers(this, _managerOverride_initializers, void 0));
                this.approvedById = (__runInitializers(this, _managerOverride_extraInitializers), __runInitializers(this, _approvedById_initializers, void 0));
                __runInitializers(this, _approvedById_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _reason_decorators = [ApiProperty({ description: 'Reason for the return' }), IsString(), IsNotEmpty()];
            _refundMethod_decorators = [ApiPropertyOptional({ enum: ['original_payment', 'store_credit', 'cash'] }), IsOptional(), IsIn(['original_payment', 'store_credit', 'cash'])];
            _refundAmount_decorators = [ApiPropertyOptional({ description: 'Refund amount (defaults to sale total if not provided)' }), IsOptional(), IsNumber()];
            _conditionAssessment_decorators = [ApiPropertyOptional({ description: 'Condition assessment: available or scrapped' }), IsOptional(), IsIn(['available', 'scrapped'])];
            _managerOverride_decorators = [ApiPropertyOptional({ description: 'Manager override for expired return window' }), IsOptional(), IsBoolean()];
            _approvedById_decorators = [ApiPropertyOptional({ description: 'Approver user ID' }), IsOptional(), IsUUID()];
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            __esDecorate(null, null, _refundMethod_decorators, { kind: "field", name: "refundMethod", static: false, private: false, access: { has: obj => "refundMethod" in obj, get: obj => obj.refundMethod, set: (obj, value) => { obj.refundMethod = value; } }, metadata: _metadata }, _refundMethod_initializers, _refundMethod_extraInitializers);
            __esDecorate(null, null, _refundAmount_decorators, { kind: "field", name: "refundAmount", static: false, private: false, access: { has: obj => "refundAmount" in obj, get: obj => obj.refundAmount, set: (obj, value) => { obj.refundAmount = value; } }, metadata: _metadata }, _refundAmount_initializers, _refundAmount_extraInitializers);
            __esDecorate(null, null, _conditionAssessment_decorators, { kind: "field", name: "conditionAssessment", static: false, private: false, access: { has: obj => "conditionAssessment" in obj, get: obj => obj.conditionAssessment, set: (obj, value) => { obj.conditionAssessment = value; } }, metadata: _metadata }, _conditionAssessment_initializers, _conditionAssessment_extraInitializers);
            __esDecorate(null, null, _managerOverride_decorators, { kind: "field", name: "managerOverride", static: false, private: false, access: { has: obj => "managerOverride" in obj, get: obj => obj.managerOverride, set: (obj, value) => { obj.managerOverride = value; } }, metadata: _metadata }, _managerOverride_initializers, _managerOverride_extraInitializers);
            __esDecorate(null, null, _approvedById_decorators, { kind: "field", name: "approvedById", static: false, private: false, access: { has: obj => "approvedById" in obj, get: obj => obj.approvedById, set: (obj, value) => { obj.approvedById = value; } }, metadata: _metadata }, _approvedById_initializers, _approvedById_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreateSaleReturnDto };
let CreatePurchaseReturnDto = (() => {
    var _a;
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _itemIds_decorators;
    let _itemIds_initializers = [];
    let _itemIds_extraInitializers = [];
    let _conditionAssessment_decorators;
    let _conditionAssessment_initializers = [];
    let _conditionAssessment_extraInitializers = [];
    return _a = class CreatePurchaseReturnDto {
            constructor() {
                this.reason = __runInitializers(this, _reason_initializers, void 0);
                this.itemIds = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _itemIds_initializers, void 0));
                this.conditionAssessment = (__runInitializers(this, _itemIds_extraInitializers), __runInitializers(this, _conditionAssessment_initializers, void 0));
                __runInitializers(this, _conditionAssessment_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _reason_decorators = [ApiProperty({ description: 'Reason for the return' }), IsString(), IsNotEmpty()];
            _itemIds_decorators = [ApiPropertyOptional({ description: 'Specific item IDs to return (defaults to all)' }), IsOptional(), IsUUID('4', { each: true })];
            _conditionAssessment_decorators = [ApiPropertyOptional({ description: 'Condition assessment: scrapped or available' }), IsOptional(), IsIn(['available', 'scrapped'])];
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            __esDecorate(null, null, _itemIds_decorators, { kind: "field", name: "itemIds", static: false, private: false, access: { has: obj => "itemIds" in obj, get: obj => obj.itemIds, set: (obj, value) => { obj.itemIds = value; } }, metadata: _metadata }, _itemIds_initializers, _itemIds_extraInitializers);
            __esDecorate(null, null, _conditionAssessment_decorators, { kind: "field", name: "conditionAssessment", static: false, private: false, access: { has: obj => "conditionAssessment" in obj, get: obj => obj.conditionAssessment, set: (obj, value) => { obj.conditionAssessment = value; } }, metadata: _metadata }, _conditionAssessment_initializers, _conditionAssessment_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreatePurchaseReturnDto };
//# sourceMappingURL=create-return.dto.js.map