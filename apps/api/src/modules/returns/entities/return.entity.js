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
let Return = (() => {
    let _classDecorators = [Entity('returns')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _returnNumber_decorators;
    let _returnNumber_initializers = [];
    let _returnNumber_extraInitializers = [];
    let _returnType_decorators;
    let _returnType_initializers = [];
    let _returnType_extraInitializers = [];
    let _originalId_decorators;
    let _originalId_initializers = [];
    let _originalId_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _refundMethod_decorators;
    let _refundMethod_initializers = [];
    let _refundMethod_extraInitializers = [];
    let _refundAmount_decorators;
    let _refundAmount_initializers = [];
    let _refundAmount_extraInitializers = [];
    let _refundStatus_decorators;
    let _refundStatus_initializers = [];
    let _refundStatus_extraInitializers = [];
    let _approvedBy_decorators;
    let _approvedBy_initializers = [];
    let _approvedBy_extraInitializers = [];
    let _approvedById_decorators;
    let _approvedById_initializers = [];
    let _approvedById_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _createdById_decorators;
    let _createdById_initializers = [];
    let _createdById_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    var Return = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.returnNumber = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _returnNumber_initializers, void 0));
            this.returnType = (__runInitializers(this, _returnNumber_extraInitializers), __runInitializers(this, _returnType_initializers, void 0));
            this.originalId = (__runInitializers(this, _returnType_extraInitializers), __runInitializers(this, _originalId_initializers, void 0));
            this.clientId = (__runInitializers(this, _originalId_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
            this.reason = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
            this.refundMethod = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _refundMethod_initializers, void 0));
            this.refundAmount = (__runInitializers(this, _refundMethod_extraInitializers), __runInitializers(this, _refundAmount_initializers, void 0));
            this.refundStatus = (__runInitializers(this, _refundAmount_extraInitializers), __runInitializers(this, _refundStatus_initializers, void 0));
            // DB column is 'approved_by' not 'approved_by_id'
            this.approvedBy = (__runInitializers(this, _refundStatus_extraInitializers), __runInitializers(this, _approvedBy_initializers, void 0));
            this.approvedById = (__runInitializers(this, _approvedBy_extraInitializers), __runInitializers(this, _approvedById_initializers, void 0));
            // DB column is 'created_by' not 'created_by_id'
            this.createdBy = (__runInitializers(this, _approvedById_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.createdById = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _createdById_initializers, void 0));
            this.createdAt = (__runInitializers(this, _createdById_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Return");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _returnNumber_decorators = [Column({ name: 'return_number', unique: true })];
        _returnType_decorators = [Column({ name: 'return_type', length: 20 })];
        _originalId_decorators = [Column({ name: 'original_id' })];
        _clientId_decorators = [Column({ name: 'client_id', nullable: true, type: 'varchar' })];
        _reason_decorators = [Column({ type: 'text' })];
        _refundMethod_decorators = [Column({ name: 'refund_method', length: 50, nullable: true, type: 'varchar' })];
        _refundAmount_decorators = [Column('decimal', { name: 'refund_amount', precision: 12, scale: 2, nullable: true })];
        _refundStatus_decorators = [Column({ name: 'refund_status', default: 'pending' })];
        _approvedBy_decorators = [ManyToOne(() => User, { eager: false, nullable: true }), JoinColumn({ name: 'approved_by' })];
        _approvedById_decorators = [Column({ name: 'approved_by', nullable: true, type: 'varchar' })];
        _createdBy_decorators = [ManyToOne(() => User, { eager: false, nullable: true }), JoinColumn({ name: 'created_by' })];
        _createdById_decorators = [Column({ name: 'created_by', nullable: true, type: 'varchar' })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _returnNumber_decorators, { kind: "field", name: "returnNumber", static: false, private: false, access: { has: obj => "returnNumber" in obj, get: obj => obj.returnNumber, set: (obj, value) => { obj.returnNumber = value; } }, metadata: _metadata }, _returnNumber_initializers, _returnNumber_extraInitializers);
        __esDecorate(null, null, _returnType_decorators, { kind: "field", name: "returnType", static: false, private: false, access: { has: obj => "returnType" in obj, get: obj => obj.returnType, set: (obj, value) => { obj.returnType = value; } }, metadata: _metadata }, _returnType_initializers, _returnType_extraInitializers);
        __esDecorate(null, null, _originalId_decorators, { kind: "field", name: "originalId", static: false, private: false, access: { has: obj => "originalId" in obj, get: obj => obj.originalId, set: (obj, value) => { obj.originalId = value; } }, metadata: _metadata }, _originalId_initializers, _originalId_extraInitializers);
        __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
        __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
        __esDecorate(null, null, _refundMethod_decorators, { kind: "field", name: "refundMethod", static: false, private: false, access: { has: obj => "refundMethod" in obj, get: obj => obj.refundMethod, set: (obj, value) => { obj.refundMethod = value; } }, metadata: _metadata }, _refundMethod_initializers, _refundMethod_extraInitializers);
        __esDecorate(null, null, _refundAmount_decorators, { kind: "field", name: "refundAmount", static: false, private: false, access: { has: obj => "refundAmount" in obj, get: obj => obj.refundAmount, set: (obj, value) => { obj.refundAmount = value; } }, metadata: _metadata }, _refundAmount_initializers, _refundAmount_extraInitializers);
        __esDecorate(null, null, _refundStatus_decorators, { kind: "field", name: "refundStatus", static: false, private: false, access: { has: obj => "refundStatus" in obj, get: obj => obj.refundStatus, set: (obj, value) => { obj.refundStatus = value; } }, metadata: _metadata }, _refundStatus_initializers, _refundStatus_extraInitializers);
        __esDecorate(null, null, _approvedBy_decorators, { kind: "field", name: "approvedBy", static: false, private: false, access: { has: obj => "approvedBy" in obj, get: obj => obj.approvedBy, set: (obj, value) => { obj.approvedBy = value; } }, metadata: _metadata }, _approvedBy_initializers, _approvedBy_extraInitializers);
        __esDecorate(null, null, _approvedById_decorators, { kind: "field", name: "approvedById", static: false, private: false, access: { has: obj => "approvedById" in obj, get: obj => obj.approvedById, set: (obj, value) => { obj.approvedById = value; } }, metadata: _metadata }, _approvedById_initializers, _approvedById_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _createdById_decorators, { kind: "field", name: "createdById", static: false, private: false, access: { has: obj => "createdById" in obj, get: obj => obj.createdById, set: (obj, value) => { obj.createdById = value; } }, metadata: _metadata }, _createdById_initializers, _createdById_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Return = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Return = _classThis;
})();
export { Return };
//# sourceMappingURL=return.entity.js.map