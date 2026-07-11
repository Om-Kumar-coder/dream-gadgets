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
import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayMinSize, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
let CreatePurchaseDto = (() => {
    var _a;
    let _vendorName_decorators;
    let _vendorName_initializers = [];
    let _vendorName_extraInitializers = [];
    let _vendorId_decorators;
    let _vendorId_initializers = [];
    let _vendorId_extraInitializers = [];
    let _branchId_decorators;
    let _branchId_initializers = [];
    let _branchId_extraInitializers = [];
    let _purchaseDate_decorators;
    let _purchaseDate_initializers = [];
    let _purchaseDate_extraInitializers = [];
    let _itemIds_decorators;
    let _itemIds_initializers = [];
    let _itemIds_extraInitializers = [];
    let _taxAmount_decorators;
    let _taxAmount_initializers = [];
    let _taxAmount_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    return _a = class CreatePurchaseDto {
            constructor() {
                this.vendorName = __runInitializers(this, _vendorName_initializers, void 0);
                this.vendorId = (__runInitializers(this, _vendorName_extraInitializers), __runInitializers(this, _vendorId_initializers, void 0));
                this.branchId = (__runInitializers(this, _vendorId_extraInitializers), __runInitializers(this, _branchId_initializers, void 0));
                this.purchaseDate = (__runInitializers(this, _branchId_extraInitializers), __runInitializers(this, _purchaseDate_initializers, void 0));
                this.itemIds = (__runInitializers(this, _purchaseDate_extraInitializers), __runInitializers(this, _itemIds_initializers, void 0));
                this.taxAmount = (__runInitializers(this, _itemIds_extraInitializers), __runInitializers(this, _taxAmount_initializers, void 0));
                this.notes = (__runInitializers(this, _taxAmount_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                this.status = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                __runInitializers(this, _status_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _vendorName_decorators = [ApiProperty({ description: 'Vendor name (required)' }), IsString(), IsNotEmpty()];
            _vendorId_decorators = [ApiPropertyOptional({ description: 'Vendor client ID (optional FK to clients)' }), IsOptional(), IsUUID()];
            _branchId_decorators = [ApiProperty({ description: 'Branch ID where purchase is recorded' }), IsUUID()];
            _purchaseDate_decorators = [ApiProperty({ description: 'Purchase date (ISO date string)' }), IsDateString()];
            _itemIds_decorators = [ApiProperty({ description: 'Array of inventory item IDs to link to this purchase', type: [String] }), IsArray(), ArrayMinSize(1, { message: 'At least one inventory item must be provided' }), IsUUID('all', { each: true })];
            _taxAmount_decorators = [ApiPropertyOptional({ description: 'Tax amount for the purchase' }), IsOptional(), IsNumber(), Min(0)];
            _notes_decorators = [ApiPropertyOptional({ description: 'Notes or remarks' }), IsOptional(), IsString()];
            _status_decorators = [ApiPropertyOptional({ description: 'Purchase status', default: 'completed' }), IsOptional(), IsString()];
            __esDecorate(null, null, _vendorName_decorators, { kind: "field", name: "vendorName", static: false, private: false, access: { has: obj => "vendorName" in obj, get: obj => obj.vendorName, set: (obj, value) => { obj.vendorName = value; } }, metadata: _metadata }, _vendorName_initializers, _vendorName_extraInitializers);
            __esDecorate(null, null, _vendorId_decorators, { kind: "field", name: "vendorId", static: false, private: false, access: { has: obj => "vendorId" in obj, get: obj => obj.vendorId, set: (obj, value) => { obj.vendorId = value; } }, metadata: _metadata }, _vendorId_initializers, _vendorId_extraInitializers);
            __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: obj => "branchId" in obj, get: obj => obj.branchId, set: (obj, value) => { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
            __esDecorate(null, null, _purchaseDate_decorators, { kind: "field", name: "purchaseDate", static: false, private: false, access: { has: obj => "purchaseDate" in obj, get: obj => obj.purchaseDate, set: (obj, value) => { obj.purchaseDate = value; } }, metadata: _metadata }, _purchaseDate_initializers, _purchaseDate_extraInitializers);
            __esDecorate(null, null, _itemIds_decorators, { kind: "field", name: "itemIds", static: false, private: false, access: { has: obj => "itemIds" in obj, get: obj => obj.itemIds, set: (obj, value) => { obj.itemIds = value; } }, metadata: _metadata }, _itemIds_initializers, _itemIds_extraInitializers);
            __esDecorate(null, null, _taxAmount_decorators, { kind: "field", name: "taxAmount", static: false, private: false, access: { has: obj => "taxAmount" in obj, get: obj => obj.taxAmount, set: (obj, value) => { obj.taxAmount = value; } }, metadata: _metadata }, _taxAmount_initializers, _taxAmount_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreatePurchaseDto };
//# sourceMappingURL=create-purchase.dto.js.map