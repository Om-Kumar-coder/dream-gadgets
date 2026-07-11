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
import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsEnum, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ACCESSORY_CATEGORIES } from './create-accessory.dto';
let UpdateAccessoryDto = (() => {
    var _a;
    let _sku_decorators;
    let _sku_initializers = [];
    let _sku_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _brandId_decorators;
    let _brandId_initializers = [];
    let _brandId_extraInitializers = [];
    let _modelId_decorators;
    let _modelId_initializers = [];
    let _modelId_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _purchasePrice_decorators;
    let _purchasePrice_initializers = [];
    let _purchasePrice_extraInitializers = [];
    let _sellingPrice_decorators;
    let _sellingPrice_initializers = [];
    let _sellingPrice_extraInitializers = [];
    let _wholesalePrice_decorators;
    let _wholesalePrice_initializers = [];
    let _wholesalePrice_extraInitializers = [];
    let _stockQuantity_decorators;
    let _stockQuantity_initializers = [];
    let _stockQuantity_extraInitializers = [];
    let _reorderLevel_decorators;
    let _reorderLevel_initializers = [];
    let _reorderLevel_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _isOnline_decorators;
    let _isOnline_initializers = [];
    let _isOnline_extraInitializers = [];
    let _hsnCode_decorators;
    let _hsnCode_initializers = [];
    let _hsnCode_extraInitializers = [];
    let _taxRate_decorators;
    let _taxRate_initializers = [];
    let _taxRate_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _branchId_decorators;
    let _branchId_initializers = [];
    let _branchId_extraInitializers = [];
    let _specs_decorators;
    let _specs_initializers = [];
    let _specs_extraInitializers = [];
    let _photos_decorators;
    let _photos_initializers = [];
    let _photos_extraInitializers = [];
    return _a = class UpdateAccessoryDto {
            constructor() {
                this.sku = __runInitializers(this, _sku_initializers, void 0);
                this.name = (__runInitializers(this, _sku_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.brandId = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _brandId_initializers, void 0));
                this.modelId = (__runInitializers(this, _brandId_extraInitializers), __runInitializers(this, _modelId_initializers, void 0));
                this.category = (__runInitializers(this, _modelId_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.purchasePrice = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _purchasePrice_initializers, void 0));
                this.sellingPrice = (__runInitializers(this, _purchasePrice_extraInitializers), __runInitializers(this, _sellingPrice_initializers, void 0));
                this.wholesalePrice = (__runInitializers(this, _sellingPrice_extraInitializers), __runInitializers(this, _wholesalePrice_initializers, void 0));
                this.stockQuantity = (__runInitializers(this, _wholesalePrice_extraInitializers), __runInitializers(this, _stockQuantity_initializers, void 0));
                this.reorderLevel = (__runInitializers(this, _stockQuantity_extraInitializers), __runInitializers(this, _reorderLevel_initializers, void 0));
                this.status = (__runInitializers(this, _reorderLevel_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.isOnline = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _isOnline_initializers, void 0));
                this.hsnCode = (__runInitializers(this, _isOnline_extraInitializers), __runInitializers(this, _hsnCode_initializers, void 0));
                this.taxRate = (__runInitializers(this, _hsnCode_extraInitializers), __runInitializers(this, _taxRate_initializers, void 0));
                this.notes = (__runInitializers(this, _taxRate_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                this.branchId = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _branchId_initializers, void 0));
                this.specs = (__runInitializers(this, _branchId_extraInitializers), __runInitializers(this, _specs_initializers, void 0));
                this.photos = (__runInitializers(this, _specs_extraInitializers), __runInitializers(this, _photos_initializers, void 0));
                __runInitializers(this, _photos_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _sku_decorators = [ApiPropertyOptional({ description: 'SKU (must be unique)' }), IsOptional(), IsString()];
            _name_decorators = [ApiPropertyOptional({ description: 'Name of the accessory' }), IsOptional(), IsString()];
            _description_decorators = [ApiPropertyOptional({ description: 'Description of the accessory' }), IsOptional(), IsString()];
            _brandId_decorators = [ApiPropertyOptional({ description: 'Brand ID' }), IsOptional(), IsString()];
            _modelId_decorators = [ApiPropertyOptional({ description: 'Model ID' }), IsOptional(), IsString()];
            _category_decorators = [ApiPropertyOptional({ description: 'Category of accessory' }), IsOptional(), IsString(), IsEnum(ACCESSORY_CATEGORIES)];
            _purchasePrice_decorators = [ApiPropertyOptional({ description: 'Purchase price' }), IsOptional(), IsNumber(), Min(0)];
            _sellingPrice_decorators = [ApiPropertyOptional({ description: 'Selling price' }), IsOptional(), IsNumber(), Min(0)];
            _wholesalePrice_decorators = [ApiPropertyOptional({ description: 'Wholesale price' }), IsOptional(), IsNumber(), Min(0)];
            _stockQuantity_decorators = [ApiPropertyOptional({ description: 'Stock quantity adjustment' }), IsOptional(), IsNumber()];
            _reorderLevel_decorators = [ApiPropertyOptional({ description: 'Reorder level' }), IsOptional(), IsNumber(), Min(1)];
            _status_decorators = [ApiPropertyOptional({ description: 'Status' }), IsOptional(), IsString()];
            _isOnline_decorators = [ApiPropertyOptional({ description: 'Is online' }), IsOptional(), IsBoolean()];
            _hsnCode_decorators = [ApiPropertyOptional({ description: 'HSN code' }), IsOptional(), IsString()];
            _taxRate_decorators = [ApiPropertyOptional({ description: 'Tax rate' }), IsOptional(), IsNumber(), Min(0), Max(100)];
            _notes_decorators = [ApiPropertyOptional({ description: 'Notes' }), IsOptional(), IsString()];
            _branchId_decorators = [ApiPropertyOptional({ description: 'Branch ID' }), IsOptional(), IsString()];
            _specs_decorators = [ApiPropertyOptional({ description: 'Specs' }), IsOptional()];
            _photos_decorators = [ApiPropertyOptional({ description: 'Photos' }), IsOptional()];
            __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: obj => "sku" in obj, get: obj => obj.sku, set: (obj, value) => { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _brandId_decorators, { kind: "field", name: "brandId", static: false, private: false, access: { has: obj => "brandId" in obj, get: obj => obj.brandId, set: (obj, value) => { obj.brandId = value; } }, metadata: _metadata }, _brandId_initializers, _brandId_extraInitializers);
            __esDecorate(null, null, _modelId_decorators, { kind: "field", name: "modelId", static: false, private: false, access: { has: obj => "modelId" in obj, get: obj => obj.modelId, set: (obj, value) => { obj.modelId = value; } }, metadata: _metadata }, _modelId_initializers, _modelId_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _purchasePrice_decorators, { kind: "field", name: "purchasePrice", static: false, private: false, access: { has: obj => "purchasePrice" in obj, get: obj => obj.purchasePrice, set: (obj, value) => { obj.purchasePrice = value; } }, metadata: _metadata }, _purchasePrice_initializers, _purchasePrice_extraInitializers);
            __esDecorate(null, null, _sellingPrice_decorators, { kind: "field", name: "sellingPrice", static: false, private: false, access: { has: obj => "sellingPrice" in obj, get: obj => obj.sellingPrice, set: (obj, value) => { obj.sellingPrice = value; } }, metadata: _metadata }, _sellingPrice_initializers, _sellingPrice_extraInitializers);
            __esDecorate(null, null, _wholesalePrice_decorators, { kind: "field", name: "wholesalePrice", static: false, private: false, access: { has: obj => "wholesalePrice" in obj, get: obj => obj.wholesalePrice, set: (obj, value) => { obj.wholesalePrice = value; } }, metadata: _metadata }, _wholesalePrice_initializers, _wholesalePrice_extraInitializers);
            __esDecorate(null, null, _stockQuantity_decorators, { kind: "field", name: "stockQuantity", static: false, private: false, access: { has: obj => "stockQuantity" in obj, get: obj => obj.stockQuantity, set: (obj, value) => { obj.stockQuantity = value; } }, metadata: _metadata }, _stockQuantity_initializers, _stockQuantity_extraInitializers);
            __esDecorate(null, null, _reorderLevel_decorators, { kind: "field", name: "reorderLevel", static: false, private: false, access: { has: obj => "reorderLevel" in obj, get: obj => obj.reorderLevel, set: (obj, value) => { obj.reorderLevel = value; } }, metadata: _metadata }, _reorderLevel_initializers, _reorderLevel_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _isOnline_decorators, { kind: "field", name: "isOnline", static: false, private: false, access: { has: obj => "isOnline" in obj, get: obj => obj.isOnline, set: (obj, value) => { obj.isOnline = value; } }, metadata: _metadata }, _isOnline_initializers, _isOnline_extraInitializers);
            __esDecorate(null, null, _hsnCode_decorators, { kind: "field", name: "hsnCode", static: false, private: false, access: { has: obj => "hsnCode" in obj, get: obj => obj.hsnCode, set: (obj, value) => { obj.hsnCode = value; } }, metadata: _metadata }, _hsnCode_initializers, _hsnCode_extraInitializers);
            __esDecorate(null, null, _taxRate_decorators, { kind: "field", name: "taxRate", static: false, private: false, access: { has: obj => "taxRate" in obj, get: obj => obj.taxRate, set: (obj, value) => { obj.taxRate = value; } }, metadata: _metadata }, _taxRate_initializers, _taxRate_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: obj => "branchId" in obj, get: obj => obj.branchId, set: (obj, value) => { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
            __esDecorate(null, null, _specs_decorators, { kind: "field", name: "specs", static: false, private: false, access: { has: obj => "specs" in obj, get: obj => obj.specs, set: (obj, value) => { obj.specs = value; } }, metadata: _metadata }, _specs_initializers, _specs_extraInitializers);
            __esDecorate(null, null, _photos_decorators, { kind: "field", name: "photos", static: false, private: false, access: { has: obj => "photos" in obj, get: obj => obj.photos, set: (obj, value) => { obj.photos = value; } }, metadata: _metadata }, _photos_initializers, _photos_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { UpdateAccessoryDto };
//# sourceMappingURL=update-accessory.dto.js.map