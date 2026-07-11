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
import { Controller, Get, Post, Patch, Delete, UseGuards, UseInterceptors, HttpCode, HttpStatus, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';
let InventoryController = (() => {
    let _classDecorators = [ApiTags('Inventory'), ApiBearerAuth(), UseGuards(AuthGuard('jwt'), PermissionGuard), Controller('inventory')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getPriceSuggestion_decorators;
    let _getCityStock_decorators;
    let _getBrands_decorators;
    let _getModels_decorators;
    let _bulkImport_decorators;
    let _findByImei_decorators;
    let _findAll_decorators;
    let _create_decorators;
    let _findById_decorators;
    let _update_decorators;
    let _addPhoto_decorators;
    let _deletePhoto_decorators;
    let _toggleOnline_decorators;
    var InventoryController = _classThis = class {
        constructor(inventoryService) {
            this.inventoryService = (__runInitializers(this, _instanceExtraInitializers), inventoryService);
        }
        // ─── Static routes first (before :id) ───────────────────────────────────────
        async getPriceSuggestion(modelId, condition) {
            return this.inventoryService.getPriceSuggestion(modelId, condition);
        }
        async getCityStock(modelId) {
            return this.inventoryService.getCityStock(modelId);
        }
        async getBrands() {
            return this.inventoryService.getBrands();
        }
        async getModels(brandId) {
            return this.inventoryService.getModels(brandId);
        }
        async bulkImport(file, user) {
            return this.inventoryService.bulkImport(file.buffer, user.sub);
        }
        // ─── IMEI lookup ────────────────────────────────────────────────────────────
        async findByImei(imei) {
            return this.inventoryService.findByImei(imei);
        }
        // ─── CRUD ───────────────────────────────────────────────────────────────────
        async findAll(query) {
            return this.inventoryService.findAll(query);
        }
        async create(dto, user) {
            return this.inventoryService.create(dto, user.sub);
        }
        async findById(id) {
            return this.inventoryService.findById(id);
        }
        async update(id, dto, user) {
            return this.inventoryService.update(id, dto, user.sub);
        }
        // ─── Photos ─────────────────────────────────────────────────────────────────
        async addPhoto(id, body) {
            if (body.s3Key) {
                // Client already uploaded — just register the photo
                return this.inventoryService.addPhoto(id, body.s3Key, body.sortOrder ?? 0);
            }
            // Return presigned URL for client to upload
            return this.inventoryService.getPresignedUploadUrl(id, body.filename);
        }
        async deletePhoto(id, photoId) {
            await this.inventoryService.deletePhoto(id, photoId);
        }
        // ─── Toggle online ──────────────────────────────────────────────────────────
        async toggleOnline(id, user) {
            return this.inventoryService.toggleOnline(id, user.sub);
        }
    };
    __setFunctionName(_classThis, "InventoryController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getPriceSuggestion_decorators = [Get('price-suggestion'), RequirePermission('inventory.view'), ApiOperation({ summary: 'Get median historical sale price for model+condition' })];
        _getCityStock_decorators = [Get('city-stock'), RequirePermission('inventory.view'), ApiOperation({ summary: 'Get branch availability counts for a model' })];
        _getBrands_decorators = [Get('brands'), RequirePermission('inventory.view'), ApiOperation({ summary: 'List all brands' })];
        _getModels_decorators = [Get('models'), RequirePermission('inventory.view'), ApiOperation({ summary: 'List models, optionally filtered by brandId' })];
        _bulkImport_decorators = [Post('bulk-import'), RequirePermission('inventory.create'), ApiOperation({ summary: 'Bulk import inventory items from CSV' }), ApiConsumes('multipart/form-data'), UseInterceptors(FileInterceptor('file'))];
        _findByImei_decorators = [Get('imei/:imei'), RequirePermission('inventory.view'), ApiOperation({ summary: 'Find inventory item by IMEI' })];
        _findAll_decorators = [Get(), RequirePermission('inventory.view'), UseInterceptors(BranchFilterInterceptor), ApiOperation({ summary: 'List inventory items (paginated, filtered)' })];
        _create_decorators = [Post(), RequirePermission('inventory.create'), ApiOperation({ summary: 'Create a new inventory item (purchase entry)' })];
        _findById_decorators = [Get(':id'), RequirePermission('inventory.view'), ApiOperation({ summary: 'Get inventory item by ID' })];
        _update_decorators = [Patch(':id'), RequirePermission('inventory.edit'), ApiOperation({ summary: 'Update inventory item' })];
        _addPhoto_decorators = [Post(':id/photos'), RequirePermission('inventory.edit'), ApiOperation({ summary: 'Get presigned S3 URL and register photo' })];
        _deletePhoto_decorators = [Delete(':id/photos/:photoId'), RequirePermission('inventory.edit'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Delete a photo from an inventory item' })];
        _toggleOnline_decorators = [Patch(':id/toggle-online'), RequirePermission('inventory.edit'), ApiOperation({ summary: 'Toggle isOnline flag and enqueue search index sync' })];
        __esDecorate(_classThis, null, _getPriceSuggestion_decorators, { kind: "method", name: "getPriceSuggestion", static: false, private: false, access: { has: obj => "getPriceSuggestion" in obj, get: obj => obj.getPriceSuggestion }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCityStock_decorators, { kind: "method", name: "getCityStock", static: false, private: false, access: { has: obj => "getCityStock" in obj, get: obj => obj.getCityStock }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBrands_decorators, { kind: "method", name: "getBrands", static: false, private: false, access: { has: obj => "getBrands" in obj, get: obj => obj.getBrands }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getModels_decorators, { kind: "method", name: "getModels", static: false, private: false, access: { has: obj => "getModels" in obj, get: obj => obj.getModels }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _bulkImport_decorators, { kind: "method", name: "bulkImport", static: false, private: false, access: { has: obj => "bulkImport" in obj, get: obj => obj.bulkImport }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByImei_decorators, { kind: "method", name: "findByImei", static: false, private: false, access: { has: obj => "findByImei" in obj, get: obj => obj.findByImei }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addPhoto_decorators, { kind: "method", name: "addPhoto", static: false, private: false, access: { has: obj => "addPhoto" in obj, get: obj => obj.addPhoto }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deletePhoto_decorators, { kind: "method", name: "deletePhoto", static: false, private: false, access: { has: obj => "deletePhoto" in obj, get: obj => obj.deletePhoto }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleOnline_decorators, { kind: "method", name: "toggleOnline", static: false, private: false, access: { has: obj => "toggleOnline" in obj, get: obj => obj.toggleOnline }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InventoryController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InventoryController = _classThis;
})();
export { InventoryController };
//# sourceMappingURL=inventory.controller.js.map