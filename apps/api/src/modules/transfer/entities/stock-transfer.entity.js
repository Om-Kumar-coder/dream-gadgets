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
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, } from 'typeorm';
import { Branch, User } from '../../auth/entities/user.entity';
import { StockTransferItem } from './stock-transfer-item.entity';
let StockTransfer = (() => {
    let _classDecorators = [Entity('stock_transfers')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _transferNumber_decorators;
    let _transferNumber_initializers = [];
    let _transferNumber_extraInitializers = [];
    let _fromBranch_decorators;
    let _fromBranch_initializers = [];
    let _fromBranch_extraInitializers = [];
    let _fromBranchId_decorators;
    let _fromBranchId_initializers = [];
    let _fromBranchId_extraInitializers = [];
    let _toBranch_decorators;
    let _toBranch_initializers = [];
    let _toBranch_extraInitializers = [];
    let _toBranchId_decorators;
    let _toBranchId_initializers = [];
    let _toBranchId_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _initiatedBy_decorators;
    let _initiatedBy_initializers = [];
    let _initiatedBy_extraInitializers = [];
    let _initiatedById_decorators;
    let _initiatedById_initializers = [];
    let _initiatedById_extraInitializers = [];
    let _receivedBy_decorators;
    let _receivedBy_initializers = [];
    let _receivedBy_extraInitializers = [];
    let _receivedById_decorators;
    let _receivedById_initializers = [];
    let _receivedById_extraInitializers = [];
    let _initiatedAt_decorators;
    let _initiatedAt_initializers = [];
    let _initiatedAt_extraInitializers = [];
    let _receivedAt_decorators;
    let _receivedAt_initializers = [];
    let _receivedAt_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    var StockTransfer = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.transferNumber = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _transferNumber_initializers, void 0));
            this.fromBranch = (__runInitializers(this, _transferNumber_extraInitializers), __runInitializers(this, _fromBranch_initializers, void 0));
            this.fromBranchId = (__runInitializers(this, _fromBranch_extraInitializers), __runInitializers(this, _fromBranchId_initializers, void 0));
            this.toBranch = (__runInitializers(this, _fromBranchId_extraInitializers), __runInitializers(this, _toBranch_initializers, void 0));
            this.toBranchId = (__runInitializers(this, _toBranch_extraInitializers), __runInitializers(this, _toBranchId_initializers, void 0));
            this.status = (__runInitializers(this, _toBranchId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.notes = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
            // DB column is 'initiated_by' not 'initiated_by_id'
            this.initiatedBy = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _initiatedBy_initializers, void 0));
            this.initiatedById = (__runInitializers(this, _initiatedBy_extraInitializers), __runInitializers(this, _initiatedById_initializers, void 0));
            // DB column is 'received_by' not 'received_by_id'
            this.receivedBy = (__runInitializers(this, _initiatedById_extraInitializers), __runInitializers(this, _receivedBy_initializers, void 0));
            this.receivedById = (__runInitializers(this, _receivedBy_extraInitializers), __runInitializers(this, _receivedById_initializers, void 0));
            this.initiatedAt = (__runInitializers(this, _receivedById_extraInitializers), __runInitializers(this, _initiatedAt_initializers, void 0));
            this.receivedAt = (__runInitializers(this, _initiatedAt_extraInitializers), __runInitializers(this, _receivedAt_initializers, void 0));
            // rejection_reason not in DB — virtual only
            this.rejectionReason = __runInitializers(this, _receivedAt_extraInitializers);
            this.items = __runInitializers(this, _items_initializers, void 0);
            this.createdAt = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "StockTransfer");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [PrimaryGeneratedColumn('uuid')];
        _transferNumber_decorators = [Column({ name: 'transfer_number', unique: true })];
        _fromBranch_decorators = [ManyToOne(() => Branch, { eager: false, nullable: false }), JoinColumn({ name: 'from_branch_id' })];
        _fromBranchId_decorators = [Column({ name: 'from_branch_id' })];
        _toBranch_decorators = [ManyToOne(() => Branch, { eager: false, nullable: false }), JoinColumn({ name: 'to_branch_id' })];
        _toBranchId_decorators = [Column({ name: 'to_branch_id' })];
        _status_decorators = [Column({ default: 'initiated' })];
        _notes_decorators = [Column({ nullable: true, type: 'text' })];
        _initiatedBy_decorators = [ManyToOne(() => User, { eager: false, nullable: true }), JoinColumn({ name: 'initiated_by' })];
        _initiatedById_decorators = [Column({ name: 'initiated_by', nullable: true, type: 'varchar' })];
        _receivedBy_decorators = [ManyToOne(() => User, { eager: false, nullable: true }), JoinColumn({ name: 'received_by' })];
        _receivedById_decorators = [Column({ name: 'received_by', nullable: true, type: 'varchar' })];
        _initiatedAt_decorators = [Column({ name: 'initiated_at', type: 'timestamptz', default: () => 'NOW()' })];
        _receivedAt_decorators = [Column({ name: 'received_at', nullable: true, type: 'timestamptz' })];
        _items_decorators = [OneToMany(() => StockTransferItem, (i) => i.transfer, { cascade: true })];
        _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _transferNumber_decorators, { kind: "field", name: "transferNumber", static: false, private: false, access: { has: obj => "transferNumber" in obj, get: obj => obj.transferNumber, set: (obj, value) => { obj.transferNumber = value; } }, metadata: _metadata }, _transferNumber_initializers, _transferNumber_extraInitializers);
        __esDecorate(null, null, _fromBranch_decorators, { kind: "field", name: "fromBranch", static: false, private: false, access: { has: obj => "fromBranch" in obj, get: obj => obj.fromBranch, set: (obj, value) => { obj.fromBranch = value; } }, metadata: _metadata }, _fromBranch_initializers, _fromBranch_extraInitializers);
        __esDecorate(null, null, _fromBranchId_decorators, { kind: "field", name: "fromBranchId", static: false, private: false, access: { has: obj => "fromBranchId" in obj, get: obj => obj.fromBranchId, set: (obj, value) => { obj.fromBranchId = value; } }, metadata: _metadata }, _fromBranchId_initializers, _fromBranchId_extraInitializers);
        __esDecorate(null, null, _toBranch_decorators, { kind: "field", name: "toBranch", static: false, private: false, access: { has: obj => "toBranch" in obj, get: obj => obj.toBranch, set: (obj, value) => { obj.toBranch = value; } }, metadata: _metadata }, _toBranch_initializers, _toBranch_extraInitializers);
        __esDecorate(null, null, _toBranchId_decorators, { kind: "field", name: "toBranchId", static: false, private: false, access: { has: obj => "toBranchId" in obj, get: obj => obj.toBranchId, set: (obj, value) => { obj.toBranchId = value; } }, metadata: _metadata }, _toBranchId_initializers, _toBranchId_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, null, _initiatedBy_decorators, { kind: "field", name: "initiatedBy", static: false, private: false, access: { has: obj => "initiatedBy" in obj, get: obj => obj.initiatedBy, set: (obj, value) => { obj.initiatedBy = value; } }, metadata: _metadata }, _initiatedBy_initializers, _initiatedBy_extraInitializers);
        __esDecorate(null, null, _initiatedById_decorators, { kind: "field", name: "initiatedById", static: false, private: false, access: { has: obj => "initiatedById" in obj, get: obj => obj.initiatedById, set: (obj, value) => { obj.initiatedById = value; } }, metadata: _metadata }, _initiatedById_initializers, _initiatedById_extraInitializers);
        __esDecorate(null, null, _receivedBy_decorators, { kind: "field", name: "receivedBy", static: false, private: false, access: { has: obj => "receivedBy" in obj, get: obj => obj.receivedBy, set: (obj, value) => { obj.receivedBy = value; } }, metadata: _metadata }, _receivedBy_initializers, _receivedBy_extraInitializers);
        __esDecorate(null, null, _receivedById_decorators, { kind: "field", name: "receivedById", static: false, private: false, access: { has: obj => "receivedById" in obj, get: obj => obj.receivedById, set: (obj, value) => { obj.receivedById = value; } }, metadata: _metadata }, _receivedById_initializers, _receivedById_extraInitializers);
        __esDecorate(null, null, _initiatedAt_decorators, { kind: "field", name: "initiatedAt", static: false, private: false, access: { has: obj => "initiatedAt" in obj, get: obj => obj.initiatedAt, set: (obj, value) => { obj.initiatedAt = value; } }, metadata: _metadata }, _initiatedAt_initializers, _initiatedAt_extraInitializers);
        __esDecorate(null, null, _receivedAt_decorators, { kind: "field", name: "receivedAt", static: false, private: false, access: { has: obj => "receivedAt" in obj, get: obj => obj.receivedAt, set: (obj, value) => { obj.receivedAt = value; } }, metadata: _metadata }, _receivedAt_initializers, _receivedAt_extraInitializers);
        __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StockTransfer = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StockTransfer = _classThis;
})();
export { StockTransfer };
//# sourceMappingURL=stock-transfer.entity.js.map