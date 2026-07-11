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
import { Controller, Get, Post, Patch, UseGuards, UseInterceptors, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';
let TransferController = (() => {
    let _classDecorators = [ApiTags('Transfers'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), Controller('transfers')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _receive_decorators;
    let _reject_decorators;
    let _getManifest_decorators;
    var TransferController = _classThis = class {
        constructor(transferService) {
            this.transferService = (__runInitializers(this, _instanceExtraInitializers), transferService);
        }
        async create(dto, user) {
            return this.transferService.create(dto, user.sub);
        }
        async findAll(query) {
            return this.transferService.findAll(query);
        }
        async findById(id) {
            return this.transferService.findById(id);
        }
        async receive(id, body, user) {
            return this.transferService.receive(id, body.itemIds, user.sub);
        }
        async reject(id, body) {
            return this.transferService.reject(id, body.reason);
        }
        async getManifest(id, res) {
            const pdfBuffer = await this.transferService.generateManifestPdf(id);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="transfer-manifest-${id}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.status(HttpStatus.OK).end(pdfBuffer);
        }
    };
    __setFunctionName(_classThis, "TransferController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post(), RequirePermission('transfers.create'), ApiOperation({ summary: 'Create a new stock transfer' })];
        _findAll_decorators = [Get(), RequirePermission('transfers.view'), UseInterceptors(BranchFilterInterceptor), ApiOperation({ summary: 'List transfers with optional filters' })];
        _findById_decorators = [Get(':id'), RequirePermission('transfers.view'), ApiOperation({ summary: 'Get transfer by ID' })];
        _receive_decorators = [Patch(':id/receive'), RequirePermission('transfers.edit'), ApiOperation({ summary: 'Receive transfer (item-by-item confirmation)' })];
        _reject_decorators = [Patch(':id/reject'), RequirePermission('transfers.edit'), ApiOperation({ summary: 'Reject transfer with reason' })];
        _getManifest_decorators = [Get(':id/manifest'), RequirePermission('transfers.view'), ApiOperation({ summary: 'Generate transfer manifest PDF' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _receive_decorators, { kind: "method", name: "receive", static: false, private: false, access: { has: obj => "receive" in obj, get: obj => obj.receive }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _reject_decorators, { kind: "method", name: "reject", static: false, private: false, access: { has: obj => "reject" in obj, get: obj => obj.reject }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getManifest_decorators, { kind: "method", name: "getManifest", static: false, private: false, access: { has: obj => "getManifest" in obj, get: obj => obj.getManifest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TransferController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TransferController = _classThis;
})();
export { TransferController };
//# sourceMappingURL=transfer.controller.js.map