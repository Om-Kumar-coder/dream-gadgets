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
import { Injectable, Logger, } from '@nestjs/common';
import * as crypto from 'crypto';
/**
 * Validates incoming Twilio webhook requests by checking the
 * X-Twilio-Signature header against a computed HMAC-SHA1 hash.
 * Falls back to allowing the request in dev mode when Twilio is not configured.
 */
let TwilioWebhookGuard = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TwilioWebhookGuard = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new Logger(TwilioWebhookGuard.name);
        }
        canActivate(context) {
            const request = context.switchToHttp().getRequest();
            const signature = request.headers['x-twilio-signature'];
            const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
            // If Twilio is not configured, allow all requests in dev mode
            if (!authToken) {
                this.logger.log('[TwilioWebhook] No TWILIO_AUTH_TOKEN — allowing request (dev mode)');
                return true;
            }
            // If no signature header, check if this might be a Meta Cloud API request instead
            if (!signature) {
                // Allow through — Meta API uses different security (bearer token in webhook URL)
                return true;
            }
            const url = `${request.protocol}://${request.hostname}${request.originalUrl}`;
            const payload = request.body ? this.buildPayload(url, request.body) : url;
            const expectedSignature = crypto
                .createHmac('sha1', authToken)
                .update(payload)
                .digest('base64');
            if (signature !== expectedSignature) {
                this.logger.warn('[TwilioWebhook] Invalid signature — rejecting request');
                return false;
            }
            return true;
        }
        buildPayload(url, body) {
            // Twilio signature validation requires sorted keys
            const sortedKeys = Object.keys(body).sort();
            const params = sortedKeys.map((key) => `${key}${body[key]}`).join('');
            return url + params;
        }
    };
    __setFunctionName(_classThis, "TwilioWebhookGuard");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TwilioWebhookGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TwilioWebhookGuard = _classThis;
})();
export { TwilioWebhookGuard };
//# sourceMappingURL=twilio-webhook.guard.js.map