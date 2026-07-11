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
import { Controller, Get, Post, HttpCode, HttpStatus, UseGuards, Logger, } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TwilioWebhookGuard } from './guards/twilio-webhook.guard';
/**
 * Public webhook endpoints for WhatsApp Business API (Twilio/Meta).
 * - GET: Webhook verification challenge
 * - POST: Incoming messages and delivery receipts
 */
let WhatsappWebhookController = (() => {
    let _classDecorators = [ApiTags('WhatsApp Webhook'), Controller('public/whatsapp')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _verifyWebhook_decorators;
    let _verifyEndpoint_decorators;
    let _receiveMessage_decorators;
    var WhatsappWebhookController = _classThis = class {
        constructor(whatsappService) {
            this.whatsappService = (__runInitializers(this, _instanceExtraInitializers), whatsappService);
            this.logger = new Logger(WhatsappWebhookController.name);
        }
        /**
         * Webhook verification challenge.
         * WhatsApp Business API / Twilio sends a GET request with a challenge token
         * during initial webhook setup. We must echo the challenge back.
         */
        verifyWebhook(mode, challenge, verifyToken) {
            const result = this.whatsappService.verifyWebhook(mode, challenge, verifyToken);
            if (result) {
                return result;
            }
            // Return challenge as-is for Twilio-style verification
            if (challenge) {
                return challenge;
            }
            throw new Error('Webhook verification failed');
        }
        /**
         * Alternative verification format used by some providers.
         */
        verifyEndpoint(mode, challenge, verifyToken) {
            return this.verifyWebhook(mode ?? (''), challenge ?? (''), verifyToken ?? (''));
        }
        /**
         * Receive incoming messages and delivery status updates.
         * Supports both Twilio and Meta Cloud API payload formats.
         */
        async receiveMessage(payload) {
            await this.whatsappService.handleIncoming(payload);
            return { status: 'ok' };
        }
    };
    __setFunctionName(_classThis, "WhatsappWebhookController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _verifyWebhook_decorators = [Get('webhook'), HttpCode(HttpStatus.OK)];
        _verifyEndpoint_decorators = [Get('verify'), HttpCode(HttpStatus.OK)];
        _receiveMessage_decorators = [Post('webhook'), UseGuards(TwilioWebhookGuard), Throttle({ default: { ttl: 60000, limit: 60 } }), HttpCode(HttpStatus.OK)];
        __esDecorate(_classThis, null, _verifyWebhook_decorators, { kind: "method", name: "verifyWebhook", static: false, private: false, access: { has: obj => "verifyWebhook" in obj, get: obj => obj.verifyWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verifyEndpoint_decorators, { kind: "method", name: "verifyEndpoint", static: false, private: false, access: { has: obj => "verifyEndpoint" in obj, get: obj => obj.verifyEndpoint }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _receiveMessage_decorators, { kind: "method", name: "receiveMessage", static: false, private: false, access: { has: obj => "receiveMessage" in obj, get: obj => obj.receiveMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappWebhookController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappWebhookController = _classThis;
})();
export { WhatsappWebhookController };
//# sourceMappingURL=whatsapp-webhook.controller.js.map