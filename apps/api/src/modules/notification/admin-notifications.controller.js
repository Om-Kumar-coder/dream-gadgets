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
import { Controller, Get, Post, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
let AdminNotificationsController = (() => {
    let _classDecorators = [ApiTags('Admin Notifications'), ApiBearerAuth(), UseGuards(AuthGuard('jwt')), Controller('admin/notifications')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _getFailed_decorators;
    let _retry_decorators;
    let _retryAll_decorators;
    var AdminNotificationsController = _classThis = class {
        constructor(notificationService) {
            this.notificationService = (__runInitializers(this, _instanceExtraInitializers), notificationService);
        }
        async findAll(page, limit, status, channel, userId) {
            return this.notificationService.findAll({
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                status,
                channel,
                userId,
            });
        }
        async getFailed() {
            const notifications = await this.notificationService.getFailedNotifications();
            return { data: notifications, total: notifications.length };
        }
        async retry(id) {
            const notification = await this.notificationService.retryFailed(id);
            return { message: 'Notification requeued for retry', data: notification };
        }
        async retryAll() {
            const result = await this.notificationService.retryAllFailed();
            return { message: `Retried ${result.retried} notifications`, data: result };
        }
    };
    __setFunctionName(_classThis, "AdminNotificationsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [Get(), ApiOperation({ summary: 'List all notifications with filtering' })];
        _getFailed_decorators = [Get('failed'), ApiOperation({ summary: 'Get all failed notifications' })];
        _retry_decorators = [Post(':id/retry'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Retry a failed notification' })];
        _retryAll_decorators = [Post('retry-all'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Retry all failed notifications' })];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFailed_decorators, { kind: "method", name: "getFailed", static: false, private: false, access: { has: obj => "getFailed" in obj, get: obj => obj.getFailed }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _retry_decorators, { kind: "method", name: "retry", static: false, private: false, access: { has: obj => "retry" in obj, get: obj => obj.retry }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _retryAll_decorators, { kind: "method", name: "retryAll", static: false, private: false, access: { has: obj => "retryAll" in obj, get: obj => obj.retryAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdminNotificationsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdminNotificationsController = _classThis;
})();
export { AdminNotificationsController };
//# sourceMappingURL=admin-notifications.controller.js.map