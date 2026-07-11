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
let WhatsappTemplate = (() => {
    let _classDecorators = [Entity('whatsapp_templates')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _language_decorators;
    let _language_initializers = [];
    let _language_extraInitializers = [];
    let _templateId_decorators;
    let _templateId_initializers = [];
    let _templateId_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _headerType_decorators;
    let _headerType_initializers = [];
    let _headerType_extraInitializers = [];
    let _headerValue_decorators;
    let _headerValue_initializers = [];
    let _headerValue_extraInitializers = [];
    let _body_decorators;
    let _body_initializers = [];
    let _body_extraInitializers = [];
    let _footer_decorators;
    let _footer_initializers = [];
    let _footer_extraInitializers = [];
    let _buttons_decorators;
    let _buttons_initializers = [];
    let _buttons_extraInitializers = [];
    let _variables_decorators;
    let _variables_initializers = [];
    let _variables_extraInitializers = [];
    let _rejectionReason_decorators;
    let _rejectionReason_initializers = [];
    let _rejectionReason_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var WhatsappTemplate = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.category = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _category_initializers, void 0));
            this.language = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _language_initializers, void 0));
            this.templateId = (__runInitializers(this, _language_extraInitializers), __runInitializers(this, _templateId_initializers, void 0));
            this.status = (__runInitializers(this, _templateId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.headerType = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _headerType_initializers, void 0));
            this.headerValue = (__runInitializers(this, _headerType_extraInitializers), __runInitializers(this, _headerValue_initializers, void 0));
            this.body = (__runInitializers(this, _headerValue_extraInitializers), __runInitializers(this, _body_initializers, void 0));
            this.footer = (__runInitializers(this, _body_extraInitializers), __runInitializers(this, _footer_initializers, void 0));
            this.buttons = (__runInitializers(this, _footer_extraInitializers), __runInitializers(this, _buttons_initializers, void 0));
            this.variables = (__runInitializers(this, _buttons_extraInitializers), __runInitializers(this, _variables_initializers, void 0));
            this.rejectionReason = (__runInitializers(this, _variables_extraInitializers), __runInitializers(this, _rejectionReason_initializers, void 0));
            this.createdBy = (__runInitializers(this, _rejectionReason_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.createdAt = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "WhatsappTemplate");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _name_decorators = [Column({ length: 200 })];
        _category_decorators = [Column({ length: 50, default: 'transactional' })];
        _language_decorators = [Column({ length: 10, default: 'en' })];
        _templateId_decorators = [Column({ name: 'template_id', type: 'varchar', length: 100, nullable: true })];
        _status_decorators = [Column({ length: 30, default: 'pending' })];
        _headerType_decorators = [Column({ name: 'header_type', type: 'varchar', length: 30, nullable: true })];
        _headerValue_decorators = [Column({ name: 'header_value', type: 'text', nullable: true })];
        _body_decorators = [Column({ type: 'text' })];
        _footer_decorators = [Column({ type: 'text', nullable: true })];
        _buttons_decorators = [Column({ type: 'jsonb', nullable: true })];
        _variables_decorators = [Column({ type: 'jsonb', nullable: true })];
        _rejectionReason_decorators = [Column({ name: 'rejection_reason', type: 'text', nullable: true })];
        _createdBy_decorators = [Column({ name: 'created_by', nullable: true, type: 'varchar' })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
        __esDecorate(null, null, _language_decorators, { kind: "field", name: "language", static: false, private: false, access: { has: obj => "language" in obj, get: obj => obj.language, set: (obj, value) => { obj.language = value; } }, metadata: _metadata }, _language_initializers, _language_extraInitializers);
        __esDecorate(null, null, _templateId_decorators, { kind: "field", name: "templateId", static: false, private: false, access: { has: obj => "templateId" in obj, get: obj => obj.templateId, set: (obj, value) => { obj.templateId = value; } }, metadata: _metadata }, _templateId_initializers, _templateId_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _headerType_decorators, { kind: "field", name: "headerType", static: false, private: false, access: { has: obj => "headerType" in obj, get: obj => obj.headerType, set: (obj, value) => { obj.headerType = value; } }, metadata: _metadata }, _headerType_initializers, _headerType_extraInitializers);
        __esDecorate(null, null, _headerValue_decorators, { kind: "field", name: "headerValue", static: false, private: false, access: { has: obj => "headerValue" in obj, get: obj => obj.headerValue, set: (obj, value) => { obj.headerValue = value; } }, metadata: _metadata }, _headerValue_initializers, _headerValue_extraInitializers);
        __esDecorate(null, null, _body_decorators, { kind: "field", name: "body", static: false, private: false, access: { has: obj => "body" in obj, get: obj => obj.body, set: (obj, value) => { obj.body = value; } }, metadata: _metadata }, _body_initializers, _body_extraInitializers);
        __esDecorate(null, null, _footer_decorators, { kind: "field", name: "footer", static: false, private: false, access: { has: obj => "footer" in obj, get: obj => obj.footer, set: (obj, value) => { obj.footer = value; } }, metadata: _metadata }, _footer_initializers, _footer_extraInitializers);
        __esDecorate(null, null, _buttons_decorators, { kind: "field", name: "buttons", static: false, private: false, access: { has: obj => "buttons" in obj, get: obj => obj.buttons, set: (obj, value) => { obj.buttons = value; } }, metadata: _metadata }, _buttons_initializers, _buttons_extraInitializers);
        __esDecorate(null, null, _variables_decorators, { kind: "field", name: "variables", static: false, private: false, access: { has: obj => "variables" in obj, get: obj => obj.variables, set: (obj, value) => { obj.variables = value; } }, metadata: _metadata }, _variables_initializers, _variables_extraInitializers);
        __esDecorate(null, null, _rejectionReason_decorators, { kind: "field", name: "rejectionReason", static: false, private: false, access: { has: obj => "rejectionReason" in obj, get: obj => obj.rejectionReason, set: (obj, value) => { obj.rejectionReason = value; } }, metadata: _metadata }, _rejectionReason_initializers, _rejectionReason_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappTemplate = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappTemplate = _classThis;
})();
export { WhatsappTemplate };
//# sourceMappingURL=whatsapp-template.entity.js.map