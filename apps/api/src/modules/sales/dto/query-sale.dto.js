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
import { IsOptional, IsUUID, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
let QuerySaleDto = (() => {
    var _a;
    let _page_decorators;
    let _page_initializers = [];
    let _page_extraInitializers = [];
    let _limit_decorators;
    let _limit_initializers = [];
    let _limit_extraInitializers = [];
    let _branchId_decorators;
    let _branchId_initializers = [];
    let _branchId_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _paymentStatus_decorators;
    let _paymentStatus_initializers = [];
    let _paymentStatus_extraInitializers = [];
    let _saleType_decorators;
    let _saleType_initializers = [];
    let _saleType_extraInitializers = [];
    let _fromDate_decorators;
    let _fromDate_initializers = [];
    let _fromDate_extraInitializers = [];
    let _toDate_decorators;
    let _toDate_initializers = [];
    let _toDate_extraInitializers = [];
    let _search_decorators;
    let _search_initializers = [];
    let _search_extraInitializers = [];
    let _isVoided_decorators;
    let _isVoided_initializers = [];
    let _isVoided_extraInitializers = [];
    return _a = class QuerySaleDto {
            constructor() {
                this.page = __runInitializers(this, _page_initializers, 1);
                this.limit = (__runInitializers(this, _page_extraInitializers), __runInitializers(this, _limit_initializers, 20));
                this.branchId = (__runInitializers(this, _limit_extraInitializers), __runInitializers(this, _branchId_initializers, void 0));
                this.clientId = (__runInitializers(this, _branchId_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
                this.paymentStatus = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _paymentStatus_initializers, void 0));
                this.saleType = (__runInitializers(this, _paymentStatus_extraInitializers), __runInitializers(this, _saleType_initializers, void 0));
                this.fromDate = (__runInitializers(this, _saleType_extraInitializers), __runInitializers(this, _fromDate_initializers, void 0));
                this.toDate = (__runInitializers(this, _fromDate_extraInitializers), __runInitializers(this, _toDate_initializers, void 0));
                this.search = (__runInitializers(this, _toDate_extraInitializers), __runInitializers(this, _search_initializers, void 0));
                this.isVoided = (__runInitializers(this, _search_extraInitializers), __runInitializers(this, _isVoided_initializers, void 0));
                __runInitializers(this, _isVoided_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _page_decorators = [ApiPropertyOptional({ default: 1 }), IsOptional(), Type(() => Number), IsInt(), Min(1)];
            _limit_decorators = [ApiPropertyOptional({ default: 20 }), IsOptional(), Type(() => Number), IsInt(), Min(1)];
            _branchId_decorators = [ApiPropertyOptional(), IsOptional(), IsUUID()];
            _clientId_decorators = [ApiPropertyOptional(), IsOptional(), IsUUID()];
            _paymentStatus_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _saleType_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _fromDate_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _toDate_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _search_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _isVoided_decorators = [ApiPropertyOptional(), IsOptional(), Transform(({ value }) => value === 'true' || value === true), IsBoolean()];
            __esDecorate(null, null, _page_decorators, { kind: "field", name: "page", static: false, private: false, access: { has: obj => "page" in obj, get: obj => obj.page, set: (obj, value) => { obj.page = value; } }, metadata: _metadata }, _page_initializers, _page_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: obj => "limit" in obj, get: obj => obj.limit, set: (obj, value) => { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: obj => "branchId" in obj, get: obj => obj.branchId, set: (obj, value) => { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _paymentStatus_decorators, { kind: "field", name: "paymentStatus", static: false, private: false, access: { has: obj => "paymentStatus" in obj, get: obj => obj.paymentStatus, set: (obj, value) => { obj.paymentStatus = value; } }, metadata: _metadata }, _paymentStatus_initializers, _paymentStatus_extraInitializers);
            __esDecorate(null, null, _saleType_decorators, { kind: "field", name: "saleType", static: false, private: false, access: { has: obj => "saleType" in obj, get: obj => obj.saleType, set: (obj, value) => { obj.saleType = value; } }, metadata: _metadata }, _saleType_initializers, _saleType_extraInitializers);
            __esDecorate(null, null, _fromDate_decorators, { kind: "field", name: "fromDate", static: false, private: false, access: { has: obj => "fromDate" in obj, get: obj => obj.fromDate, set: (obj, value) => { obj.fromDate = value; } }, metadata: _metadata }, _fromDate_initializers, _fromDate_extraInitializers);
            __esDecorate(null, null, _toDate_decorators, { kind: "field", name: "toDate", static: false, private: false, access: { has: obj => "toDate" in obj, get: obj => obj.toDate, set: (obj, value) => { obj.toDate = value; } }, metadata: _metadata }, _toDate_initializers, _toDate_extraInitializers);
            __esDecorate(null, null, _search_decorators, { kind: "field", name: "search", static: false, private: false, access: { has: obj => "search" in obj, get: obj => obj.search, set: (obj, value) => { obj.search = value; } }, metadata: _metadata }, _search_initializers, _search_extraInitializers);
            __esDecorate(null, null, _isVoided_decorators, { kind: "field", name: "isVoided", static: false, private: false, access: { has: obj => "isVoided" in obj, get: obj => obj.isVoided, set: (obj, value) => { obj.isVoided = value; } }, metadata: _metadata }, _isVoided_initializers, _isVoided_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { QuerySaleDto };
//# sourceMappingURL=query-sale.dto.js.map