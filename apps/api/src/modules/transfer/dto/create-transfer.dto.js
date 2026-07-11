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
import { IsString, IsNotEmpty, IsArray, IsUUID, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
let CreateTransferDto = (() => {
    var _a;
    let _fromBranchId_decorators;
    let _fromBranchId_initializers = [];
    let _fromBranchId_extraInitializers = [];
    let _toBranchId_decorators;
    let _toBranchId_initializers = [];
    let _toBranchId_extraInitializers = [];
    let _itemIds_decorators;
    let _itemIds_initializers = [];
    let _itemIds_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return _a = class CreateTransferDto {
            constructor() {
                this.fromBranchId = __runInitializers(this, _fromBranchId_initializers, void 0);
                this.toBranchId = (__runInitializers(this, _fromBranchId_extraInitializers), __runInitializers(this, _toBranchId_initializers, void 0));
                this.itemIds = (__runInitializers(this, _toBranchId_extraInitializers), __runInitializers(this, _itemIds_initializers, void 0));
                this.notes = (__runInitializers(this, _itemIds_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _fromBranchId_decorators = [ApiProperty(), IsUUID(), IsNotEmpty()];
            _toBranchId_decorators = [ApiProperty(), IsUUID(), IsNotEmpty()];
            _itemIds_decorators = [ApiProperty({ type: [String] }), IsArray(), ArrayMinSize(1), IsUUID('all', { each: true })];
            _notes_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            __esDecorate(null, null, _fromBranchId_decorators, { kind: "field", name: "fromBranchId", static: false, private: false, access: { has: obj => "fromBranchId" in obj, get: obj => obj.fromBranchId, set: (obj, value) => { obj.fromBranchId = value; } }, metadata: _metadata }, _fromBranchId_initializers, _fromBranchId_extraInitializers);
            __esDecorate(null, null, _toBranchId_decorators, { kind: "field", name: "toBranchId", static: false, private: false, access: { has: obj => "toBranchId" in obj, get: obj => obj.toBranchId, set: (obj, value) => { obj.toBranchId = value; } }, metadata: _metadata }, _toBranchId_initializers, _toBranchId_extraInitializers);
            __esDecorate(null, null, _itemIds_decorators, { kind: "field", name: "itemIds", static: false, private: false, access: { has: obj => "itemIds" in obj, get: obj => obj.itemIds, set: (obj, value) => { obj.itemIds = value; } }, metadata: _metadata }, _itemIds_initializers, _itemIds_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreateTransferDto };
//# sourceMappingURL=create-transfer.dto.js.map