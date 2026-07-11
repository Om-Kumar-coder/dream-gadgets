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
import { Injectable, Logger } from '@nestjs/common';
let TwilioVerifyService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TwilioVerifyService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new Logger(TwilioVerifyService.name);
        }
        /**
         * Send an OTP via Twilio Verify service.
         * Falls back to dev log when Twilio Verify is not configured.
         */
        async sendOtp(phone) {
            const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
            const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
            const serviceSid = this.configService.get('TWILIO_VERIFY_SERVICE_SID');
            if (!accountSid || !authToken || !serviceSid) {
                this.logger.log(`[DEV] Would send OTP to ${phone} via Twilio Verify`);
                return { success: true, status: 'dev-mode' };
            }
            try {
                const formattedTo = this.formatPhone(phone);
                const twilio = require('twilio');
                const client = twilio(accountSid, authToken);
                const verification = await client.verify.v2
                    .services(serviceSid)
                    .verifications.create({
                    to: formattedTo,
                    channel: 'sms',
                });
                this.logger.log(`[Twilio Verify] OTP sent to ${formattedTo}: sid=${verification.sid}, status=${verification.status}`);
                return { success: true, status: verification.status };
            }
            catch (err) {
                this.logger.error(`[Twilio Verify] Failed to send OTP to ${phone}: ${err?.message}`);
                return {
                    success: false,
                    status: 'failed',
                    error: err?.message ?? 'Unknown Twilio Verify error',
                };
            }
        }
        /**
         * Verify an OTP code via Twilio Verify service.
         */
        async verifyOtp(phone, code) {
            const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
            const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
            const serviceSid = this.configService.get('TWILIO_VERIFY_SERVICE_SID');
            if (!accountSid || !authToken || !serviceSid) {
                this.logger.log(`[DEV] Would verify OTP for ${phone} with code ${code}`);
                // In dev mode, accept any 6-digit code
                if (code.length === 6 && /^\d{6}$/.test(code)) {
                    return { success: true, status: 'approved' };
                }
                return { success: false, status: 'pending', error: 'Invalid code format' };
            }
            try {
                const formattedTo = this.formatPhone(phone);
                const twilio = require('twilio');
                const client = twilio(accountSid, authToken);
                const check = await client.verify.v2
                    .services(serviceSid)
                    .verificationChecks.create({
                    to: formattedTo,
                    code,
                });
                if (check.status === 'approved') {
                    this.logger.log(`[Twilio Verify] OTP verified for ${formattedTo}`);
                    return { success: true, status: check.status };
                }
                this.logger.warn(`[Twilio Verify] OTP verification failed for ${formattedTo}: status=${check.status}`);
                return { success: false, status: check.status, error: `Verification ${check.status}` };
            }
            catch (err) {
                this.logger.error(`[Twilio Verify] Failed to verify OTP for ${phone}: ${err?.message}`);
                return {
                    success: false,
                    status: 'failed',
                    error: err?.message ?? 'Unknown Twilio Verify error',
                };
            }
        }
        formatPhone(phone) {
            // Strip non-digits
            let digits = phone.replace(/\D/g, '');
            // If 10-digit Indian number, prepend +91
            if (digits.length === 10) {
                digits = `91${digits}`;
            }
            // Ensure + prefix
            if (!digits.startsWith('+')) {
                digits = `+${digits}`;
            }
            return digits;
        }
    };
    __setFunctionName(_classThis, "TwilioVerifyService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TwilioVerifyService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TwilioVerifyService = _classThis;
})();
export { TwilioVerifyService };
//# sourceMappingURL=twilio-verify.service.js.map