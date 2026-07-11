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
let WhatsappAppointment = (() => {
    let _classDecorators = [Entity('whatsapp_appointments')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _scheduledAt_decorators;
    let _scheduledAt_initializers = [];
    let _scheduledAt_extraInitializers = [];
    let _reminder24hSent_decorators;
    let _reminder24hSent_initializers = [];
    let _reminder24hSent_extraInitializers = [];
    let _reminder2hSent_decorators;
    let _reminder2hSent_initializers = [];
    let _reminder2hSent_extraInitializers = [];
    let _staffId_decorators;
    let _staffId_initializers = [];
    let _staffId_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    let _feedbackRating_decorators;
    let _feedbackRating_initializers = [];
    let _feedbackRating_extraInitializers = [];
    let _feedbackComment_decorators;
    let _feedbackComment_initializers = [];
    let _feedbackComment_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var WhatsappAppointment = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.clientId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
            this.phone = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
            this.name = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.type = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            this.status = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.scheduledAt = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _scheduledAt_initializers, void 0));
            this.reminder24hSent = (__runInitializers(this, _scheduledAt_extraInitializers), __runInitializers(this, _reminder24hSent_initializers, void 0));
            this.reminder2hSent = (__runInitializers(this, _reminder24hSent_extraInitializers), __runInitializers(this, _reminder2hSent_initializers, void 0));
            this.staffId = (__runInitializers(this, _reminder2hSent_extraInitializers), __runInitializers(this, _staffId_initializers, void 0));
            this.notes = (__runInitializers(this, _staffId_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
            this.metadata = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            this.feedbackRating = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _feedbackRating_initializers, void 0));
            this.feedbackComment = (__runInitializers(this, _feedbackRating_extraInitializers), __runInitializers(this, _feedbackComment_initializers, void 0));
            this.createdBy = (__runInitializers(this, _feedbackComment_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.createdAt = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "WhatsappAppointment");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _clientId_decorators = [Column({ name: 'client_id', nullable: true, type: 'varchar' })];
        _phone_decorators = [Column({ length: 20 })];
        _name_decorators = [Column({ type: 'varchar', length: 200, nullable: true })];
        _type_decorators = [Column({ length: 50 })];
        _status_decorators = [Column({ length: 30, default: 'scheduled' })];
        _scheduledAt_decorators = [Column({ name: 'scheduled_at', type: 'timestamptz' })];
        _reminder24hSent_decorators = [Column({ name: 'reminder_24h_sent', default: false })];
        _reminder2hSent_decorators = [Column({ name: 'reminder_2h_sent', default: false })];
        _staffId_decorators = [Column({ name: 'staff_id', nullable: true, type: 'varchar' })];
        _notes_decorators = [Column({ type: 'text', nullable: true })];
        _metadata_decorators = [Column({ type: 'jsonb', nullable: true })];
        _feedbackRating_decorators = [Column({ name: 'feedback_rating', type: 'smallint', nullable: true })];
        _feedbackComment_decorators = [Column({ name: 'feedback_comment', type: 'text', nullable: true })];
        _createdBy_decorators = [Column({ name: 'created_by', nullable: true, type: 'varchar' })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
        __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _scheduledAt_decorators, { kind: "field", name: "scheduledAt", static: false, private: false, access: { has: obj => "scheduledAt" in obj, get: obj => obj.scheduledAt, set: (obj, value) => { obj.scheduledAt = value; } }, metadata: _metadata }, _scheduledAt_initializers, _scheduledAt_extraInitializers);
        __esDecorate(null, null, _reminder24hSent_decorators, { kind: "field", name: "reminder24hSent", static: false, private: false, access: { has: obj => "reminder24hSent" in obj, get: obj => obj.reminder24hSent, set: (obj, value) => { obj.reminder24hSent = value; } }, metadata: _metadata }, _reminder24hSent_initializers, _reminder24hSent_extraInitializers);
        __esDecorate(null, null, _reminder2hSent_decorators, { kind: "field", name: "reminder2hSent", static: false, private: false, access: { has: obj => "reminder2hSent" in obj, get: obj => obj.reminder2hSent, set: (obj, value) => { obj.reminder2hSent = value; } }, metadata: _metadata }, _reminder2hSent_initializers, _reminder2hSent_extraInitializers);
        __esDecorate(null, null, _staffId_decorators, { kind: "field", name: "staffId", static: false, private: false, access: { has: obj => "staffId" in obj, get: obj => obj.staffId, set: (obj, value) => { obj.staffId = value; } }, metadata: _metadata }, _staffId_initializers, _staffId_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _feedbackRating_decorators, { kind: "field", name: "feedbackRating", static: false, private: false, access: { has: obj => "feedbackRating" in obj, get: obj => obj.feedbackRating, set: (obj, value) => { obj.feedbackRating = value; } }, metadata: _metadata }, _feedbackRating_initializers, _feedbackRating_extraInitializers);
        __esDecorate(null, null, _feedbackComment_decorators, { kind: "field", name: "feedbackComment", static: false, private: false, access: { has: obj => "feedbackComment" in obj, get: obj => obj.feedbackComment, set: (obj, value) => { obj.feedbackComment = value; } }, metadata: _metadata }, _feedbackComment_initializers, _feedbackComment_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappAppointment = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappAppointment = _classThis;
})();
export { WhatsappAppointment };
//# sourceMappingURL=whatsapp-appointment.entity.js.map