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
import { StockTransfer } from './stock-transfer.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
let StockTransferItem = (() => {
    let _classDecorators = [Entity('stock_transfer_items')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _transfer_decorators;
    let _transfer_initializers = [];
    let _transfer_extraInitializers = [];
    let _transferId_decorators;
    let _transferId_initializers = [];
    let _transferId_extraInitializers = [];
    let _item_decorators;
    let _item_initializers = [];
    let _item_extraInitializers = [];
    let _itemId_decorators;
    let _itemId_initializers = [];
    let _itemId_extraInitializers = [];
    let _imei_decorators;
    let _imei_initializers = [];
    let _imei_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    var StockTransferItem = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.transfer = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _transfer_initializers, void 0));
            this.transferId = (__runInitializers(this, _transfer_extraInitializers), __runInitializers(this, _transferId_initializers, void 0));
            this.item = (__runInitializers(this, _transferId_extraInitializers), __runInitializers(this, _item_initializers, void 0));
            this.itemId = (__runInitializers(this, _item_extraInitializers), __runInitializers(this, _itemId_initializers, void 0));
            this.imei = (__runInitializers(this, _itemId_extraInitializers), __runInitializers(this, _imei_initializers, void 0));
            this.status = (__runInitializers(this, _imei_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.notes = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
            __runInitializers(this, _notes_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "StockTransferItem");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _transfer_decorators = [ManyToOne(() => StockTransfer, (t) => t.items, { onDelete: 'CASCADE' }), JoinColumn({ name: 'transfer_id' })];
        _transferId_decorators = [Column({ name: 'transfer_id' })];
        _item_decorators = [ManyToOne(() => InventoryItem, { eager: false, nullable: false }), JoinColumn({ name: 'item_id' })];
        _itemId_decorators = [Column({ name: 'item_id' })];
        _imei_decorators = [Column({ length: 15 })];
        _status_decorators = [Column({ default: 'pending' })];
        _notes_decorators = [Column({ nullable: true, type: 'text' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _transfer_decorators, { kind: "field", name: "transfer", static: false, private: false, access: { has: obj => "transfer" in obj, get: obj => obj.transfer, set: (obj, value) => { obj.transfer = value; } }, metadata: _metadata }, _transfer_initializers, _transfer_extraInitializers);
        __esDecorate(null, null, _transferId_decorators, { kind: "field", name: "transferId", static: false, private: false, access: { has: obj => "transferId" in obj, get: obj => obj.transferId, set: (obj, value) => { obj.transferId = value; } }, metadata: _metadata }, _transferId_initializers, _transferId_extraInitializers);
        __esDecorate(null, null, _item_decorators, { kind: "field", name: "item", static: false, private: false, access: { has: obj => "item" in obj, get: obj => obj.item, set: (obj, value) => { obj.item = value; } }, metadata: _metadata }, _item_initializers, _item_extraInitializers);
        __esDecorate(null, null, _itemId_decorators, { kind: "field", name: "itemId", static: false, private: false, access: { has: obj => "itemId" in obj, get: obj => obj.itemId, set: (obj, value) => { obj.itemId = value; } }, metadata: _metadata }, _itemId_initializers, _itemId_extraInitializers);
        __esDecorate(null, null, _imei_decorators, { kind: "field", name: "imei", static: false, private: false, access: { has: obj => "imei" in obj, get: obj => obj.imei, set: (obj, value) => { obj.imei = value; } }, metadata: _metadata }, _imei_initializers, _imei_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StockTransferItem = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StockTransferItem = _classThis;
})();
export { StockTransferItem };
//# sourceMappingURL=stock-transfer-item.entity.js.map