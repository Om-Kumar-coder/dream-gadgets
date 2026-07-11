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
import { Controller, Get, Post, Patch, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
let AccessoryController = (() => {
    let _classDecorators = [ApiTags('Accessories'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), Controller()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _findBySku_decorators;
    let _update_decorators;
    let _adjustStock_decorators;
    let _toggleOnline_decorators;
    let _getLowStockAlerts_decorators;
    var AccessoryController = _classThis = class {
        constructor(accessoryService) {
            this.accessoryService = (__runInitializers(this, _instanceExtraInitializers), accessoryService);
        }
        // ─── POST /accessories ───────────────────────────────────────────────────────
        async create(dto, user) {
            return this.accessoryService.create(dto, user.sub);
        }
        // ─── GET /accessories ────────────────────────────────────────────────────────
        async findAll(query) {
            return this.accessoryService.findAll(query);
        }
        // ─── GET /accessories/:id ────────────────────────────────────────────────────
        async findById(id) {
            return this.accessoryService.findById(id);
        }
        // ─── GET /accessories/sku/:sku ───────────────────────────────────────────────
        async findBySku(sku) {
            return this.accessoryService.findBySku(sku);
        }
        // ─── PATCH /accessories/:id ──────────────────────────────────────────────────
        async update(id, dto) {
            return this.accessoryService.update(id, dto);
        }
        // ─── PATCH /accessories/:id/stock ────────────────────────────────────────────
        async adjustStock(id, dto) {
            return this.accessoryService.adjustStock(id, dto.quantity, dto.reason);
        }
        // ─── PATCH /accessories/:id/toggle-online ────────────────────────────────────
        async toggleOnline(id) {
            return this.accessoryService.toggleOnline(id);
        }
        // ─── GET /accessories/low-stock ──────────────────────────────────────────────
        async getLowStockAlerts() {
            return this.accessoryService.getLowStockAlerts();
        }
    };
    __setFunctionName(_classThis, "AccessoryController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post('accessories'), RequirePermission('inventory.create'), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Create a new accessory' })];
        _findAll_decorators = [Get('accessories'), RequirePermission('inventory.view'), ApiOperation({ summary: 'List accessories with filters' })];
        _findById_decorators = [Get('accessories/:id'), RequirePermission('inventory.view'), ApiOperation({ summary: 'Get accessory by ID' })];
        _findBySku_decorators = [Get('accessories/sku/:sku'), RequirePermission('inventory.view'), ApiOperation({ summary: 'Get accessory by SKU' })];
        _update_decorators = [Patch('accessories/:id'), RequirePermission('inventory.edit'), ApiOperation({ summary: 'Update accessory' })];
        _adjustStock_decorators = [Patch('accessories/:id/stock'), RequirePermission('inventory.edit'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Adjust accessory stock' })];
        _toggleOnline_decorators = [Patch('accessories/:id/toggle-online'), RequirePermission('inventory.edit'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Toggle accessory online status' })];
        _getLowStockAlerts_decorators = [Get('accessories/low-stock'), RequirePermission('inventory.view'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Get low stock alerts' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findBySku_decorators, { kind: "method", name: "findBySku", static: false, private: false, access: { has: obj => "findBySku" in obj, get: obj => obj.findBySku }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _adjustStock_decorators, { kind: "method", name: "adjustStock", static: false, private: false, access: { has: obj => "adjustStock" in obj, get: obj => obj.adjustStock }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleOnline_decorators, { kind: "method", name: "toggleOnline", static: false, private: false, access: { has: obj => "toggleOnline" in obj, get: obj => obj.toggleOnline }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getLowStockAlerts_decorators, { kind: "method", name: "getLowStockAlerts", static: false, private: false, access: { has: obj => "getLowStockAlerts" in obj, get: obj => obj.getLowStockAlerts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AccessoryController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AccessoryController = _classThis;
})();
export { AccessoryController };
//# sourceMappingURL=accessory.controller.js.map