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
import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
let NotificationProcessor = (() => {
    let _classDecorators = [Processor('notification')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _process_decorators;
    let _onFailed_decorators;
    var NotificationProcessor = _classThis = class {
        constructor(notificationService) {
            this.notificationService = (__runInitializers(this, _instanceExtraInitializers), notificationService);
            this.logger = new Logger(NotificationProcessor.name);
        }
        async process(job) {
            const { notificationId, channel, to, subject, body } = job.data;
            this.logger.log(`[Processor] Processing notification ${notificationId} via ${channel} (attempt ${job.attemptsMade + 1})`);
            try {
                const result = await this.notificationService.processDelivery(notificationId, channel, to, subject, body);
                if (result.success) {
                    this.logger.log(`[Processor] Delivered ${notificationId} via ${channel}: id=${result.providerMessageId}`);
                }
                else {
                    throw new Error(result.error ?? 'Delivery failed');
                }
            }
            catch (err) {
                this.logger.warn(`[Processor] Delivery failed for ${notificationId} via ${channel} (attempt ${job.attemptsMade + 1}): ${err?.message}`);
                throw err;
            }
        }
        onFailed(job, error) {
            this.logger.warn(`[Processor] Failed notification ${job.data.notificationId} via ${job.data.channel}: ${error?.message}`);
        }
    };
    __setFunctionName(_classThis, "NotificationProcessor");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _process_decorators = [Process()];
        _onFailed_decorators = [OnQueueFailed()];
        __esDecorate(_classThis, null, _process_decorators, { kind: "method", name: "process", static: false, private: false, access: { has: obj => "process" in obj, get: obj => obj.process }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onFailed_decorators, { kind: "method", name: "onFailed", static: false, private: false, access: { has: obj => "onFailed" in obj, get: obj => obj.onFailed }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationProcessor = _classThis;
})();
export { NotificationProcessor };
//# sourceMappingURL=notification.processor.js.map