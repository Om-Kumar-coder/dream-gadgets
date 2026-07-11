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
import { OnlineOrder } from './online-order.entity';
let OnlineOrderItem = (() => {
    let _classDecorators = [Entity('online_order_items')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _order_decorators;
    let _order_initializers = [];
    let _order_extraInitializers = [];
    let _orderId_decorators;
    let _orderId_initializers = [];
    let _orderId_extraInitializers = [];
    let _itemId_decorators;
    let _itemId_initializers = [];
    let _itemId_extraInitializers = [];
    let _imei_decorators;
    let _imei_initializers = [];
    let _imei_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    let _unitPrice_extraInitializers = [];
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
    var OnlineOrderItem = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.order = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _order_initializers, void 0));
            this.orderId = (__runInitializers(this, _order_extraInitializers), __runInitializers(this, _orderId_initializers, void 0));
            this.itemId = (__runInitializers(this, _orderId_extraInitializers), __runInitializers(this, _itemId_initializers, void 0));
            this.imei = (__runInitializers(this, _itemId_extraInitializers), __runInitializers(this, _imei_initializers, void 0));
            this.description = (__runInitializers(this, _imei_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.unitPrice = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
            this.taxRate = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _taxRate_initializers, void 0));
            this.taxAmount = (__runInitializers(this, _taxRate_extraInitializers), __runInitializers(this, _taxAmount_initializers, void 0));
            this.total = (__runInitializers(this, _taxAmount_extraInitializers), __runInitializers(this, _total_initializers, void 0));
            this.hsnCode = (__runInitializers(this, _total_extraInitializers), __runInitializers(this, _hsnCode_initializers, void 0));
            __runInitializers(this, _hsnCode_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "OnlineOrderItem");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _order_decorators = [ManyToOne(() => OnlineOrder, (o) => o.items, { onDelete: 'CASCADE' }), JoinColumn({ name: 'order_id' })];
        _orderId_decorators = [Column({ name: 'order_id' })];
        _itemId_decorators = [Column({ name: 'item_id', nullable: true, type: 'uuid' })];
        _imei_decorators = [Column({ type: 'varchar', length: 50, nullable: true })];
        _description_decorators = [Column({ nullable: true, type: 'varchar', length: 500 })];
        _unitPrice_decorators = [Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })];
        _taxRate_decorators = [Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })];
        _taxAmount_decorators = [Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })];
        _total_decorators = [Column({ type: 'decimal', precision: 12, scale: 2 })];
        _hsnCode_decorators = [Column({ name: 'hsn_code', nullable: true, type: 'varchar', length: 20 })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: obj => "order" in obj, get: obj => obj.order, set: (obj, value) => { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
        __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: obj => "orderId" in obj, get: obj => obj.orderId, set: (obj, value) => { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
        __esDecorate(null, null, _itemId_decorators, { kind: "field", name: "itemId", static: false, private: false, access: { has: obj => "itemId" in obj, get: obj => obj.itemId, set: (obj, value) => { obj.itemId = value; } }, metadata: _metadata }, _itemId_initializers, _itemId_extraInitializers);
        __esDecorate(null, null, _imei_decorators, { kind: "field", name: "imei", static: false, private: false, access: { has: obj => "imei" in obj, get: obj => obj.imei, set: (obj, value) => { obj.imei = value; } }, metadata: _metadata }, _imei_initializers, _imei_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
        __esDecorate(null, null, _taxRate_decorators, { kind: "field", name: "taxRate", static: false, private: false, access: { has: obj => "taxRate" in obj, get: obj => obj.taxRate, set: (obj, value) => { obj.taxRate = value; } }, metadata: _metadata }, _taxRate_initializers, _taxRate_extraInitializers);
        __esDecorate(null, null, _taxAmount_decorators, { kind: "field", name: "taxAmount", static: false, private: false, access: { has: obj => "taxAmount" in obj, get: obj => obj.taxAmount, set: (obj, value) => { obj.taxAmount = value; } }, metadata: _metadata }, _taxAmount_initializers, _taxAmount_extraInitializers);
        __esDecorate(null, null, _total_decorators, { kind: "field", name: "total", static: false, private: false, access: { has: obj => "total" in obj, get: obj => obj.total, set: (obj, value) => { obj.total = value; } }, metadata: _metadata }, _total_initializers, _total_extraInitializers);
        __esDecorate(null, null, _hsnCode_decorators, { kind: "field", name: "hsnCode", static: false, private: false, access: { has: obj => "hsnCode" in obj, get: obj => obj.hsnCode, set: (obj, value) => { obj.hsnCode = value; } }, metadata: _metadata }, _hsnCode_initializers, _hsnCode_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OnlineOrderItem = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OnlineOrderItem = _classThis;
})();
export { OnlineOrderItem };
//# sourceMappingURL=online-order-item.entity.js.map