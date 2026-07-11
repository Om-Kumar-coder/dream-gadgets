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
import { WhatsappConversation } from './whatsapp-conversation.entity';
let WhatsappMessage = (() => {
    let _classDecorators = [Entity('whatsapp_messages')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _conversationId_decorators;
    let _conversationId_initializers = [];
    let _conversationId_extraInitializers = [];
    let _conversation_decorators;
    let _conversation_initializers = [];
    let _conversation_extraInitializers = [];
    let _direction_decorators;
    let _direction_initializers = [];
    let _direction_extraInitializers = [];
    let _fromNumber_decorators;
    let _fromNumber_initializers = [];
    let _fromNumber_extraInitializers = [];
    let _toNumber_decorators;
    let _toNumber_initializers = [];
    let _toNumber_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _contentType_decorators;
    let _contentType_initializers = [];
    let _contentType_extraInitializers = [];
    let _mediaUrl_decorators;
    let _mediaUrl_initializers = [];
    let _mediaUrl_extraInitializers = [];
    let _mediaMimeType_decorators;
    let _mediaMimeType_initializers = [];
    let _mediaMimeType_extraInitializers = [];
    let _mediaFilename_decorators;
    let _mediaFilename_initializers = [];
    let _mediaFilename_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _providerMessageId_decorators;
    let _providerMessageId_initializers = [];
    let _providerMessageId_extraInitializers = [];
    let _errorMessage_decorators;
    let _errorMessage_initializers = [];
    let _errorMessage_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    var WhatsappMessage = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.conversationId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _conversationId_initializers, void 0));
            this.conversation = (__runInitializers(this, _conversationId_extraInitializers), __runInitializers(this, _conversation_initializers, void 0));
            this.direction = (__runInitializers(this, _conversation_extraInitializers), __runInitializers(this, _direction_initializers, void 0));
            this.fromNumber = (__runInitializers(this, _direction_extraInitializers), __runInitializers(this, _fromNumber_initializers, void 0));
            this.toNumber = (__runInitializers(this, _fromNumber_extraInitializers), __runInitializers(this, _toNumber_initializers, void 0));
            this.content = (__runInitializers(this, _toNumber_extraInitializers), __runInitializers(this, _content_initializers, void 0));
            this.contentType = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _contentType_initializers, void 0));
            this.mediaUrl = (__runInitializers(this, _contentType_extraInitializers), __runInitializers(this, _mediaUrl_initializers, void 0));
            this.mediaMimeType = (__runInitializers(this, _mediaUrl_extraInitializers), __runInitializers(this, _mediaMimeType_initializers, void 0));
            this.mediaFilename = (__runInitializers(this, _mediaMimeType_extraInitializers), __runInitializers(this, _mediaFilename_initializers, void 0));
            this.status = (__runInitializers(this, _mediaFilename_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.providerMessageId = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _providerMessageId_initializers, void 0));
            this.errorMessage = (__runInitializers(this, _providerMessageId_extraInitializers), __runInitializers(this, _errorMessage_initializers, void 0));
            this.metadata = (__runInitializers(this, _errorMessage_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            this.createdAt = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "WhatsappMessage");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _conversationId_decorators = [Column({ name: 'conversation_id', type: 'varchar' })];
        _conversation_decorators = [ManyToOne(() => WhatsappConversation, (conv) => conv.messages, {
                onDelete: 'CASCADE',
            }), JoinColumn({ name: 'conversation_id' })];
        _direction_decorators = [Column({ length: 10 })];
        _fromNumber_decorators = [Column({ name: 'from_number', length: 20 })];
        _toNumber_decorators = [Column({ name: 'to_number', length: 20 })];
        _content_decorators = [Column({ type: 'text', nullable: true })];
        _contentType_decorators = [Column({ name: 'content_type', length: 30, default: 'text' })];
        _mediaUrl_decorators = [Column({ name: 'media_url', type: 'text', nullable: true })];
        _mediaMimeType_decorators = [Column({ name: 'media_mime_type', type: 'varchar', length: 100, nullable: true })];
        _mediaFilename_decorators = [Column({ name: 'media_filename', type: 'varchar', length: 500, nullable: true })];
        _status_decorators = [Column({ length: 20, default: 'sent' })];
        _providerMessageId_decorators = [Column({ name: 'provider_message_id', type: 'varchar', length: 255, nullable: true })];
        _errorMessage_decorators = [Column({ name: 'error_message', type: 'text', nullable: true })];
        _metadata_decorators = [Column({ type: 'jsonb', nullable: true })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _conversationId_decorators, { kind: "field", name: "conversationId", static: false, private: false, access: { has: obj => "conversationId" in obj, get: obj => obj.conversationId, set: (obj, value) => { obj.conversationId = value; } }, metadata: _metadata }, _conversationId_initializers, _conversationId_extraInitializers);
        __esDecorate(null, null, _conversation_decorators, { kind: "field", name: "conversation", static: false, private: false, access: { has: obj => "conversation" in obj, get: obj => obj.conversation, set: (obj, value) => { obj.conversation = value; } }, metadata: _metadata }, _conversation_initializers, _conversation_extraInitializers);
        __esDecorate(null, null, _direction_decorators, { kind: "field", name: "direction", static: false, private: false, access: { has: obj => "direction" in obj, get: obj => obj.direction, set: (obj, value) => { obj.direction = value; } }, metadata: _metadata }, _direction_initializers, _direction_extraInitializers);
        __esDecorate(null, null, _fromNumber_decorators, { kind: "field", name: "fromNumber", static: false, private: false, access: { has: obj => "fromNumber" in obj, get: obj => obj.fromNumber, set: (obj, value) => { obj.fromNumber = value; } }, metadata: _metadata }, _fromNumber_initializers, _fromNumber_extraInitializers);
        __esDecorate(null, null, _toNumber_decorators, { kind: "field", name: "toNumber", static: false, private: false, access: { has: obj => "toNumber" in obj, get: obj => obj.toNumber, set: (obj, value) => { obj.toNumber = value; } }, metadata: _metadata }, _toNumber_initializers, _toNumber_extraInitializers);
        __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
        __esDecorate(null, null, _contentType_decorators, { kind: "field", name: "contentType", static: false, private: false, access: { has: obj => "contentType" in obj, get: obj => obj.contentType, set: (obj, value) => { obj.contentType = value; } }, metadata: _metadata }, _contentType_initializers, _contentType_extraInitializers);
        __esDecorate(null, null, _mediaUrl_decorators, { kind: "field", name: "mediaUrl", static: false, private: false, access: { has: obj => "mediaUrl" in obj, get: obj => obj.mediaUrl, set: (obj, value) => { obj.mediaUrl = value; } }, metadata: _metadata }, _mediaUrl_initializers, _mediaUrl_extraInitializers);
        __esDecorate(null, null, _mediaMimeType_decorators, { kind: "field", name: "mediaMimeType", static: false, private: false, access: { has: obj => "mediaMimeType" in obj, get: obj => obj.mediaMimeType, set: (obj, value) => { obj.mediaMimeType = value; } }, metadata: _metadata }, _mediaMimeType_initializers, _mediaMimeType_extraInitializers);
        __esDecorate(null, null, _mediaFilename_decorators, { kind: "field", name: "mediaFilename", static: false, private: false, access: { has: obj => "mediaFilename" in obj, get: obj => obj.mediaFilename, set: (obj, value) => { obj.mediaFilename = value; } }, metadata: _metadata }, _mediaFilename_initializers, _mediaFilename_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _providerMessageId_decorators, { kind: "field", name: "providerMessageId", static: false, private: false, access: { has: obj => "providerMessageId" in obj, get: obj => obj.providerMessageId, set: (obj, value) => { obj.providerMessageId = value; } }, metadata: _metadata }, _providerMessageId_initializers, _providerMessageId_extraInitializers);
        __esDecorate(null, null, _errorMessage_decorators, { kind: "field", name: "errorMessage", static: false, private: false, access: { has: obj => "errorMessage" in obj, get: obj => obj.errorMessage, set: (obj, value) => { obj.errorMessage = value; } }, metadata: _metadata }, _errorMessage_initializers, _errorMessage_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappMessage = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappMessage = _classThis;
})();
export { WhatsappMessage };
//# sourceMappingURL=whatsapp-message.entity.js.map