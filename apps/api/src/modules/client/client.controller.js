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
let ClientController = (() => {
    let _classDecorators = [ApiTags('Clients'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), Controller('clients')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _update_decorators;
    let _getHistory_decorators;
    let _uploadEkyc_decorators;
    let _verifyEkyc_decorators;
    let _sendEmail_decorators;
    let _sendWhatsapp_decorators;
    var ClientController = _classThis = class {
        constructor(clientService) {
            this.clientService = (__runInitializers(this, _instanceExtraInitializers), clientService);
        }
        async create(dto, user) {
            return this.clientService.create(dto, user.sub);
        }
        async findAll(query) {
            return this.clientService.findAll(query);
        }
        async findById(id) {
            return this.clientService.findById(id);
        }
        async update(id, dto) {
            return this.clientService.update(id, dto);
        }
        async getHistory(id) {
            return this.clientService.getHistory(id);
        }
        async uploadEkyc(id, body) {
            return this.clientService.uploadEkycDocuments(id, body.documents);
        }
        async verifyEkyc(id, user) {
            return this.clientService.verifyEkyc(id, user.sub);
        }
        async sendEmail(id, body) {
            return this.clientService.sendEmail(id, body);
        }
        async sendWhatsapp(id, body) {
            return this.clientService.sendWhatsapp(id, body);
        }
    };
    __setFunctionName(_classThis, "ClientController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post(), RequirePermission('clients.create'), ApiOperation({ summary: 'Create a new client' })];
        _findAll_decorators = [Get(), RequirePermission('clients.view'), UseInterceptors(BranchFilterInterceptor), ApiOperation({ summary: 'List clients with optional search/filters' })];
        _findById_decorators = [Get(':id'), RequirePermission('clients.view'), ApiOperation({ summary: 'Get client by ID' })];
        _update_decorators = [Patch(':id'), RequirePermission('clients.edit'), ApiOperation({ summary: 'Update client details' })];
        _getHistory_decorators = [Get(':id/history'), RequirePermission('clients.view'), ApiOperation({ summary: 'Get client transaction history (purchases, sales, exchanges, returns)' })];
        _uploadEkyc_decorators = [Post(':id/ekyc'), RequirePermission('clients.edit'), ApiOperation({ summary: 'Upload EKYC documents for a client' })];
        _verifyEkyc_decorators = [Patch(':id/ekyc/verify'), RequirePermission('clients.edit'), ApiOperation({ summary: 'Verify client EKYC' })];
        _sendEmail_decorators = [Post(':id/send-email'), RequirePermission('clients.view'), ApiOperation({ summary: 'Send email to client' })];
        _sendWhatsapp_decorators = [Post(':id/send-whatsapp'), RequirePermission('clients.view'), ApiOperation({ summary: 'Send WhatsApp message to client' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getHistory_decorators, { kind: "method", name: "getHistory", static: false, private: false, access: { has: obj => "getHistory" in obj, get: obj => obj.getHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadEkyc_decorators, { kind: "method", name: "uploadEkyc", static: false, private: false, access: { has: obj => "uploadEkyc" in obj, get: obj => obj.uploadEkyc }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verifyEkyc_decorators, { kind: "method", name: "verifyEkyc", static: false, private: false, access: { has: obj => "verifyEkyc" in obj, get: obj => obj.verifyEkyc }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendEmail_decorators, { kind: "method", name: "sendEmail", static: false, private: false, access: { has: obj => "sendEmail" in obj, get: obj => obj.sendEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendWhatsapp_decorators, { kind: "method", name: "sendWhatsapp", static: false, private: false, access: { has: obj => "sendWhatsapp" in obj, get: obj => obj.sendWhatsapp }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ClientController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ClientController = _classThis;
})();
export { ClientController };
//# sourceMappingURL=client.controller.js.map