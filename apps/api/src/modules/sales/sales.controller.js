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
import { Controller, Get, Post, UseGuards, UseInterceptors, HttpStatus, HttpCode, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';
let SalesController = (() => {
    let _classDecorators = [ApiTags('Sales'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), Controller('sales')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _getInvoice_decorators;
    let _getThermalInvoice_decorators;
    let _emailInvoice_decorators;
    let _whatsappInvoice_decorators;
    let _voidSale_decorators;
    let _lockItem_decorators;
    let _unlockItem_decorators;
    var SalesController = _classThis = class {
        constructor(salesService) {
            this.salesService = (__runInitializers(this, _instanceExtraInitializers), salesService);
        }
        // ─── 7.3 Create sale ─────────────────────────────────────────────────────────
        async create(dto, user) {
            return this.salesService.create(dto, user.sub, user.role);
        }
        // ─── 7.6 List sales ──────────────────────────────────────────────────────────
        async findAll(query) {
            return this.salesService.findAll(query);
        }
        // ─── 7.6 Get sale by ID ──────────────────────────────────────────────────────
        async findById(id) {
            return this.salesService.findById(id);
        }
        // ─── 7.7 A4 invoice PDF ──────────────────────────────────────────────────────
        async getInvoice(id, res) {
            const pdfBuffer = await this.salesService.generateInvoicePdf(id);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.status(HttpStatus.OK).end(pdfBuffer);
        }
        // ─── 7.7 Thermal receipt PDF ─────────────────────────────────────────────────
        async getThermalInvoice(id, res) {
            const pdfBuffer = await this.salesService.generateThermalPdf(id);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="receipt-${id}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.status(HttpStatus.OK).end(pdfBuffer);
        }
        // ─── 7.8 Email invoice ───────────────────────────────────────────────────────
        async emailInvoice(id, body) {
            return this.salesService.emailInvoice(id, body.email);
        }
        // ─── 7.8 WhatsApp invoice ────────────────────────────────────────────────────
        async whatsappInvoice(id, body) {
            return this.salesService.whatsappInvoice(id, body.phone);
        }
        // ─── 7.9 Void sale ───────────────────────────────────────────────────────────
        async voidSale(id, user) {
            return this.salesService.voidSale(id, user.sub);
        }
        // ─── 7.10 POS item lock ──────────────────────────────────────────────────────
        async lockItem(body) {
            return this.salesService.lockItem(body.itemId);
        }
        async unlockItem(body) {
            return this.salesService.unlockItem(body.itemId);
        }
    };
    __setFunctionName(_classThis, "SalesController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post(), RequirePermission('sales.create'), ApiOperation({ summary: 'Create a new sale (POS)' })];
        _findAll_decorators = [Get(), RequirePermission('sales.view'), UseInterceptors(BranchFilterInterceptor), ApiOperation({ summary: 'List sales with optional filters' })];
        _findById_decorators = [Get(':id'), RequirePermission('sales.view'), ApiOperation({ summary: 'Get sale by ID' })];
        _getInvoice_decorators = [Get(':id/invoice'), RequirePermission('sales.view'), ApiOperation({ summary: 'Generate A4 GST invoice PDF' })];
        _getThermalInvoice_decorators = [Get(':id/invoice/thermal'), RequirePermission('sales.view'), ApiOperation({ summary: 'Generate thermal 80mm receipt PDF' })];
        _emailInvoice_decorators = [Post(':id/invoice/email'), RequirePermission('sales.view'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Email invoice to client' })];
        _whatsappInvoice_decorators = [Post(':id/invoice/whatsapp'), RequirePermission('sales.view'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Send invoice via WhatsApp' })];
        _voidSale_decorators = [Post(':id/void'), RequirePermission('sales.approve'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Void a sale (requires sales.approve permission)' })];
        _lockItem_decorators = [Post('lock-item'), RequirePermission('sales.create'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Lock an inventory item in POS cart (15-min TTL)' })];
        _unlockItem_decorators = [Post('unlock-item'), RequirePermission('sales.create'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Unlock an inventory item from POS cart' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getInvoice_decorators, { kind: "method", name: "getInvoice", static: false, private: false, access: { has: obj => "getInvoice" in obj, get: obj => obj.getInvoice }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getThermalInvoice_decorators, { kind: "method", name: "getThermalInvoice", static: false, private: false, access: { has: obj => "getThermalInvoice" in obj, get: obj => obj.getThermalInvoice }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _emailInvoice_decorators, { kind: "method", name: "emailInvoice", static: false, private: false, access: { has: obj => "emailInvoice" in obj, get: obj => obj.emailInvoice }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _whatsappInvoice_decorators, { kind: "method", name: "whatsappInvoice", static: false, private: false, access: { has: obj => "whatsappInvoice" in obj, get: obj => obj.whatsappInvoice }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _voidSale_decorators, { kind: "method", name: "voidSale", static: false, private: false, access: { has: obj => "voidSale" in obj, get: obj => obj.voidSale }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _lockItem_decorators, { kind: "method", name: "lockItem", static: false, private: false, access: { has: obj => "lockItem" in obj, get: obj => obj.lockItem }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _unlockItem_decorators, { kind: "method", name: "unlockItem", static: false, private: false, access: { has: obj => "unlockItem" in obj, get: obj => obj.unlockItem }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SalesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SalesController = _classThis;
})();
export { SalesController };
//# sourceMappingURL=sales.controller.js.map