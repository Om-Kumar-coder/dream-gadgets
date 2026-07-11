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
import { Controller, Get, Post, UseGuards, HttpStatus, HttpCode, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
let ReturnController = (() => {
    let _classDecorators = [ApiTags('Returns'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), Controller()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createSaleReturn_decorators;
    let _createPurchaseReturn_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _getReturnPdf_decorators;
    var ReturnController = _classThis = class {
        constructor(returnService) {
            this.returnService = (__runInitializers(this, _instanceExtraInitializers), returnService);
        }
        // ─── 11.2 POST /sales/:id/return ─────────────────────────────────────────────
        async createSaleReturn(saleId, dto, user) {
            return this.returnService.createSaleReturn(saleId, dto, user.sub, user.role);
        }
        // ─── 12.1 POST /purchases/:id/return ─────────────────────────────────────────
        async createPurchaseReturn(purchaseId, dto, user) {
            return this.returnService.createPurchaseReturn(purchaseId, dto, user.sub);
        }
        // ─── List returns ─────────────────────────────────────────────────────────────
        async findAll(page, limit, returnType, originalId) {
            return this.returnService.findAll({ page, limit, returnType, originalId });
        }
        // ─── Get return by ID ─────────────────────────────────────────────────────────
        async findById(id) {
            return this.returnService.findById(id);
        }
        // ─── 11.6 / 12.2 Generate return PDF ─────────────────────────────────────────
        async getReturnPdf(id, res) {
            const pdfBuffer = await this.returnService.generateReturnPdf(id);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="return-${id}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.status(HttpStatus.OK).end(pdfBuffer);
        }
    };
    __setFunctionName(_classThis, "ReturnController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createSaleReturn_decorators = [Post('sales/:id/return'), RequirePermission('sales.approve'), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Create a sales return (credit note)' })];
        _createPurchaseReturn_decorators = [Post('purchases/:id/return'), RequirePermission('purchases.edit'), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Create a purchase return' })];
        _findAll_decorators = [Get('returns'), RequirePermission('sales.view'), ApiOperation({ summary: 'List all returns' })];
        _findById_decorators = [Get('returns/:id'), RequirePermission('sales.view'), ApiOperation({ summary: 'Get return by ID' })];
        _getReturnPdf_decorators = [Get('returns/:id/pdf'), RequirePermission('sales.view'), ApiOperation({ summary: 'Generate return credit note / return note PDF' })];
        __esDecorate(_classThis, null, _createSaleReturn_decorators, { kind: "method", name: "createSaleReturn", static: false, private: false, access: { has: obj => "createSaleReturn" in obj, get: obj => obj.createSaleReturn }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPurchaseReturn_decorators, { kind: "method", name: "createPurchaseReturn", static: false, private: false, access: { has: obj => "createPurchaseReturn" in obj, get: obj => obj.createPurchaseReturn }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getReturnPdf_decorators, { kind: "method", name: "getReturnPdf", static: false, private: false, access: { has: obj => "getReturnPdf" in obj, get: obj => obj.getReturnPdf }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReturnController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReturnController = _classThis;
})();
export { ReturnController };
//# sourceMappingURL=return.controller.js.map