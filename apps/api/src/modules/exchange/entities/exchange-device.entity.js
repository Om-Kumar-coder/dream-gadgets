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
import { User } from '../../auth/entities/user.entity';
let ExchangeDevice = (() => {
    let _classDecorators = [Entity('exchange_devices')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _saleId_decorators;
    let _saleId_initializers = [];
    let _saleId_extraInitializers = [];
    let _brandId_decorators;
    let _brandId_initializers = [];
    let _brandId_extraInitializers = [];
    let _modelId_decorators;
    let _modelId_initializers = [];
    let _modelId_extraInitializers = [];
    let _imei_decorators;
    let _imei_initializers = [];
    let _imei_extraInitializers = [];
    let _colour_decorators;
    let _colour_initializers = [];
    let _colour_extraInitializers = [];
    let _storage_decorators;
    let _storage_initializers = [];
    let _storage_extraInitializers = [];
    let _condition_decorators;
    let _condition_initializers = [];
    let _condition_extraInitializers = [];
    let _batteryHealth_decorators;
    let _batteryHealth_initializers = [];
    let _batteryHealth_extraInitializers = [];
    let _conditionNotes_decorators;
    let _conditionNotes_initializers = [];
    let _conditionNotes_extraInitializers = [];
    let _exchangePrice_decorators;
    let _exchangePrice_initializers = [];
    let _exchangePrice_extraInitializers = [];
    let _photos_decorators;
    let _photos_initializers = [];
    let _photos_extraInitializers = [];
    let _kycVerified_decorators;
    let _kycVerified_initializers = [];
    let _kycVerified_extraInitializers = [];
    let _addedToInventory_decorators;
    let _addedToInventory_initializers = [];
    let _addedToInventory_extraInitializers = [];
    let _inventoryItemId_decorators;
    let _inventoryItemId_initializers = [];
    let _inventoryItemId_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _createdById_decorators;
    let _createdById_initializers = [];
    let _createdById_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    var ExchangeDevice = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.clientId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
            this.saleId = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _saleId_initializers, void 0));
            this.brandId = (__runInitializers(this, _saleId_extraInitializers), __runInitializers(this, _brandId_initializers, void 0));
            this.modelId = (__runInitializers(this, _brandId_extraInitializers), __runInitializers(this, _modelId_initializers, void 0));
            this.imei = (__runInitializers(this, _modelId_extraInitializers), __runInitializers(this, _imei_initializers, void 0));
            this.colour = (__runInitializers(this, _imei_extraInitializers), __runInitializers(this, _colour_initializers, void 0));
            this.storage = (__runInitializers(this, _colour_extraInitializers), __runInitializers(this, _storage_initializers, void 0));
            this.condition = (__runInitializers(this, _storage_extraInitializers), __runInitializers(this, _condition_initializers, void 0));
            this.batteryHealth = (__runInitializers(this, _condition_extraInitializers), __runInitializers(this, _batteryHealth_initializers, void 0));
            this.conditionNotes = (__runInitializers(this, _batteryHealth_extraInitializers), __runInitializers(this, _conditionNotes_initializers, void 0));
            this.exchangePrice = (__runInitializers(this, _conditionNotes_extraInitializers), __runInitializers(this, _exchangePrice_initializers, void 0));
            this.photos = (__runInitializers(this, _exchangePrice_extraInitializers), __runInitializers(this, _photos_initializers, void 0));
            this.kycVerified = (__runInitializers(this, _photos_extraInitializers), __runInitializers(this, _kycVerified_initializers, void 0));
            this.addedToInventory = (__runInitializers(this, _kycVerified_extraInitializers), __runInitializers(this, _addedToInventory_initializers, void 0));
            this.inventoryItemId = (__runInitializers(this, _addedToInventory_extraInitializers), __runInitializers(this, _inventoryItemId_initializers, void 0));
            // DB column is 'created_by' not 'created_by_id'
            this.createdBy = (__runInitializers(this, _inventoryItemId_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.createdById = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _createdById_initializers, void 0));
            this.createdAt = (__runInitializers(this, _createdById_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "ExchangeDevice");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _clientId_decorators = [Column({ name: 'client_id', nullable: true, type: 'varchar' })];
        _saleId_decorators = [Column({ name: 'sale_id', nullable: true, type: 'varchar' })];
        _brandId_decorators = [Column({ name: 'brand_id', nullable: true, type: 'varchar' })];
        _modelId_decorators = [Column({ name: 'model_id', nullable: true, type: 'varchar' })];
        _imei_decorators = [Column({ nullable: true, type: 'varchar', length: 15 })];
        _colour_decorators = [Column({ nullable: true, type: 'varchar' })];
        _storage_decorators = [Column({ nullable: true, type: 'varchar' })];
        _condition_decorators = [Column({ nullable: true, type: 'varchar' })];
        _batteryHealth_decorators = [Column({ name: 'battery_health', nullable: true, type: 'smallint' })];
        _conditionNotes_decorators = [Column({ name: 'condition_notes', nullable: true, type: 'jsonb' })];
        _exchangePrice_decorators = [Column('decimal', { name: 'exchange_price', precision: 12, scale: 2 })];
        _photos_decorators = [Column({ nullable: true, type: 'jsonb' })];
        _kycVerified_decorators = [Column({ name: 'kyc_verified', default: false })];
        _addedToInventory_decorators = [Column({ name: 'added_to_inventory', default: false })];
        _inventoryItemId_decorators = [Column({ name: 'inventory_item_id', nullable: true, type: 'varchar' })];
        _createdBy_decorators = [ManyToOne(() => User, { eager: false, nullable: true }), JoinColumn({ name: 'created_by' })];
        _createdById_decorators = [Column({ name: 'created_by', nullable: true, type: 'varchar' })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
        __esDecorate(null, null, _saleId_decorators, { kind: "field", name: "saleId", static: false, private: false, access: { has: obj => "saleId" in obj, get: obj => obj.saleId, set: (obj, value) => { obj.saleId = value; } }, metadata: _metadata }, _saleId_initializers, _saleId_extraInitializers);
        __esDecorate(null, null, _brandId_decorators, { kind: "field", name: "brandId", static: false, private: false, access: { has: obj => "brandId" in obj, get: obj => obj.brandId, set: (obj, value) => { obj.brandId = value; } }, metadata: _metadata }, _brandId_initializers, _brandId_extraInitializers);
        __esDecorate(null, null, _modelId_decorators, { kind: "field", name: "modelId", static: false, private: false, access: { has: obj => "modelId" in obj, get: obj => obj.modelId, set: (obj, value) => { obj.modelId = value; } }, metadata: _metadata }, _modelId_initializers, _modelId_extraInitializers);
        __esDecorate(null, null, _imei_decorators, { kind: "field", name: "imei", static: false, private: false, access: { has: obj => "imei" in obj, get: obj => obj.imei, set: (obj, value) => { obj.imei = value; } }, metadata: _metadata }, _imei_initializers, _imei_extraInitializers);
        __esDecorate(null, null, _colour_decorators, { kind: "field", name: "colour", static: false, private: false, access: { has: obj => "colour" in obj, get: obj => obj.colour, set: (obj, value) => { obj.colour = value; } }, metadata: _metadata }, _colour_initializers, _colour_extraInitializers);
        __esDecorate(null, null, _storage_decorators, { kind: "field", name: "storage", static: false, private: false, access: { has: obj => "storage" in obj, get: obj => obj.storage, set: (obj, value) => { obj.storage = value; } }, metadata: _metadata }, _storage_initializers, _storage_extraInitializers);
        __esDecorate(null, null, _condition_decorators, { kind: "field", name: "condition", static: false, private: false, access: { has: obj => "condition" in obj, get: obj => obj.condition, set: (obj, value) => { obj.condition = value; } }, metadata: _metadata }, _condition_initializers, _condition_extraInitializers);
        __esDecorate(null, null, _batteryHealth_decorators, { kind: "field", name: "batteryHealth", static: false, private: false, access: { has: obj => "batteryHealth" in obj, get: obj => obj.batteryHealth, set: (obj, value) => { obj.batteryHealth = value; } }, metadata: _metadata }, _batteryHealth_initializers, _batteryHealth_extraInitializers);
        __esDecorate(null, null, _conditionNotes_decorators, { kind: "field", name: "conditionNotes", static: false, private: false, access: { has: obj => "conditionNotes" in obj, get: obj => obj.conditionNotes, set: (obj, value) => { obj.conditionNotes = value; } }, metadata: _metadata }, _conditionNotes_initializers, _conditionNotes_extraInitializers);
        __esDecorate(null, null, _exchangePrice_decorators, { kind: "field", name: "exchangePrice", static: false, private: false, access: { has: obj => "exchangePrice" in obj, get: obj => obj.exchangePrice, set: (obj, value) => { obj.exchangePrice = value; } }, metadata: _metadata }, _exchangePrice_initializers, _exchangePrice_extraInitializers);
        __esDecorate(null, null, _photos_decorators, { kind: "field", name: "photos", static: false, private: false, access: { has: obj => "photos" in obj, get: obj => obj.photos, set: (obj, value) => { obj.photos = value; } }, metadata: _metadata }, _photos_initializers, _photos_extraInitializers);
        __esDecorate(null, null, _kycVerified_decorators, { kind: "field", name: "kycVerified", static: false, private: false, access: { has: obj => "kycVerified" in obj, get: obj => obj.kycVerified, set: (obj, value) => { obj.kycVerified = value; } }, metadata: _metadata }, _kycVerified_initializers, _kycVerified_extraInitializers);
        __esDecorate(null, null, _addedToInventory_decorators, { kind: "field", name: "addedToInventory", static: false, private: false, access: { has: obj => "addedToInventory" in obj, get: obj => obj.addedToInventory, set: (obj, value) => { obj.addedToInventory = value; } }, metadata: _metadata }, _addedToInventory_initializers, _addedToInventory_extraInitializers);
        __esDecorate(null, null, _inventoryItemId_decorators, { kind: "field", name: "inventoryItemId", static: false, private: false, access: { has: obj => "inventoryItemId" in obj, get: obj => obj.inventoryItemId, set: (obj, value) => { obj.inventoryItemId = value; } }, metadata: _metadata }, _inventoryItemId_initializers, _inventoryItemId_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _createdById_decorators, { kind: "field", name: "createdById", static: false, private: false, access: { has: obj => "createdById" in obj, get: obj => obj.createdById, set: (obj, value) => { obj.createdById = value; } }, metadata: _metadata }, _createdById_initializers, _createdById_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExchangeDevice = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExchangeDevice = _classThis;
})();
export { ExchangeDevice };
//# sourceMappingURL=exchange-device.entity.js.map