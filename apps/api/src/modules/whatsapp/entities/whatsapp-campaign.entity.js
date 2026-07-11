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
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, } from 'typeorm';
let WhatsappCampaign = (() => {
    let _classDecorators = [Entity('whatsapp_campaigns')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _templateId_decorators;
    let _templateId_initializers = [];
    let _templateId_extraInitializers = [];
    let _segmentFilter_decorators;
    let _segmentFilter_initializers = [];
    let _segmentFilter_extraInitializers = [];
    let _scheduledAt_decorators;
    let _scheduledAt_initializers = [];
    let _scheduledAt_extraInitializers = [];
    let _sentAt_decorators;
    let _sentAt_initializers = [];
    let _sentAt_extraInitializers = [];
    let _completedAt_decorators;
    let _completedAt_initializers = [];
    let _completedAt_extraInitializers = [];
    let _totalRecipients_decorators;
    let _totalRecipients_initializers = [];
    let _totalRecipients_extraInitializers = [];
    let _sentCount_decorators;
    let _sentCount_initializers = [];
    let _sentCount_extraInitializers = [];
    let _deliveredCount_decorators;
    let _deliveredCount_initializers = [];
    let _deliveredCount_extraInitializers = [];
    let _readCount_decorators;
    let _readCount_initializers = [];
    let _readCount_extraInitializers = [];
    let _failedCount_decorators;
    let _failedCount_initializers = [];
    let _failedCount_extraInitializers = [];
    let _clickCount_decorators;
    let _clickCount_initializers = [];
    let _clickCount_extraInitializers = [];
    let _conversionCount_decorators;
    let _conversionCount_initializers = [];
    let _conversionCount_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var WhatsappCampaign = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.status = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.type = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            this.templateId = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _templateId_initializers, void 0));
            this.segmentFilter = (__runInitializers(this, _templateId_extraInitializers), __runInitializers(this, _segmentFilter_initializers, void 0));
            this.scheduledAt = (__runInitializers(this, _segmentFilter_extraInitializers), __runInitializers(this, _scheduledAt_initializers, void 0));
            this.sentAt = (__runInitializers(this, _scheduledAt_extraInitializers), __runInitializers(this, _sentAt_initializers, void 0));
            this.completedAt = (__runInitializers(this, _sentAt_extraInitializers), __runInitializers(this, _completedAt_initializers, void 0));
            this.totalRecipients = (__runInitializers(this, _completedAt_extraInitializers), __runInitializers(this, _totalRecipients_initializers, void 0));
            this.sentCount = (__runInitializers(this, _totalRecipients_extraInitializers), __runInitializers(this, _sentCount_initializers, void 0));
            this.deliveredCount = (__runInitializers(this, _sentCount_extraInitializers), __runInitializers(this, _deliveredCount_initializers, void 0));
            this.readCount = (__runInitializers(this, _deliveredCount_extraInitializers), __runInitializers(this, _readCount_initializers, void 0));
            this.failedCount = (__runInitializers(this, _readCount_extraInitializers), __runInitializers(this, _failedCount_initializers, void 0));
            this.clickCount = (__runInitializers(this, _failedCount_extraInitializers), __runInitializers(this, _clickCount_initializers, void 0));
            this.conversionCount = (__runInitializers(this, _clickCount_extraInitializers), __runInitializers(this, _conversionCount_initializers, void 0));
            this.metadata = (__runInitializers(this, _conversionCount_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            this.createdBy = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.createdAt = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "WhatsappCampaign");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _name_decorators = [Column({ length: 200 })];
        _description_decorators = [Column({ type: 'text', nullable: true })];
        _status_decorators = [Column({ length: 30, default: 'draft' })];
        _type_decorators = [Column({ length: 50, default: 'broadcast' })];
        _templateId_decorators = [Column({ name: 'template_id', nullable: true, type: 'varchar' })];
        _segmentFilter_decorators = [Column({ type: 'jsonb', nullable: true })];
        _scheduledAt_decorators = [Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })];
        _sentAt_decorators = [Column({ name: 'sent_at', type: 'timestamptz', nullable: true })];
        _completedAt_decorators = [Column({ name: 'completed_at', type: 'timestamptz', nullable: true })];
        _totalRecipients_decorators = [Column({ name: 'total_recipients', default: 0 })];
        _sentCount_decorators = [Column({ name: 'sent_count', default: 0 })];
        _deliveredCount_decorators = [Column({ name: 'delivered_count', default: 0 })];
        _readCount_decorators = [Column({ name: 'read_count', default: 0 })];
        _failedCount_decorators = [Column({ name: 'failed_count', default: 0 })];
        _clickCount_decorators = [Column({ name: 'click_count', default: 0 })];
        _conversionCount_decorators = [Column({ name: 'conversion_count', default: 0 })];
        _metadata_decorators = [Column({ type: 'jsonb', nullable: true })];
        _createdBy_decorators = [Column({ name: 'created_by', nullable: true, type: 'varchar' })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _templateId_decorators, { kind: "field", name: "templateId", static: false, private: false, access: { has: obj => "templateId" in obj, get: obj => obj.templateId, set: (obj, value) => { obj.templateId = value; } }, metadata: _metadata }, _templateId_initializers, _templateId_extraInitializers);
        __esDecorate(null, null, _segmentFilter_decorators, { kind: "field", name: "segmentFilter", static: false, private: false, access: { has: obj => "segmentFilter" in obj, get: obj => obj.segmentFilter, set: (obj, value) => { obj.segmentFilter = value; } }, metadata: _metadata }, _segmentFilter_initializers, _segmentFilter_extraInitializers);
        __esDecorate(null, null, _scheduledAt_decorators, { kind: "field", name: "scheduledAt", static: false, private: false, access: { has: obj => "scheduledAt" in obj, get: obj => obj.scheduledAt, set: (obj, value) => { obj.scheduledAt = value; } }, metadata: _metadata }, _scheduledAt_initializers, _scheduledAt_extraInitializers);
        __esDecorate(null, null, _sentAt_decorators, { kind: "field", name: "sentAt", static: false, private: false, access: { has: obj => "sentAt" in obj, get: obj => obj.sentAt, set: (obj, value) => { obj.sentAt = value; } }, metadata: _metadata }, _sentAt_initializers, _sentAt_extraInitializers);
        __esDecorate(null, null, _completedAt_decorators, { kind: "field", name: "completedAt", static: false, private: false, access: { has: obj => "completedAt" in obj, get: obj => obj.completedAt, set: (obj, value) => { obj.completedAt = value; } }, metadata: _metadata }, _completedAt_initializers, _completedAt_extraInitializers);
        __esDecorate(null, null, _totalRecipients_decorators, { kind: "field", name: "totalRecipients", static: false, private: false, access: { has: obj => "totalRecipients" in obj, get: obj => obj.totalRecipients, set: (obj, value) => { obj.totalRecipients = value; } }, metadata: _metadata }, _totalRecipients_initializers, _totalRecipients_extraInitializers);
        __esDecorate(null, null, _sentCount_decorators, { kind: "field", name: "sentCount", static: false, private: false, access: { has: obj => "sentCount" in obj, get: obj => obj.sentCount, set: (obj, value) => { obj.sentCount = value; } }, metadata: _metadata }, _sentCount_initializers, _sentCount_extraInitializers);
        __esDecorate(null, null, _deliveredCount_decorators, { kind: "field", name: "deliveredCount", static: false, private: false, access: { has: obj => "deliveredCount" in obj, get: obj => obj.deliveredCount, set: (obj, value) => { obj.deliveredCount = value; } }, metadata: _metadata }, _deliveredCount_initializers, _deliveredCount_extraInitializers);
        __esDecorate(null, null, _readCount_decorators, { kind: "field", name: "readCount", static: false, private: false, access: { has: obj => "readCount" in obj, get: obj => obj.readCount, set: (obj, value) => { obj.readCount = value; } }, metadata: _metadata }, _readCount_initializers, _readCount_extraInitializers);
        __esDecorate(null, null, _failedCount_decorators, { kind: "field", name: "failedCount", static: false, private: false, access: { has: obj => "failedCount" in obj, get: obj => obj.failedCount, set: (obj, value) => { obj.failedCount = value; } }, metadata: _metadata }, _failedCount_initializers, _failedCount_extraInitializers);
        __esDecorate(null, null, _clickCount_decorators, { kind: "field", name: "clickCount", static: false, private: false, access: { has: obj => "clickCount" in obj, get: obj => obj.clickCount, set: (obj, value) => { obj.clickCount = value; } }, metadata: _metadata }, _clickCount_initializers, _clickCount_extraInitializers);
        __esDecorate(null, null, _conversionCount_decorators, { kind: "field", name: "conversionCount", static: false, private: false, access: { has: obj => "conversionCount" in obj, get: obj => obj.conversionCount, set: (obj, value) => { obj.conversionCount = value; } }, metadata: _metadata }, _conversionCount_initializers, _conversionCount_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappCampaign = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappCampaign = _classThis;
})();
export { WhatsappCampaign };
//# sourceMappingURL=whatsapp-campaign.entity.js.map