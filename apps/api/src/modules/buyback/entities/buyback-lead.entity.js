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
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, } from 'typeorm';
import { BuybackPhoto } from './buyback-photo.entity';
let BuybackLead = (() => {
    let _classDecorators = [Entity('buyback_leads')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _photos_decorators;
    let _photos_initializers = [];
    let _photos_extraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _brand_decorators;
    let _brand_initializers = [];
    let _brand_extraInitializers = [];
    let _modelName_decorators;
    let _modelName_initializers = [];
    let _modelName_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _deviceType_decorators;
    let _deviceType_initializers = [];
    let _deviceType_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _screenCondition_decorators;
    let _screenCondition_initializers = [];
    let _screenCondition_extraInitializers = [];
    let _bodyCondition_decorators;
    let _bodyCondition_initializers = [];
    let _bodyCondition_extraInitializers = [];
    let _batteryHealth_decorators;
    let _batteryHealth_initializers = [];
    let _batteryHealth_extraInitializers = [];
    let _functionalIssues_decorators;
    let _functionalIssues_initializers = [];
    let _functionalIssues_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    var BuybackLead = _classThis = class {
        constructor() {
            this.photos = __runInitializers(this, _photos_initializers, void 0);
            this.id = (__runInitializers(this, _photos_extraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.brand = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _brand_initializers, void 0));
            this.modelName = (__runInitializers(this, _brand_extraInitializers), __runInitializers(this, _modelName_initializers, void 0));
            this.phone = (__runInitializers(this, _modelName_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
            this.deviceType = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _deviceType_initializers, void 0));
            this.status = (__runInitializers(this, _deviceType_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.screenCondition = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _screenCondition_initializers, void 0));
            this.bodyCondition = (__runInitializers(this, _screenCondition_extraInitializers), __runInitializers(this, _bodyCondition_initializers, void 0));
            this.batteryHealth = (__runInitializers(this, _bodyCondition_extraInitializers), __runInitializers(this, _batteryHealth_initializers, void 0));
            this.functionalIssues = (__runInitializers(this, _batteryHealth_extraInitializers), __runInitializers(this, _functionalIssues_initializers, void 0));
            this.notes = (__runInitializers(this, _functionalIssues_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
            this.createdAt = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "BuybackLead");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _photos_decorators = [OneToMany(() => BuybackPhoto, (photo) => photo.lead, { cascade: true })];
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _brand_decorators = [Column({ length: 100 })];
        _modelName_decorators = [Column({ name: 'model_name', length: 200 })];
        _phone_decorators = [Column({ length: 20 })];
        _deviceType_decorators = [Column({ name: 'device_type', length: 50, default: 'mobile' })];
        _status_decorators = [Column({ length: 30, default: 'pending' })];
        _screenCondition_decorators = [Column({ name: 'screen_condition', nullable: true, type: 'varchar', length: 50 })];
        _bodyCondition_decorators = [Column({ name: 'body_condition', nullable: true, type: 'varchar', length: 50 })];
        _batteryHealth_decorators = [Column({ name: 'battery_health', nullable: true, type: 'varchar', length: 20 })];
        _functionalIssues_decorators = [Column({ name: 'functional_issues', nullable: true, type: 'text' })];
        _notes_decorators = [Column({ nullable: true, type: 'text' })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        __esDecorate(null, null, _photos_decorators, { kind: "field", name: "photos", static: false, private: false, access: { has: obj => "photos" in obj, get: obj => obj.photos, set: (obj, value) => { obj.photos = value; } }, metadata: _metadata }, _photos_initializers, _photos_extraInitializers);
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _brand_decorators, { kind: "field", name: "brand", static: false, private: false, access: { has: obj => "brand" in obj, get: obj => obj.brand, set: (obj, value) => { obj.brand = value; } }, metadata: _metadata }, _brand_initializers, _brand_extraInitializers);
        __esDecorate(null, null, _modelName_decorators, { kind: "field", name: "modelName", static: false, private: false, access: { has: obj => "modelName" in obj, get: obj => obj.modelName, set: (obj, value) => { obj.modelName = value; } }, metadata: _metadata }, _modelName_initializers, _modelName_extraInitializers);
        __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
        __esDecorate(null, null, _deviceType_decorators, { kind: "field", name: "deviceType", static: false, private: false, access: { has: obj => "deviceType" in obj, get: obj => obj.deviceType, set: (obj, value) => { obj.deviceType = value; } }, metadata: _metadata }, _deviceType_initializers, _deviceType_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _screenCondition_decorators, { kind: "field", name: "screenCondition", static: false, private: false, access: { has: obj => "screenCondition" in obj, get: obj => obj.screenCondition, set: (obj, value) => { obj.screenCondition = value; } }, metadata: _metadata }, _screenCondition_initializers, _screenCondition_extraInitializers);
        __esDecorate(null, null, _bodyCondition_decorators, { kind: "field", name: "bodyCondition", static: false, private: false, access: { has: obj => "bodyCondition" in obj, get: obj => obj.bodyCondition, set: (obj, value) => { obj.bodyCondition = value; } }, metadata: _metadata }, _bodyCondition_initializers, _bodyCondition_extraInitializers);
        __esDecorate(null, null, _batteryHealth_decorators, { kind: "field", name: "batteryHealth", static: false, private: false, access: { has: obj => "batteryHealth" in obj, get: obj => obj.batteryHealth, set: (obj, value) => { obj.batteryHealth = value; } }, metadata: _metadata }, _batteryHealth_initializers, _batteryHealth_extraInitializers);
        __esDecorate(null, null, _functionalIssues_decorators, { kind: "field", name: "functionalIssues", static: false, private: false, access: { has: obj => "functionalIssues" in obj, get: obj => obj.functionalIssues, set: (obj, value) => { obj.functionalIssues = value; } }, metadata: _metadata }, _functionalIssues_initializers, _functionalIssues_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BuybackLead = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BuybackLead = _classThis;
})();
export { BuybackLead };
//# sourceMappingURL=buyback-lead.entity.js.map