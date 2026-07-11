var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Get, Post, Patch, UseGuards, UseInterceptors, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';
let ExchangeController = (() => {
    let _classDecorators = [ApiTags('Exchanges'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), Controller('exchanges')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _getPriceGuide_decorators;
    let _suggestPrice_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _update_decorators;
    let _addToInventory_decorators;
    var ExchangeController = _classThis = class {
        constructor(exchangeService) {
            this.exchangeService = (__runInitializers(this, _instanceExtraInitializers), exchangeService);
        }
        async create(dto, user) {
            return this.exchangeService.create(dto, user.sub);
        }
        async getPriceGuide(modelId) {
            return this.exchangeService.getPriceGuide(modelId);
        }
        async suggestPrice(basePrice, batteryHealth, monthsSinceFirstInvoice) {
            return this.exchangeService.suggestPrice({
                basePrice: parseFloat(basePrice),
                batteryHealth: parseInt(batteryHealth, 10),
                monthsSinceFirstInvoice: parseInt(monthsSinceFirstInvoice, 10),
            });
        }
        async findAll(query) {
            return this.exchangeService.findAll(query);
        }
        async findById(id) {
            return this.exchangeService.findById(id);
        }
        async update(id, dto) {
            return this.exchangeService.update(id, dto);
        }
        async addToInventory(id, body, user) {
            return this.exchangeService.addToInventory(id, { ...body, createdById: user.sub });
        }
    };
    __setFunctionName(_classThis, "ExchangeController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post(), RequirePermission('exchange.create'), ApiOperation({ summary: 'Create a new exchange entry with condition assessment' })];
        _getPriceGuide_decorators = [Get('price-guide'), RequirePermission('exchange.view'), ApiOperation({ summary: 'Get market price guide per model+condition' })];
        _suggestPrice_decorators = [Get('price-suggestion'), RequirePermission('exchange.view'), ApiOperation({ summary: 'Get exchange price suggestion using formula' })];
        _findAll_decorators = [Get(), RequirePermission('exchange.view'), UseInterceptors(BranchFilterInterceptor), ApiOperation({ summary: 'List exchanges with optional filters' })];
        _findById_decorators = [Get(':id'), RequirePermission('exchange.view'), ApiOperation({ summary: 'Get exchange by ID' })];
        _update_decorators = [Patch(':id'), RequirePermission('exchange.edit'), ApiOperation({ summary: 'Update exchange details' })];
        _addToInventory_decorators = [Post(':id/add-inventory'), RequirePermission('exchange.edit'), ApiOperation({ summary: 'Add exchanged device to inventory' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPriceGuide_decorators, { kind: "method", name: "getPriceGuide", static: false, private: false, access: { has: obj => "getPriceGuide" in obj, get: obj => obj.getPriceGuide }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _suggestPrice_decorators, { kind: "method", name: "suggestPrice", static: false, private: false, access: { has: obj => "suggestPrice" in obj, get: obj => obj.suggestPrice }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addToInventory_decorators, { kind: "method", name: "addToInventory", static: false, private: false, access: { has: obj => "addToInventory" in obj, get: obj => obj.addToInventory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExchangeController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExchangeController = _classThis;
})();
export { ExchangeController };
//# sourceMappingURL=exchange.controller.js.map