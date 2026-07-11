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
/**
 * EventService — central event emitter that ALL business services use.
 *
 * This decouples business logic from the transport layer (Socket.io).
 * If the transport changes (e.g., to WebSockets, Server-Sent Events, or a message queue),
 * only this service needs to change.
 */
let EventService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EventService = _classThis = class {
        constructor(realtime) {
            this.realtime = realtime;
            this.logger = new Logger(EventService.name);
        }
        // ─── Sales ────────────────────────────────────────────────────────────────────
        emitSaleCreated(branchId, data) {
            this.logger.debug(`[Event] sale.created: branch=${branchId} sale=${data.saleId}`);
            this.realtime.emitSaleCreated(branchId, data);
        }
        emitSaleVoided(branchId, data) {
            this.logger.debug(`[Event] sale.voided: branch=${branchId} sale=${data.saleId}`);
            this.realtime.emitSaleVoided(branchId, data);
        }
        // ─── Inventory ────────────────────────────────────────────────────────────────
        emitInventoryUpdated(branchId, data) {
            this.logger.debug(`[Event] inventory.updated: branch=${branchId} item=${data.itemId}`);
            this.realtime.emitInventoryUpdated(branchId, data);
        }
        emitInventoryLocked(branchId, data) {
            this.logger.debug(`[Event] inventory.locked: branch=${branchId} item=${data.itemId}`);
            this.realtime.emitInventoryLocked(branchId, data);
        }
        emitInventoryUnlocked(branchId, data) {
            this.logger.debug(`[Event] inventory.unlocked: branch=${branchId} item=${data.itemId}`);
            this.realtime.emitInventoryUnlocked(branchId, data);
        }
        // ─── Orders ───────────────────────────────────────────────────────────────────
        emitOrderCreated(branchId, data) {
            this.logger.debug(`[Event] order.created: branch=${branchId} order=${data.orderId}`);
            this.realtime.emitOrderCreated(branchId, data);
        }
        emitOrderStatusChanged(data) {
            this.logger.debug(`[Event] order.status_changed: order=${data.orderId} status=${data.status}`);
            this.realtime.emitOrderStatusChanged(data);
        }
        // ─── Payments ─────────────────────────────────────────────────────────────────
        emitPaymentConfirmed(data) {
            this.logger.debug(`[Event] payment.confirmed: order=${data.orderId} payment=${data.paymentId}`);
            this.realtime.emitPaymentConfirmed(data);
        }
        // ─── Transfers ────────────────────────────────────────────────────────────────
        emitTransferCreated(fromBranchId, data) {
            this.logger.debug(`[Event] stock.transfer.created: fromBranch=${fromBranchId} transfer=${data.transferId}`);
            this.realtime.emitTransferCreated(fromBranchId, data);
        }
        emitTransferReceived(branchId, data) {
            this.logger.debug(`[Event] stock.transfer.received: branch=${branchId} transfer=${data.transferId}`);
            this.realtime.emitTransferReceived(branchId, data);
        }
        emitTransferUpdated(branchId, data) {
            this.logger.debug(`[Event] stock.transfer.updated: branch=${branchId} transfer=${data.transferId}`);
            this.realtime.emitTransferUpdated(branchId, data);
        }
        // ─── Returns ──────────────────────────────────────────────────────────────────
        emitReturnCreated(branchId, data) {
            this.logger.debug(`[Event] return.created: branch=${branchId} returnId=${data.returnId}`);
            this.realtime.emitReturnCreated(branchId, data);
        }
        // ─── Notifications ────────────────────────────────────────────────────────────
        emitNotificationNew(userId, data) {
            this.logger.debug(`[Event] notification.new: user=${userId} type=${data.type}`);
            this.realtime.emitNotificationNew(userId, data);
        }
        // ─── Dashboard ────────────────────────────────────────────────────────────────
        emitDashboardRefresh(branchId) {
            this.logger.debug(`[Event] dashboard.refresh${branchId ? `: branch=${branchId}` : ': admin'}`);
            this.realtime.emitDashboardRefresh(branchId);
        }
    };
    __setFunctionName(_classThis, "EventService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EventService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EventService = _classThis;
})();
export { EventService };
//# sourceMappingURL=event.service.js.map