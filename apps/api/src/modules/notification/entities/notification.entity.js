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
let Notification = (() => {
    let _classDecorators = [Entity('notifications')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _user_decorators;
    let _user_initializers = [];
    let _user_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _channel_decorators;
    let _channel_initializers = [];
    let _channel_extraInitializers = [];
    let _subject_decorators;
    let _subject_initializers = [];
    let _subject_extraInitializers = [];
    let _body_decorators;
    let _body_initializers = [];
    let _body_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _sentAt_decorators;
    let _sentAt_initializers = [];
    let _sentAt_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    let _isRead_decorators;
    let _isRead_initializers = [];
    let _isRead_extraInitializers = [];
    let _readAt_decorators;
    let _readAt_initializers = [];
    let _readAt_extraInitializers = [];
    let _attempts_decorators;
    let _attempts_initializers = [];
    let _attempts_extraInitializers = [];
    let _providerMessageId_decorators;
    let _providerMessageId_initializers = [];
    let _providerMessageId_extraInitializers = [];
    let _errorMessage_decorators;
    let _errorMessage_initializers = [];
    let _errorMessage_extraInitializers = [];
    let _target_decorators;
    let _target_initializers = [];
    let _target_extraInitializers = [];
    let _lastAttemptAt_decorators;
    let _lastAttemptAt_initializers = [];
    let _lastAttemptAt_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    var Notification = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.userId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.user = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            this.clientId = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
            this.type = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            this.channel = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _channel_initializers, void 0));
            this.subject = (__runInitializers(this, _channel_extraInitializers), __runInitializers(this, _subject_initializers, void 0));
            this.body = (__runInitializers(this, _subject_extraInitializers), __runInitializers(this, _body_initializers, void 0));
            this.status = (__runInitializers(this, _body_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.sentAt = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _sentAt_initializers, void 0));
            this.metadata = (__runInitializers(this, _sentAt_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            this.isRead = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _isRead_initializers, void 0));
            this.readAt = (__runInitializers(this, _isRead_extraInitializers), __runInitializers(this, _readAt_initializers, void 0));
            this.attempts = (__runInitializers(this, _readAt_extraInitializers), __runInitializers(this, _attempts_initializers, void 0));
            this.providerMessageId = (__runInitializers(this, _attempts_extraInitializers), __runInitializers(this, _providerMessageId_initializers, void 0));
            this.errorMessage = (__runInitializers(this, _providerMessageId_extraInitializers), __runInitializers(this, _errorMessage_initializers, void 0));
            this.target = (__runInitializers(this, _errorMessage_extraInitializers), __runInitializers(this, _target_initializers, void 0));
            this.lastAttemptAt = (__runInitializers(this, _target_extraInitializers), __runInitializers(this, _lastAttemptAt_initializers, void 0));
            this.createdAt = (__runInitializers(this, _lastAttemptAt_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Notification");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _userId_decorators = [Column({ name: 'user_id', nullable: true, type: 'varchar' })];
        _user_decorators = [ManyToOne(() => User, { eager: false, nullable: true }), JoinColumn({ name: 'user_id' })];
        _clientId_decorators = [Column({ name: 'client_id', nullable: true, type: 'varchar' })];
        _type_decorators = [Column({ length: 50 })];
        _channel_decorators = [Column({ length: 20 })];
        _subject_decorators = [Column({ nullable: true, type: 'varchar', length: 500 })];
        _body_decorators = [Column({ nullable: true, type: 'text' })];
        _status_decorators = [Column({ default: 'pending' })];
        _sentAt_decorators = [Column({ name: 'sent_at', nullable: true, type: 'timestamptz' })];
        _metadata_decorators = [Column({ nullable: true, type: 'jsonb' })];
        _isRead_decorators = [Column({ name: 'is_read', default: false })];
        _readAt_decorators = [Column({ name: 'read_at', nullable: true, type: 'timestamptz' })];
        _attempts_decorators = [Column({ default: 0 })];
        _providerMessageId_decorators = [Column({ name: 'provider_message_id', nullable: true, type: 'varchar', length: 255 })];
        _errorMessage_decorators = [Column({ name: 'error_message', nullable: true, type: 'text' })];
        _target_decorators = [Column({ name: 'target', nullable: true, type: 'varchar', length: 255 })];
        _lastAttemptAt_decorators = [Column({ name: 'last_attempt_at', nullable: true, type: 'timestamptz' })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: obj => "user" in obj, get: obj => obj.user, set: (obj, value) => { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _channel_decorators, { kind: "field", name: "channel", static: false, private: false, access: { has: obj => "channel" in obj, get: obj => obj.channel, set: (obj, value) => { obj.channel = value; } }, metadata: _metadata }, _channel_initializers, _channel_extraInitializers);
        __esDecorate(null, null, _subject_decorators, { kind: "field", name: "subject", static: false, private: false, access: { has: obj => "subject" in obj, get: obj => obj.subject, set: (obj, value) => { obj.subject = value; } }, metadata: _metadata }, _subject_initializers, _subject_extraInitializers);
        __esDecorate(null, null, _body_decorators, { kind: "field", name: "body", static: false, private: false, access: { has: obj => "body" in obj, get: obj => obj.body, set: (obj, value) => { obj.body = value; } }, metadata: _metadata }, _body_initializers, _body_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _sentAt_decorators, { kind: "field", name: "sentAt", static: false, private: false, access: { has: obj => "sentAt" in obj, get: obj => obj.sentAt, set: (obj, value) => { obj.sentAt = value; } }, metadata: _metadata }, _sentAt_initializers, _sentAt_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _isRead_decorators, { kind: "field", name: "isRead", static: false, private: false, access: { has: obj => "isRead" in obj, get: obj => obj.isRead, set: (obj, value) => { obj.isRead = value; } }, metadata: _metadata }, _isRead_initializers, _isRead_extraInitializers);
        __esDecorate(null, null, _readAt_decorators, { kind: "field", name: "readAt", static: false, private: false, access: { has: obj => "readAt" in obj, get: obj => obj.readAt, set: (obj, value) => { obj.readAt = value; } }, metadata: _metadata }, _readAt_initializers, _readAt_extraInitializers);
        __esDecorate(null, null, _attempts_decorators, { kind: "field", name: "attempts", static: false, private: false, access: { has: obj => "attempts" in obj, get: obj => obj.attempts, set: (obj, value) => { obj.attempts = value; } }, metadata: _metadata }, _attempts_initializers, _attempts_extraInitializers);
        __esDecorate(null, null, _providerMessageId_decorators, { kind: "field", name: "providerMessageId", static: false, private: false, access: { has: obj => "providerMessageId" in obj, get: obj => obj.providerMessageId, set: (obj, value) => { obj.providerMessageId = value; } }, metadata: _metadata }, _providerMessageId_initializers, _providerMessageId_extraInitializers);
        __esDecorate(null, null, _errorMessage_decorators, { kind: "field", name: "errorMessage", static: false, private: false, access: { has: obj => "errorMessage" in obj, get: obj => obj.errorMessage, set: (obj, value) => { obj.errorMessage = value; } }, metadata: _metadata }, _errorMessage_initializers, _errorMessage_extraInitializers);
        __esDecorate(null, null, _target_decorators, { kind: "field", name: "target", static: false, private: false, access: { has: obj => "target" in obj, get: obj => obj.target, set: (obj, value) => { obj.target = value; } }, metadata: _metadata }, _target_initializers, _target_extraInitializers);
        __esDecorate(null, null, _lastAttemptAt_decorators, { kind: "field", name: "lastAttemptAt", static: false, private: false, access: { has: obj => "lastAttemptAt" in obj, get: obj => obj.lastAttemptAt, set: (obj, value) => { obj.lastAttemptAt = value; } }, metadata: _metadata }, _lastAttemptAt_initializers, _lastAttemptAt_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Notification = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Notification = _classThis;
})();
export { Notification };
//# sourceMappingURL=notification.entity.js.map