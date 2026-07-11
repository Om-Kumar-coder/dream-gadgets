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
import { Type } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsIn, Min, ArrayMinSize, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
let SaleItemDto = (() => {
    var _a;
    let _itemId_decorators;
    let _itemId_initializers = [];
    let _itemId_extraInitializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    let _unitPrice_extraInitializers = [];
    let _discount_decorators;
    let _discount_initializers = [];
    let _discount_extraInitializers = [];
    let _taxRate_decorators;
    let _taxRate_initializers = [];
    let _taxRate_extraInitializers = [];
    let _hsnCode_decorators;
    let _hsnCode_initializers = [];
    let _hsnCode_extraInitializers = [];
    return _a = class SaleItemDto {
            constructor() {
                this.itemId = __runInitializers(this, _itemId_initializers, void 0);
                this.unitPrice = (__runInitializers(this, _itemId_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
                this.discount = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _discount_initializers, void 0));
                this.taxRate = (__runInitializers(this, _discount_extraInitializers), __runInitializers(this, _taxRate_initializers, void 0));
                this.hsnCode = (__runInitializers(this, _taxRate_extraInitializers), __runInitializers(this, _hsnCode_initializers, void 0));
                __runInitializers(this, _hsnCode_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _itemId_decorators = [ApiProperty({ description: 'Inventory item UUID' }), IsUUID()];
            _unitPrice_decorators = [ApiProperty({ description: 'Unit selling price' }), IsNumber(), Min(0)];
            _discount_decorators = [ApiPropertyOptional({ description: 'Item-level discount amount', default: 0 }), IsOptional(), IsNumber(), Min(0)];
            _taxRate_decorators = [ApiPropertyOptional({ description: 'Tax rate percentage', default: 0 }), IsOptional(), IsNumber(), Min(0)];
            _hsnCode_decorators = [ApiPropertyOptional({ description: 'HSN code for GST' }), IsOptional(), IsString()];
            __esDecorate(null, null, _itemId_decorators, { kind: "field", name: "itemId", static: false, private: false, access: { has: obj => "itemId" in obj, get: obj => obj.itemId, set: (obj, value) => { obj.itemId = value; } }, metadata: _metadata }, _itemId_initializers, _itemId_extraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
            __esDecorate(null, null, _discount_decorators, { kind: "field", name: "discount", static: false, private: false, access: { has: obj => "discount" in obj, get: obj => obj.discount, set: (obj, value) => { obj.discount = value; } }, metadata: _metadata }, _discount_initializers, _discount_extraInitializers);
            __esDecorate(null, null, _taxRate_decorators, { kind: "field", name: "taxRate", static: false, private: false, access: { has: obj => "taxRate" in obj, get: obj => obj.taxRate, set: (obj, value) => { obj.taxRate = value; } }, metadata: _metadata }, _taxRate_initializers, _taxRate_extraInitializers);
            __esDecorate(null, null, _hsnCode_decorators, { kind: "field", name: "hsnCode", static: false, private: false, access: { has: obj => "hsnCode" in obj, get: obj => obj.hsnCode, set: (obj, value) => { obj.hsnCode = value; } }, metadata: _metadata }, _hsnCode_initializers, _hsnCode_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { SaleItemDto };
let SaleAccessoryItemDto = (() => {
    var _a;
    let _accessoryId_decorators;
    let _accessoryId_initializers = [];
    let _accessoryId_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    let _unitPrice_extraInitializers = [];
    let _discount_decorators;
    let _discount_initializers = [];
    let _discount_extraInitializers = [];
    let _taxRate_decorators;
    let _taxRate_initializers = [];
    let _taxRate_extraInitializers = [];
    let _hsnCode_decorators;
    let _hsnCode_initializers = [];
    let _hsnCode_extraInitializers = [];
    return _a = class SaleAccessoryItemDto {
            constructor() {
                this.accessoryId = __runInitializers(this, _accessoryId_initializers, void 0);
                this.quantity = (__runInitializers(this, _accessoryId_extraInitializers), __runInitializers(this, _quantity_initializers, 1));
                this.unitPrice = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
                this.discount = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _discount_initializers, void 0));
                this.taxRate = (__runInitializers(this, _discount_extraInitializers), __runInitializers(this, _taxRate_initializers, void 0));
                this.hsnCode = (__runInitializers(this, _taxRate_extraInitializers), __runInitializers(this, _hsnCode_initializers, void 0));
                __runInitializers(this, _hsnCode_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _accessoryId_decorators = [ApiProperty({ description: 'Accessory UUID' }), IsUUID()];
            _quantity_decorators = [ApiProperty({ description: 'Quantity of this accessory', default: 1 }), IsNumber(), Min(1)];
            _unitPrice_decorators = [ApiProperty({ description: 'Unit selling price' }), IsNumber(), Min(0)];
            _discount_decorators = [ApiPropertyOptional({ description: 'Item-level discount amount', default: 0 }), IsOptional(), IsNumber(), Min(0)];
            _taxRate_decorators = [ApiPropertyOptional({ description: 'Tax rate percentage', default: 0 }), IsOptional(), IsNumber(), Min(0)];
            _hsnCode_decorators = [ApiPropertyOptional({ description: 'HSN code for GST' }), IsOptional(), IsString()];
            __esDecorate(null, null, _accessoryId_decorators, { kind: "field", name: "accessoryId", static: false, private: false, access: { has: obj => "accessoryId" in obj, get: obj => obj.accessoryId, set: (obj, value) => { obj.accessoryId = value; } }, metadata: _metadata }, _accessoryId_initializers, _accessoryId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
            __esDecorate(null, null, _discount_decorators, { kind: "field", name: "discount", static: false, private: false, access: { has: obj => "discount" in obj, get: obj => obj.discount, set: (obj, value) => { obj.discount = value; } }, metadata: _metadata }, _discount_initializers, _discount_extraInitializers);
            __esDecorate(null, null, _taxRate_decorators, { kind: "field", name: "taxRate", static: false, private: false, access: { has: obj => "taxRate" in obj, get: obj => obj.taxRate, set: (obj, value) => { obj.taxRate = value; } }, metadata: _metadata }, _taxRate_initializers, _taxRate_extraInitializers);
            __esDecorate(null, null, _hsnCode_decorators, { kind: "field", name: "hsnCode", static: false, private: false, access: { has: obj => "hsnCode" in obj, get: obj => obj.hsnCode, set: (obj, value) => { obj.hsnCode = value; } }, metadata: _metadata }, _hsnCode_initializers, _hsnCode_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { SaleAccessoryItemDto };
let PaymentSplitDto = (() => {
    var _a;
    let _method_decorators;
    let _method_initializers = [];
    let _method_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _reference_decorators;
    let _reference_initializers = [];
    let _reference_extraInitializers = [];
    let _note_decorators;
    let _note_initializers = [];
    let _note_extraInitializers = [];
    let _emiPlan_decorators;
    let _emiPlan_initializers = [];
    let _emiPlan_extraInitializers = [];
    return _a = class PaymentSplitDto {
            constructor() {
                this.method = __runInitializers(this, _method_initializers, void 0);
                this.amount = (__runInitializers(this, _method_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
                this.reference = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _reference_initializers, void 0));
                this.note = (__runInitializers(this, _reference_extraInitializers), __runInitializers(this, _note_initializers, void 0));
                this.emiPlan = (__runInitializers(this, _note_extraInitializers), __runInitializers(this, _emiPlan_initializers, void 0));
                __runInitializers(this, _emiPlan_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _method_decorators = [ApiProperty({ description: 'Payment method', enum: ['cash', 'card', 'online', 'exchange', 'advance', 'bajaj_emi'] }), IsIn(['cash', 'card', 'online', 'exchange', 'advance', 'bajaj_emi'])];
            _amount_decorators = [ApiProperty({ description: 'Amount for this payment split' }), IsNumber(), Min(0)];
            _reference_decorators = [ApiPropertyOptional({ description: 'Reference number (UPI/NEFT/card)' }), IsOptional(), IsString()];
            _note_decorators = [ApiPropertyOptional({ description: 'Additional note' }), IsOptional(), IsString()];
            _emiPlan_decorators = [ApiPropertyOptional({ description: 'EMI plan details (for bajaj_emi)' }), IsOptional()];
            __esDecorate(null, null, _method_decorators, { kind: "field", name: "method", static: false, private: false, access: { has: obj => "method" in obj, get: obj => obj.method, set: (obj, value) => { obj.method = value; } }, metadata: _metadata }, _method_initializers, _method_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _reference_decorators, { kind: "field", name: "reference", static: false, private: false, access: { has: obj => "reference" in obj, get: obj => obj.reference, set: (obj, value) => { obj.reference = value; } }, metadata: _metadata }, _reference_initializers, _reference_extraInitializers);
            __esDecorate(null, null, _note_decorators, { kind: "field", name: "note", static: false, private: false, access: { has: obj => "note" in obj, get: obj => obj.note, set: (obj, value) => { obj.note = value; } }, metadata: _metadata }, _note_initializers, _note_extraInitializers);
            __esDecorate(null, null, _emiPlan_decorators, { kind: "field", name: "emiPlan", static: false, private: false, access: { has: obj => "emiPlan" in obj, get: obj => obj.emiPlan, set: (obj, value) => { obj.emiPlan = value; } }, metadata: _metadata }, _emiPlan_initializers, _emiPlan_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { PaymentSplitDto };
let CreateSaleDto = (() => {
    var _a;
    let _branchId_decorators;
    let _branchId_initializers = [];
    let _branchId_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    let _accessoryItems_decorators;
    let _accessoryItems_initializers = [];
    let _accessoryItems_extraInitializers = [];
    let _payments_decorators;
    let _payments_initializers = [];
    let _payments_extraInitializers = [];
    let _discountAmount_decorators;
    let _discountAmount_initializers = [];
    let _discountAmount_extraInitializers = [];
    let _isInterState_decorators;
    let _isInterState_initializers = [];
    let _isInterState_extraInitializers = [];
    let _saleType_decorators;
    let _saleType_initializers = [];
    let _saleType_extraInitializers = [];
    let _couponCode_decorators;
    let _couponCode_initializers = [];
    let _couponCode_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return _a = class CreateSaleDto {
            constructor() {
                this.branchId = __runInitializers(this, _branchId_initializers, void 0);
                this.clientId = (__runInitializers(this, _branchId_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
                this.items = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _items_initializers, void 0));
                this.accessoryItems = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _accessoryItems_initializers, void 0));
                this.payments = (__runInitializers(this, _accessoryItems_extraInitializers), __runInitializers(this, _payments_initializers, void 0));
                this.discountAmount = (__runInitializers(this, _payments_extraInitializers), __runInitializers(this, _discountAmount_initializers, void 0));
                this.isInterState = (__runInitializers(this, _discountAmount_extraInitializers), __runInitializers(this, _isInterState_initializers, void 0));
                this.saleType = (__runInitializers(this, _isInterState_extraInitializers), __runInitializers(this, _saleType_initializers, void 0));
                this.couponCode = (__runInitializers(this, _saleType_extraInitializers), __runInitializers(this, _couponCode_initializers, void 0));
                this.notes = (__runInitializers(this, _couponCode_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _branchId_decorators = [ApiProperty({ description: 'Branch UUID' }), IsUUID()];
            _clientId_decorators = [ApiPropertyOptional({ description: 'Client UUID (optional for walk-in)' }), IsOptional(), IsUUID()];
            _items_decorators = [ApiProperty({ description: 'Sale items', type: [SaleItemDto] }), IsArray(), ArrayMinSize(1), ValidateNested({ each: true }), Type(() => SaleItemDto)];
            _accessoryItems_decorators = [ApiPropertyOptional({ description: 'Accessory items', type: [SaleAccessoryItemDto] }), IsOptional(), IsArray(), ValidateNested({ each: true }), Type(() => SaleAccessoryItemDto)];
            _payments_decorators = [ApiProperty({ description: 'Payment splits', type: [PaymentSplitDto] }), IsArray(), ArrayMinSize(1), ValidateNested({ each: true }), Type(() => PaymentSplitDto)];
            _discountAmount_decorators = [ApiPropertyOptional({ description: 'Sale-level discount amount', default: 0 }), IsOptional(), IsNumber(), Min(0)];
            _isInterState_decorators = [ApiPropertyOptional({ description: 'Whether this is an inter-state sale (IGST)', default: false }), IsOptional(), IsBoolean()];
            _saleType_decorators = [ApiPropertyOptional({ description: 'Sale type', enum: ['in-store', 'online'], default: 'in-store' }), IsOptional(), IsIn(['in-store', 'online'])];
            _couponCode_decorators = [ApiPropertyOptional({ description: 'Coupon code to apply' }), IsOptional(), IsString()];
            _notes_decorators = [ApiPropertyOptional({ description: 'Notes' }), IsOptional(), IsString()];
            __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: obj => "branchId" in obj, get: obj => obj.branchId, set: (obj, value) => { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            __esDecorate(null, null, _accessoryItems_decorators, { kind: "field", name: "accessoryItems", static: false, private: false, access: { has: obj => "accessoryItems" in obj, get: obj => obj.accessoryItems, set: (obj, value) => { obj.accessoryItems = value; } }, metadata: _metadata }, _accessoryItems_initializers, _accessoryItems_extraInitializers);
            __esDecorate(null, null, _payments_decorators, { kind: "field", name: "payments", static: false, private: false, access: { has: obj => "payments" in obj, get: obj => obj.payments, set: (obj, value) => { obj.payments = value; } }, metadata: _metadata }, _payments_initializers, _payments_extraInitializers);
            __esDecorate(null, null, _discountAmount_decorators, { kind: "field", name: "discountAmount", static: false, private: false, access: { has: obj => "discountAmount" in obj, get: obj => obj.discountAmount, set: (obj, value) => { obj.discountAmount = value; } }, metadata: _metadata }, _discountAmount_initializers, _discountAmount_extraInitializers);
            __esDecorate(null, null, _isInterState_decorators, { kind: "field", name: "isInterState", static: false, private: false, access: { has: obj => "isInterState" in obj, get: obj => obj.isInterState, set: (obj, value) => { obj.isInterState = value; } }, metadata: _metadata }, _isInterState_initializers, _isInterState_extraInitializers);
            __esDecorate(null, null, _saleType_decorators, { kind: "field", name: "saleType", static: false, private: false, access: { has: obj => "saleType" in obj, get: obj => obj.saleType, set: (obj, value) => { obj.saleType = value; } }, metadata: _metadata }, _saleType_initializers, _saleType_extraInitializers);
            __esDecorate(null, null, _couponCode_decorators, { kind: "field", name: "couponCode", static: false, private: false, access: { has: obj => "couponCode" in obj, get: obj => obj.couponCode, set: (obj, value) => { obj.couponCode = value; } }, metadata: _metadata }, _couponCode_initializers, _couponCode_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreateSaleDto };
//# sourceMappingURL=create-sale.dto.js.map