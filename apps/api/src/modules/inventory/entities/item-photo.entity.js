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
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';
let ItemPhoto = (() => {
    let _classDecorators = [Entity('item_photos')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _item_decorators;
    let _item_initializers = [];
    let _item_extraInitializers = [];
    let _itemId_decorators;
    let _itemId_initializers = [];
    let _itemId_extraInitializers = [];
    let _s3Key_decorators;
    let _s3Key_initializers = [];
    let _s3Key_extraInitializers = [];
    let _cdnUrl_decorators;
    let _cdnUrl_initializers = [];
    let _cdnUrl_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    let _isPrimary_decorators;
    let _isPrimary_initializers = [];
    let _isPrimary_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    var ItemPhoto = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.item = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _item_initializers, void 0));
            this.itemId = (__runInitializers(this, _item_extraInitializers), __runInitializers(this, _itemId_initializers, void 0));
            // DB column is 'key' not 's3_key'
            this.s3Key = (__runInitializers(this, _itemId_extraInitializers), __runInitializers(this, _s3Key_initializers, void 0));
            // DB column is 'url' not 'cdn_url'
            this.cdnUrl = (__runInitializers(this, _s3Key_extraInitializers), __runInitializers(this, _cdnUrl_initializers, void 0));
            this.sortOrder = (__runInitializers(this, _cdnUrl_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
            this.isPrimary = (__runInitializers(this, _sortOrder_extraInitializers), __runInitializers(this, _isPrimary_initializers, void 0));
            this.createdAt = (__runInitializers(this, _isPrimary_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "ItemPhoto");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _item_decorators = [ManyToOne(() => InventoryItem, (item) => item.photos, { onDelete: 'CASCADE' }), JoinColumn({ name: 'item_id' })];
        _itemId_decorators = [Column({ name: 'item_id' })];
        _s3Key_decorators = [Column({ name: 'key' })];
        _cdnUrl_decorators = [Column({ name: 'url' })];
        _sortOrder_decorators = [Column({ name: 'sort_order', default: 0 })];
        _isPrimary_decorators = [Column({ name: 'is_primary', default: false })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _item_decorators, { kind: "field", name: "item", static: false, private: false, access: { has: obj => "item" in obj, get: obj => obj.item, set: (obj, value) => { obj.item = value; } }, metadata: _metadata }, _item_initializers, _item_extraInitializers);
        __esDecorate(null, null, _itemId_decorators, { kind: "field", name: "itemId", static: false, private: false, access: { has: obj => "itemId" in obj, get: obj => obj.itemId, set: (obj, value) => { obj.itemId = value; } }, metadata: _metadata }, _itemId_initializers, _itemId_extraInitializers);
        __esDecorate(null, null, _s3Key_decorators, { kind: "field", name: "s3Key", static: false, private: false, access: { has: obj => "s3Key" in obj, get: obj => obj.s3Key, set: (obj, value) => { obj.s3Key = value; } }, metadata: _metadata }, _s3Key_initializers, _s3Key_extraInitializers);
        __esDecorate(null, null, _cdnUrl_decorators, { kind: "field", name: "cdnUrl", static: false, private: false, access: { has: obj => "cdnUrl" in obj, get: obj => obj.cdnUrl, set: (obj, value) => { obj.cdnUrl = value; } }, metadata: _metadata }, _cdnUrl_initializers, _cdnUrl_extraInitializers);
        __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
        __esDecorate(null, null, _isPrimary_decorators, { kind: "field", name: "isPrimary", static: false, private: false, access: { has: obj => "isPrimary" in obj, get: obj => obj.isPrimary, set: (obj, value) => { obj.isPrimary = value; } }, metadata: _metadata }, _isPrimary_initializers, _isPrimary_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ItemPhoto = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ItemPhoto = _classThis;
})();
export { ItemPhoto };
//# sourceMappingURL=item-photo.entity.js.map