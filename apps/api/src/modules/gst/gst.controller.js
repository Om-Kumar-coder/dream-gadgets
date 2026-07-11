var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Get, UseGuards, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
let GstController = (() => {
    let _classDecorators = [ApiTags('GST Reports'), ApiBearerAuth(), UseGuards(AuthGuard('jwt')), Controller('gst')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getGstr1_decorators;
    let _exportGstr1_decorators;
    var GstController = _classThis = class {
        constructor(gstService) {
            this.gstService = (__runInitializers(this, _instanceExtraInitializers), gstService);
        }
        async getGstr1(from, to, branchId) {
            const [data, summary] = await Promise.all([
                this.gstService.generateGstr1(from, to, branchId),
                this.gstService.generateSummary(from, to, branchId),
            ]);
            return { status: 'success', data, summary };
        }
        async exportGstr1(from, to, res, branchId) {
            const buffer = await this.gstService.generateExcel(from, to, branchId);
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="gstr1-${from}-to-${to}.xlsx"`,
                'Content-Length': buffer.length,
            });
            res.send(buffer);
        }
    };
    __setFunctionName(_classThis, "GstController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getGstr1_decorators = [Get('gstr1'), ApiOperation({ summary: 'Generate GSTR-1 data (B2B, B2CL, B2CS, CDNR)' }), ApiQuery({ name: 'from', required: true, example: '2025-01-01' }), ApiQuery({ name: 'to', required: true, example: '2025-01-31' }), ApiQuery({ name: 'branchId', required: false })];
        _exportGstr1_decorators = [Get('gstr1/export'), ApiOperation({ summary: 'Export GSTR-1 as Excel file' }), ApiQuery({ name: 'from', required: true, example: '2025-01-01' }), ApiQuery({ name: 'to', required: true, example: '2025-01-31' }), ApiQuery({ name: 'branchId', required: false })];
        __esDecorate(_classThis, null, _getGstr1_decorators, { kind: "method", name: "getGstr1", static: false, private: false, access: { has: obj => "getGstr1" in obj, get: obj => obj.getGstr1 }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportGstr1_decorators, { kind: "method", name: "exportGstr1", static: false, private: false, access: { has: obj => "exportGstr1" in obj, get: obj => obj.exportGstr1 }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GstController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GstController = _classThis;
})();
export { GstController };
//# sourceMappingURL=gst.controller.js.map