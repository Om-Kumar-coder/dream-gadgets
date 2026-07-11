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
let ReportController = (() => {
    let _classDecorators = [Controller('reports'), UseGuards(AuthGuard('jwt'))];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getDashboard_decorators;
    let _getWeeklySales_decorators;
    let _getStockByCondition_decorators;
    let _downloadExcel_decorators;
    let _downloadPdf_decorators;
    let _enqueueReport_decorators;
    var ReportController = _classThis = class {
        constructor(reportService) {
            this.reportService = (__runInitializers(this, _instanceExtraInitializers), reportService);
        }
        // GET /reports/dashboard
        async getDashboard(branchId) {
            const kpis = await this.reportService.getDashboardKpis(branchId);
            return { status: 'success', data: kpis };
        }
        // GET /reports/weekly-sales — last 7 days sales per day for chart
        async getWeeklySales(branchId) {
            const data = await this.reportService.getWeeklySalesChart(branchId);
            return { status: 'success', data };
        }
        // GET /reports/stock-by-condition — inventory count grouped by condition
        async getStockByCondition(branchId) {
            const data = await this.reportService.getStockByConditionChart(branchId);
            return { status: 'success', data };
        }
        // GET /reports/:type/excel
        async downloadExcel(type, branchId, startDate, endDate, res) {
            const filters = {
                branchId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            };
            const buffer = await this.reportService.generateExcel(type, filters);
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${type}-report.xlsx"`,
            });
            res.send(buffer);
        }
        // GET /reports/:type/pdf
        async downloadPdf(type, branchId, startDate, endDate, res) {
            const filters = {
                branchId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            };
            const buffer = await this.reportService.generatePdf(type, filters);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${type}-report.pdf"`,
            });
            res.send(buffer);
        }
        // GET /reports/:type/async
        async enqueueReport(type, branchId, startDate, endDate, format = 'excel') {
            const filters = {
                branchId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            };
            const result = await this.reportService.enqueueReport(type, filters, format);
            return { status: 'success', data: result };
        }
    };
    __setFunctionName(_classThis, "ReportController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getDashboard_decorators = [Get('dashboard')];
        _getWeeklySales_decorators = [Get('weekly-sales')];
        _getStockByCondition_decorators = [Get('stock-by-condition')];
        _downloadExcel_decorators = [Get(':type/excel')];
        _downloadPdf_decorators = [Get(':type/pdf')];
        _enqueueReport_decorators = [Get(':type/async')];
        __esDecorate(_classThis, null, _getDashboard_decorators, { kind: "method", name: "getDashboard", static: false, private: false, access: { has: obj => "getDashboard" in obj, get: obj => obj.getDashboard }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWeeklySales_decorators, { kind: "method", name: "getWeeklySales", static: false, private: false, access: { has: obj => "getWeeklySales" in obj, get: obj => obj.getWeeklySales }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStockByCondition_decorators, { kind: "method", name: "getStockByCondition", static: false, private: false, access: { has: obj => "getStockByCondition" in obj, get: obj => obj.getStockByCondition }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _downloadExcel_decorators, { kind: "method", name: "downloadExcel", static: false, private: false, access: { has: obj => "downloadExcel" in obj, get: obj => obj.downloadExcel }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _downloadPdf_decorators, { kind: "method", name: "downloadPdf", static: false, private: false, access: { has: obj => "downloadPdf" in obj, get: obj => obj.downloadPdf }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _enqueueReport_decorators, { kind: "method", name: "enqueueReport", static: false, private: false, access: { has: obj => "enqueueReport" in obj, get: obj => obj.enqueueReport }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReportController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReportController = _classThis;
})();
export { ReportController };
//# sourceMappingURL=report.controller.js.map