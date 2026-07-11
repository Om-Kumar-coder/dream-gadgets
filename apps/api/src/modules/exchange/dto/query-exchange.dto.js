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
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
let QueryExchangeDto = (() => {
    var _a;
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _modelId_decorators;
    let _modelId_initializers = [];
    let _modelId_extraInitializers = [];
    let _condition_decorators;
    let _condition_initializers = [];
    let _condition_extraInitializers = [];
    let _search_decorators;
    let _search_initializers = [];
    let _search_extraInitializers = [];
    let _addedToInventory_decorators;
    let _addedToInventory_initializers = [];
    let _addedToInventory_extraInitializers = [];
    let _page_decorators;
    let _page_initializers = [];
    let _page_extraInitializers = [];
    let _limit_decorators;
    let _limit_initializers = [];
    let _limit_extraInitializers = [];
    return _a = class QueryExchangeDto {
            constructor() {
                this.clientId = __runInitializers(this, _clientId_initializers, void 0);
                this.modelId = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _modelId_initializers, void 0));
                this.condition = (__runInitializers(this, _modelId_extraInitializers), __runInitializers(this, _condition_initializers, void 0));
                this.search = (__runInitializers(this, _condition_extraInitializers), __runInitializers(this, _search_initializers, void 0));
                this.addedToInventory = (__runInitializers(this, _search_extraInitializers), __runInitializers(this, _addedToInventory_initializers, void 0));
                this.page = (__runInitializers(this, _addedToInventory_extraInitializers), __runInitializers(this, _page_initializers, 1));
                this.limit = (__runInitializers(this, _page_extraInitializers), __runInitializers(this, _limit_initializers, 20));
                __runInitializers(this, _limit_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _modelId_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _condition_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _search_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _addedToInventory_decorators = [ApiPropertyOptional(), IsOptional(), Transform(({ value }) => value === 'true'), IsBoolean()];
            _page_decorators = [ApiPropertyOptional(), IsOptional(), Type(() => Number)];
            _limit_decorators = [ApiPropertyOptional(), IsOptional(), Type(() => Number)];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _modelId_decorators, { kind: "field", name: "modelId", static: false, private: false, access: { has: obj => "modelId" in obj, get: obj => obj.modelId, set: (obj, value) => { obj.modelId = value; } }, metadata: _metadata }, _modelId_initializers, _modelId_extraInitializers);
            __esDecorate(null, null, _condition_decorators, { kind: "field", name: "condition", static: false, private: false, access: { has: obj => "condition" in obj, get: obj => obj.condition, set: (obj, value) => { obj.condition = value; } }, metadata: _metadata }, _condition_initializers, _condition_extraInitializers);
            __esDecorate(null, null, _search_decorators, { kind: "field", name: "search", static: false, private: false, access: { has: obj => "search" in obj, get: obj => obj.search, set: (obj, value) => { obj.search = value; } }, metadata: _metadata }, _search_initializers, _search_extraInitializers);
            __esDecorate(null, null, _addedToInventory_decorators, { kind: "field", name: "addedToInventory", static: false, private: false, access: { has: obj => "addedToInventory" in obj, get: obj => obj.addedToInventory, set: (obj, value) => { obj.addedToInventory = value; } }, metadata: _metadata }, _addedToInventory_initializers, _addedToInventory_extraInitializers);
            __esDecorate(null, null, _page_decorators, { kind: "field", name: "page", static: false, private: false, access: { has: obj => "page" in obj, get: obj => obj.page, set: (obj, value) => { obj.page = value; } }, metadata: _metadata }, _page_initializers, _page_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: obj => "limit" in obj, get: obj => obj.limit, set: (obj, value) => { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { QueryExchangeDto };
//# sourceMappingURL=query-exchange.dto.js.map