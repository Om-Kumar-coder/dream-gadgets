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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, } from 'typeorm';
import { Sale } from './sale.entity';
let SaleItem = (() => {
    let _classDecorators = [Entity('sale_items')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _sale_decorators;
    let _sale_initializers = [];
    let _sale_extraInitializers = [];
    let _saleId_decorators;
    let _saleId_initializers = [];
    let _saleId_extraInitializers = [];
    let _itemId_decorators;
    let _itemId_initializers = [];
    let _itemId_extraInitializers = [];
    let _accessoryId_decorators;
    let _accessoryId_initializers = [];
    let _accessoryId_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _imei_decorators;
    let _imei_initializers = [];
    let _imei_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    let _unitPrice_extraInitializers = [];
    let _discount_decorators;
    let _discount_initializers = [];
    let _discount_extraInitializers = [];
    let _taxRate_decorators;
    let _taxRate_initializers = [];
    let _taxRate_extraInitializers = [];
    let _taxAmount_decorators;
    let _taxAmount_initializers = [];
    let _taxAmount_extraInitializers = [];
    let _total_decorators;
    let _total_initializers = [];
    let _total_extraInitializers = [];
    let _hsnCode_decorators;
    let _hsnCode_initializers = [];
    let _hsnCode_extraInitializers = [];
    var SaleItem = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.sale = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _sale_initializers, void 0));
            this.saleId = (__runInitializers(this, _sale_extraInitializers), __runInitializers(this, _saleId_initializers, void 0));
            this.itemId = (__runInitializers(this, _saleId_extraInitializers), __runInitializers(this, _itemId_initializers, void 0));
            this.accessoryId = (__runInitializers(this, _itemId_extraInitializers), __runInitializers(this, _accessoryId_initializers, void 0));
            this.quantity = (__runInitializers(this, _accessoryId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
            this.imei = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _imei_initializers, void 0));
            this.description = (__runInitializers(this, _imei_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.unitPrice = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
            this.discount = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _discount_initializers, void 0));
            this.taxRate = (__runInitializers(this, _discount_extraInitializers), __runInitializers(this, _taxRate_initializers, void 0));
            this.taxAmount = (__runInitializers(this, _taxRate_extraInitializers), __runInitializers(this, _taxAmount_initializers, void 0));
            this.total = (__runInitializers(this, _taxAmount_extraInitializers), __runInitializers(this, _total_initializers, void 0));
            this.hsnCode = (__runInitializers(this, _total_extraInitializers), __runInitializers(this, _hsnCode_initializers, void 0));
            __runInitializers(this, _hsnCode_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "SaleItem");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _sale_decorators = [ManyToOne(() => Sale, (s) => s.items, { onDelete: 'CASCADE' }), JoinColumn({ name: 'sale_id' })];
        _saleId_decorators = [Column({ name: 'sale_id' })];
        _itemId_decorators = [Column({ name: 'item_id', nullable: true, type: 'varchar' })];
        _accessoryId_decorators = [Column({ name: 'accessory_id', nullable: true, type: 'varchar' })];
        _quantity_decorators = [Column({ type: 'int', nullable: true, default: 1 })];
        _imei_decorators = [Column({ length: 15 })];
        _description_decorators = [Column({ length: 500, nullable: true, type: 'varchar' })];
        _unitPrice_decorators = [Column('decimal', { name: 'unit_price', precision: 12, scale: 2 })];
        _discount_decorators = [Column('decimal', { precision: 12, scale: 2, default: 0 })];
        _taxRate_decorators = [Column('decimal', { name: 'tax_rate', precision: 5, scale: 2, default: 0 })];
        _taxAmount_decorators = [Column('decimal', { name: 'tax_amount', precision: 12, scale: 2, default: 0 })];
        _total_decorators = [Column('decimal', { precision: 12, scale: 2 })];
        _hsnCode_decorators = [Column({ name: 'hsn_code', type: 'varchar', length: 20, nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _sale_decorators, { kind: "field", name: "sale", static: false, private: false, access: { has: obj => "sale" in obj, get: obj => obj.sale, set: (obj, value) => { obj.sale = value; } }, metadata: _metadata }, _sale_initializers, _sale_extraInitializers);
        __esDecorate(null, null, _saleId_decorators, { kind: "field", name: "saleId", static: false, private: false, access: { has: obj => "saleId" in obj, get: obj => obj.saleId, set: (obj, value) => { obj.saleId = value; } }, metadata: _metadata }, _saleId_initializers, _saleId_extraInitializers);
        __esDecorate(null, null, _itemId_decorators, { kind: "field", name: "itemId", static: false, private: false, access: { has: obj => "itemId" in obj, get: obj => obj.itemId, set: (obj, value) => { obj.itemId = value; } }, metadata: _metadata }, _itemId_initializers, _itemId_extraInitializers);
        __esDecorate(null, null, _accessoryId_decorators, { kind: "field", name: "accessoryId", static: false, private: false, access: { has: obj => "accessoryId" in obj, get: obj => obj.accessoryId, set: (obj, value) => { obj.accessoryId = value; } }, metadata: _metadata }, _accessoryId_initializers, _accessoryId_extraInitializers);
        __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
        __esDecorate(null, null, _imei_decorators, { kind: "field", name: "imei", static: false, private: false, access: { has: obj => "imei" in obj, get: obj => obj.imei, set: (obj, value) => { obj.imei = value; } }, metadata: _metadata }, _imei_initializers, _imei_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
        __esDecorate(null, null, _discount_decorators, { kind: "field", name: "discount", static: false, private: false, access: { has: obj => "discount" in obj, get: obj => obj.discount, set: (obj, value) => { obj.discount = value; } }, metadata: _metadata }, _discount_initializers, _discount_extraInitializers);
        __esDecorate(null, null, _taxRate_decorators, { kind: "field", name: "taxRate", static: false, private: false, access: { has: obj => "taxRate" in obj, get: obj => obj.taxRate, set: (obj, value) => { obj.taxRate = value; } }, metadata: _metadata }, _taxRate_initializers, _taxRate_extraInitializers);
        __esDecorate(null, null, _taxAmount_decorators, { kind: "field", name: "taxAmount", static: false, private: false, access: { has: obj => "taxAmount" in obj, get: obj => obj.taxAmount, set: (obj, value) => { obj.taxAmount = value; } }, metadata: _metadata }, _taxAmount_initializers, _taxAmount_extraInitializers);
        __esDecorate(null, null, _total_decorators, { kind: "field", name: "total", static: false, private: false, access: { has: obj => "total" in obj, get: obj => obj.total, set: (obj, value) => { obj.total = value; } }, metadata: _metadata }, _total_initializers, _total_extraInitializers);
        __esDecorate(null, null, _hsnCode_decorators, { kind: "field", name: "hsnCode", static: false, private: false, access: { has: obj => "hsnCode" in obj, get: obj => obj.hsnCode, set: (obj, value) => { obj.hsnCode = value; } }, metadata: _metadata }, _hsnCode_initializers, _hsnCode_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SaleItem = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SaleItem = _classThis;
})();
export { SaleItem };
//# sourceMappingURL=sale-item.entity.js.map