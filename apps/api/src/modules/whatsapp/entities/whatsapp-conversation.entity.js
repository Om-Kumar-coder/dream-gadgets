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
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, } from 'typeorm';
import { WhatsappMessage } from './whatsapp-message.entity';
let WhatsappConversation = (() => {
    let _classDecorators = [Entity('whatsapp_conversations')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _customerPhone_decorators;
    let _customerPhone_initializers = [];
    let _customerPhone_extraInitializers = [];
    let _customerName_decorators;
    let _customerName_initializers = [];
    let _customerName_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _assignedStaffId_decorators;
    let _assignedStaffId_initializers = [];
    let _assignedStaffId_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    let _tags_decorators;
    let _tags_initializers = [];
    let _tags_extraInitializers = [];
    let _lastMessageAt_decorators;
    let _lastMessageAt_initializers = [];
    let _lastMessageAt_extraInitializers = [];
    let _lastMessagePreview_decorators;
    let _lastMessagePreview_initializers = [];
    let _lastMessagePreview_extraInitializers = [];
    let _unreadCount_decorators;
    let _unreadCount_initializers = [];
    let _unreadCount_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    let _messages_decorators;
    let _messages_initializers = [];
    let _messages_extraInitializers = [];
    var WhatsappConversation = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.customerPhone = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _customerPhone_initializers, void 0));
            this.customerName = (__runInitializers(this, _customerPhone_extraInitializers), __runInitializers(this, _customerName_initializers, void 0));
            this.type = (__runInitializers(this, _customerName_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            this.status = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.assignedStaffId = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _assignedStaffId_initializers, void 0));
            this.priority = (__runInitializers(this, _assignedStaffId_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
            this.tags = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _tags_initializers, void 0));
            this.lastMessageAt = (__runInitializers(this, _tags_extraInitializers), __runInitializers(this, _lastMessageAt_initializers, void 0));
            this.lastMessagePreview = (__runInitializers(this, _lastMessageAt_extraInitializers), __runInitializers(this, _lastMessagePreview_initializers, void 0));
            this.unreadCount = (__runInitializers(this, _lastMessagePreview_extraInitializers), __runInitializers(this, _unreadCount_initializers, void 0));
            this.metadata = (__runInitializers(this, _unreadCount_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            this.createdAt = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            this.messages = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _messages_initializers, void 0));
            __runInitializers(this, _messages_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "WhatsappConversation");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _customerPhone_decorators = [Column({ name: 'customer_phone', length: 20 })];
        _customerName_decorators = [Column({ name: 'customer_name', type: 'varchar', length: 200, nullable: true })];
        _type_decorators = [Column({ length: 50, default: 'general' })];
        _status_decorators = [Column({ length: 30, default: 'active' })];
        _assignedStaffId_decorators = [Column({ name: 'assigned_staff_id', nullable: true, type: 'varchar' })];
        _priority_decorators = [Column({ length: 10, default: 'normal' })];
        _tags_decorators = [Column({ type: 'jsonb', nullable: true })];
        _lastMessageAt_decorators = [Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })];
        _lastMessagePreview_decorators = [Column({ name: 'last_message_preview', type: 'text', nullable: true })];
        _unreadCount_decorators = [Column({ name: 'unread_count', default: 0 })];
        _metadata_decorators = [Column({ type: 'jsonb', nullable: true })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
        _messages_decorators = [OneToMany(() => WhatsappMessage, (msg) => msg.conversation)];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _customerPhone_decorators, { kind: "field", name: "customerPhone", static: false, private: false, access: { has: obj => "customerPhone" in obj, get: obj => obj.customerPhone, set: (obj, value) => { obj.customerPhone = value; } }, metadata: _metadata }, _customerPhone_initializers, _customerPhone_extraInitializers);
        __esDecorate(null, null, _customerName_decorators, { kind: "field", name: "customerName", static: false, private: false, access: { has: obj => "customerName" in obj, get: obj => obj.customerName, set: (obj, value) => { obj.customerName = value; } }, metadata: _metadata }, _customerName_initializers, _customerName_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _assignedStaffId_decorators, { kind: "field", name: "assignedStaffId", static: false, private: false, access: { has: obj => "assignedStaffId" in obj, get: obj => obj.assignedStaffId, set: (obj, value) => { obj.assignedStaffId = value; } }, metadata: _metadata }, _assignedStaffId_initializers, _assignedStaffId_extraInitializers);
        __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
        __esDecorate(null, null, _tags_decorators, { kind: "field", name: "tags", static: false, private: false, access: { has: obj => "tags" in obj, get: obj => obj.tags, set: (obj, value) => { obj.tags = value; } }, metadata: _metadata }, _tags_initializers, _tags_extraInitializers);
        __esDecorate(null, null, _lastMessageAt_decorators, { kind: "field", name: "lastMessageAt", static: false, private: false, access: { has: obj => "lastMessageAt" in obj, get: obj => obj.lastMessageAt, set: (obj, value) => { obj.lastMessageAt = value; } }, metadata: _metadata }, _lastMessageAt_initializers, _lastMessageAt_extraInitializers);
        __esDecorate(null, null, _lastMessagePreview_decorators, { kind: "field", name: "lastMessagePreview", static: false, private: false, access: { has: obj => "lastMessagePreview" in obj, get: obj => obj.lastMessagePreview, set: (obj, value) => { obj.lastMessagePreview = value; } }, metadata: _metadata }, _lastMessagePreview_initializers, _lastMessagePreview_extraInitializers);
        __esDecorate(null, null, _unreadCount_decorators, { kind: "field", name: "unreadCount", static: false, private: false, access: { has: obj => "unreadCount" in obj, get: obj => obj.unreadCount, set: (obj, value) => { obj.unreadCount = value; } }, metadata: _metadata }, _unreadCount_initializers, _unreadCount_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _messages_decorators, { kind: "field", name: "messages", static: false, private: false, access: { has: obj => "messages" in obj, get: obj => obj.messages, set: (obj, value) => { obj.messages = value; } }, metadata: _metadata }, _messages_initializers, _messages_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappConversation = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappConversation = _classThis;
})();
export { WhatsappConversation };
//# sourceMappingURL=whatsapp-conversation.entity.js.map