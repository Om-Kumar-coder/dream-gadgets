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
import { Controller, Get, Post, Patch, Delete, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
let EmiController = (() => {
    let _classDecorators = [ApiTags('EMI'), Controller()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getEligiblePlans_decorators;
    let _calculateEmi_decorators;
    let _getProviders_decorators;
    let _getProvider_decorators;
    let _createProvider_decorators;
    let _updateProvider_decorators;
    let _deleteProvider_decorators;
    let _getPlans_decorators;
    let _getPlan_decorators;
    let _createPlan_decorators;
    let _updatePlan_decorators;
    let _deletePlan_decorators;
    var EmiController = _classThis = class {
        constructor(emiService) {
            this.emiService = (__runInitializers(this, _instanceExtraInitializers), emiService);
        }
        // ─── Public: Get eligible plans ────────────────────────────────────────
        async getEligiblePlans(amount, providerSlug) {
            const numAmount = amount ? Number(amount) : undefined;
            const plans = await this.emiService.getEligiblePlans(numAmount, providerSlug);
            return { data: plans };
        }
        async calculateEmi(dto) {
            const result = await this.emiService.calculate({
                principal: dto.principal,
                tenureMonths: dto.tenureMonths,
                annualRate: dto.annualRate,
                processingFee: dto.processingFee,
            });
            return { data: result };
        }
        // ─── Admin: Providers ──────────────────────────────────────────────────
        async getProviders() {
            const providers = await this.emiService.getProviders();
            return { data: providers };
        }
        async getProvider(id) {
            const provider = await this.emiService.getProviderById(id);
            return { data: provider };
        }
        async createProvider(dto) {
            const provider = await this.emiService.createProvider(dto);
            return { data: provider };
        }
        async updateProvider(id, dto) {
            const provider = await this.emiService.updateProvider(id, dto);
            return { data: provider };
        }
        async deleteProvider(id) {
            await this.emiService.deleteProvider(id);
        }
        // ─── Admin: Plans ──────────────────────────────────────────────────────
        async getPlans(providerId) {
            const plans = await this.emiService.getPlans(providerId);
            return { data: plans };
        }
        async getPlan(id) {
            const plan = await this.emiService.getPlanById(id);
            return { data: plan };
        }
        async createPlan(dto) {
            const plan = await this.emiService.createPlan(dto);
            return { data: plan };
        }
        async updatePlan(id, dto) {
            const plan = await this.emiService.updatePlan(id, dto);
            return { data: plan };
        }
        async deletePlan(id) {
            await this.emiService.deletePlan(id);
        }
    };
    __setFunctionName(_classThis, "EmiController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getEligiblePlans_decorators = [Get('public/emi/plans'), ApiOperation({ summary: 'Get eligible EMI plans for a given amount' })];
        _calculateEmi_decorators = [Post('public/emi/calculate'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Calculate EMI for given principal, tenure, and rate' })];
        _getProviders_decorators = [Get('admin/emi/providers'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.view'), ApiBearerAuth(), ApiOperation({ summary: 'List all EMI providers' })];
        _getProvider_decorators = [Get('admin/emi/providers/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.view'), ApiBearerAuth(), ApiOperation({ summary: 'Get EMI provider by ID' })];
        _createProvider_decorators = [Post('admin/emi/providers'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.create'), ApiBearerAuth(), ApiOperation({ summary: 'Create a new EMI provider' })];
        _updateProvider_decorators = [Patch('admin/emi/providers/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.edit'), ApiBearerAuth(), ApiOperation({ summary: 'Update an EMI provider' })];
        _deleteProvider_decorators = [Delete('admin/emi/providers/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.delete'), ApiBearerAuth(), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Delete an EMI provider' })];
        _getPlans_decorators = [Get('admin/emi/plans'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.view'), ApiBearerAuth(), ApiOperation({ summary: 'List all EMI plans' })];
        _getPlan_decorators = [Get('admin/emi/plans/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.view'), ApiBearerAuth(), ApiOperation({ summary: 'Get EMI plan by ID' })];
        _createPlan_decorators = [Post('admin/emi/plans'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.create'), ApiBearerAuth(), ApiOperation({ summary: 'Create a new EMI plan' })];
        _updatePlan_decorators = [Patch('admin/emi/plans/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.edit'), ApiBearerAuth(), ApiOperation({ summary: 'Update an EMI plan' })];
        _deletePlan_decorators = [Delete('admin/emi/plans/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('emi.delete'), ApiBearerAuth(), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Delete an EMI plan' })];
        __esDecorate(_classThis, null, _getEligiblePlans_decorators, { kind: "method", name: "getEligiblePlans", static: false, private: false, access: { has: obj => "getEligiblePlans" in obj, get: obj => obj.getEligiblePlans }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _calculateEmi_decorators, { kind: "method", name: "calculateEmi", static: false, private: false, access: { has: obj => "calculateEmi" in obj, get: obj => obj.calculateEmi }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProviders_decorators, { kind: "method", name: "getProviders", static: false, private: false, access: { has: obj => "getProviders" in obj, get: obj => obj.getProviders }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProvider_decorators, { kind: "method", name: "getProvider", static: false, private: false, access: { has: obj => "getProvider" in obj, get: obj => obj.getProvider }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createProvider_decorators, { kind: "method", name: "createProvider", static: false, private: false, access: { has: obj => "createProvider" in obj, get: obj => obj.createProvider }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProvider_decorators, { kind: "method", name: "updateProvider", static: false, private: false, access: { has: obj => "updateProvider" in obj, get: obj => obj.updateProvider }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteProvider_decorators, { kind: "method", name: "deleteProvider", static: false, private: false, access: { has: obj => "deleteProvider" in obj, get: obj => obj.deleteProvider }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPlans_decorators, { kind: "method", name: "getPlans", static: false, private: false, access: { has: obj => "getPlans" in obj, get: obj => obj.getPlans }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPlan_decorators, { kind: "method", name: "getPlan", static: false, private: false, access: { has: obj => "getPlan" in obj, get: obj => obj.getPlan }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPlan_decorators, { kind: "method", name: "createPlan", static: false, private: false, access: { has: obj => "createPlan" in obj, get: obj => obj.createPlan }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updatePlan_decorators, { kind: "method", name: "updatePlan", static: false, private: false, access: { has: obj => "updatePlan" in obj, get: obj => obj.updatePlan }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deletePlan_decorators, { kind: "method", name: "deletePlan", static: false, private: false, access: { has: obj => "deletePlan" in obj, get: obj => obj.deletePlan }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EmiController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EmiController = _classThis;
})();
export { EmiController };
//# sourceMappingURL=emi.controller.js.map