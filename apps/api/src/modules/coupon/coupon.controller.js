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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
let CouponController = (() => {
    let _classDecorators = [ApiTags('Coupons'), Controller()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _validate_decorators;
    let _create_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _update_decorators;
    let _toggleActive_decorators;
    let _remove_decorators;
    var CouponController = _classThis = class {
        constructor(couponService) {
            this.couponService = (__runInitializers(this, _instanceExtraInitializers), couponService);
        }
        // ─── Public: Validate a coupon code ──────────────────────────────────────────
        async validate(dto) {
            return this.couponService.validate(dto);
        }
        // ─── Admin CRUD ──────────────────────────────────────────────────────────────
        async create(dto, user) {
            return this.couponService.create(dto, user.sub);
        }
        async findAll(query) {
            return this.couponService.findAll(query);
        }
        async findById(id) {
            return this.couponService.findById(id);
        }
        async update(id, dto) {
            return this.couponService.update(id, dto);
        }
        async toggleActive(id) {
            return this.couponService.toggleActive(id);
        }
        async remove(id) {
            await this.couponService.remove(id);
        }
    };
    __setFunctionName(_classThis, "CouponController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _validate_decorators = [Post('coupons/validate'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Validate a coupon code against a cart subtotal' })];
        _create_decorators = [Post('admin/coupons'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.create'), ApiBearerAuth(), ApiOperation({ summary: 'Create a new coupon' })];
        _findAll_decorators = [Get('admin/coupons'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.view'), ApiBearerAuth(), ApiOperation({ summary: 'List all coupons' })];
        _findById_decorators = [Get('admin/coupons/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.view'), ApiBearerAuth(), ApiOperation({ summary: 'Get coupon by ID' })];
        _update_decorators = [Patch('admin/coupons/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.create'), ApiBearerAuth(), ApiOperation({ summary: 'Update a coupon' })];
        _toggleActive_decorators = [Patch('admin/coupons/:id/toggle'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.create'), ApiBearerAuth(), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Toggle coupon active status' })];
        _remove_decorators = [Delete('admin/coupons/:id'), UseGuards(AuthGuard('jwt'), PermissionGuard), RequirePermission('sales.create'), ApiBearerAuth(), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Delete a coupon' })];
        __esDecorate(_classThis, null, _validate_decorators, { kind: "method", name: "validate", static: false, private: false, access: { has: obj => "validate" in obj, get: obj => obj.validate }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleActive_decorators, { kind: "method", name: "toggleActive", static: false, private: false, access: { has: obj => "toggleActive" in obj, get: obj => obj.toggleActive }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CouponController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CouponController = _classThis;
})();
export { CouponController };
//# sourceMappingURL=coupon.controller.js.map