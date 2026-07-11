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
import { Controller, Post, Get, Patch, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
let AuthController = (() => {
    let _classDecorators = [ApiTags('auth'), Controller('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _login_decorators;
    let _refresh_decorators;
    let _logout_decorators;
    let _register_decorators;
    let _sendOtp_decorators;
    let _forgotPassword_decorators;
    let _resetPassword_decorators;
    let _getMe_decorators;
    let _updateMe_decorators;
    let _changePassword_decorators;
    var AuthController = _classThis = class {
        constructor(authService) {
            this.authService = (__runInitializers(this, _instanceExtraInitializers), authService);
        }
        // 3.2 Login
        async login(dto) {
            return this.authService.login(dto);
        }
        // 3.3 Refresh
        async refresh(dto) {
            return this.authService.refresh(dto.refreshToken);
        }
        // 3.4 Logout
        async logout(dto) {
            await this.authService.logout(dto.refreshToken);
        }
        // 3.5 Register (customer)
        async register(dto) {
            return this.authService.register(dto);
        }
        // 3.5 Send OTP
        async sendOtp(body) {
            await this.authService.sendOtp(body.phone);
        }
        // 3.6 Forgot password
        async forgotPassword(dto) {
            await this.authService.forgotPassword(dto.identifier);
        }
        // 3.6 Reset password
        async resetPassword(dto) {
            await this.authService.resetPassword(dto.token, dto.newPassword);
        }
        // 3.7 Get profile
        async getMe(user) {
            return this.authService.getProfile(user.sub);
        }
        // 3.7 Update profile
        async updateMe(user, dto) {
            return this.authService.updateProfile(user.sub, dto);
        }
        // 3.7 Change password
        async changePassword(user, dto) {
            await this.authService.changePassword(user.sub, dto);
            return { message: 'Password changed successfully. Please log in again.' };
        }
    };
    __setFunctionName(_classThis, "AuthController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _login_decorators = [Post('login'), Throttle({ default: { ttl: 60000, limit: 10 } }), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Login with email/phone + password' })];
        _refresh_decorators = [Post('refresh'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Rotate refresh token' })];
        _logout_decorators = [Post('logout'), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Invalidate refresh token' })];
        _register_decorators = [Post('register'), Throttle({ default: { ttl: 60000, limit: 5 } }), HttpCode(HttpStatus.CREATED), ApiOperation({ summary: 'Customer self-registration with phone OTP' })];
        _sendOtp_decorators = [Post('send-otp'), Throttle({ default: { ttl: 60000, limit: 3 } }), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Send OTP to phone for registration' })];
        _forgotPassword_decorators = [Post('forgot-password'), Throttle({ default: { ttl: 60000, limit: 3 } }), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Request password reset link' })];
        _resetPassword_decorators = [Post('reset-password'), Throttle({ default: { ttl: 60000, limit: 5 } }), HttpCode(HttpStatus.NO_CONTENT), ApiOperation({ summary: 'Reset password with token' })];
        _getMe_decorators = [Get('me'), UseGuards(AuthGuard('jwt')), ApiBearerAuth(), ApiOperation({ summary: 'Get current user profile' })];
        _updateMe_decorators = [Patch('me'), UseGuards(AuthGuard('jwt')), ApiBearerAuth(), ApiOperation({ summary: 'Update current user profile' })];
        _changePassword_decorators = [Post('change-password'), UseGuards(AuthGuard('jwt')), ApiBearerAuth(), ApiOperation({ summary: 'Change password (requires current password)' })];
        __esDecorate(_classThis, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _refresh_decorators, { kind: "method", name: "refresh", static: false, private: false, access: { has: obj => "refresh" in obj, get: obj => obj.refresh }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _logout_decorators, { kind: "method", name: "logout", static: false, private: false, access: { has: obj => "logout" in obj, get: obj => obj.logout }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _register_decorators, { kind: "method", name: "register", static: false, private: false, access: { has: obj => "register" in obj, get: obj => obj.register }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendOtp_decorators, { kind: "method", name: "sendOtp", static: false, private: false, access: { has: obj => "sendOtp" in obj, get: obj => obj.sendOtp }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _forgotPassword_decorators, { kind: "method", name: "forgotPassword", static: false, private: false, access: { has: obj => "forgotPassword" in obj, get: obj => obj.forgotPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetPassword_decorators, { kind: "method", name: "resetPassword", static: false, private: false, access: { has: obj => "resetPassword" in obj, get: obj => obj.resetPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMe_decorators, { kind: "method", name: "getMe", static: false, private: false, access: { has: obj => "getMe" in obj, get: obj => obj.getMe }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateMe_decorators, { kind: "method", name: "updateMe", static: false, private: false, access: { has: obj => "updateMe" in obj, get: obj => obj.updateMe }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _changePassword_decorators, { kind: "method", name: "changePassword", static: false, private: false, access: { has: obj => "changePassword" in obj, get: obj => obj.changePassword }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthController = _classThis;
})();
export { AuthController };
//# sourceMappingURL=auth.controller.js.map