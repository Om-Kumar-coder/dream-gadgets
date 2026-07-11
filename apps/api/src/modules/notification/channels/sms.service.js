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
let SmsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SmsService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new Logger(SmsService.name);
        }
        /**
         * Send an SMS via Twilio API.
         * Falls back to dev log when Twilio is not configured.
         * Properly formats Indian (+91) numbers.
         */
        async send(to, body) {
            const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
            const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
            if (!accountSid || !authToken) {
                this.logger.log(`[DEV] SMS to ${to}: ${body}`);
                return {
                    success: true,
                    providerMessageId: `dev-${Date.now()}`,
                    status: 'sent',
                };
            }
            try {
                const formattedTo = this.formatPhone(to);
                const from = this.configService.get('TWILIO_SMS_FROM') ?? '+15005550006'; // Twilio test number
                const twilio = require('twilio');
                const client = twilio(accountSid, authToken);
                const message = await client.messages.create({
                    from,
                    to: formattedTo,
                    body,
                });
                this.logger.log(`[SMS] Sent to ${formattedTo}: sid=${message.sid}, status=${message.status}`);
                return {
                    success: true,
                    providerMessageId: message.sid,
                    status: 'sent',
                };
            }
            catch (err) {
                this.logger.error(`[SMS] Failed to send to ${to}: ${err?.message}`);
                return {
                    success: false,
                    providerMessageId: null,
                    status: 'failed',
                    error: err?.message ?? 'Unknown SMS error',
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
    __setFunctionName(_classThis, "SmsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SmsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SmsService = _classThis;
})();
export { SmsService };
//# sourceMappingURL=sms.service.js.map