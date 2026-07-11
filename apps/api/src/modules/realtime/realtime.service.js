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
let RealtimeService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RealtimeService = _classThis = class {
        constructor() {
            this.logger = new Logger(RealtimeService.name);
            this.server = null;
        }
        // Called by the gateway to register the Socket.io server
        setServer(server) {
            this.server = server;
        }
        // ─── Core emit method ─────────────────────────────────────────────────────────
        emit(room, event, data) {
            if (!this.server) {
                this.logger.debug(`[Realtime] No server — skipping emit: ${event} → ${room}`);
                return;
            }
            try {
                this.server.to(room).emit(event, data);
                this.logger.debug(`[Realtime] Emitted ${event} → ${room}`);
            }
            catch (err) {
                this.logger.warn(`[Realtime] Emit failed: ${err?.message}`);
            }
        }
        // ─── Sales events ────────────────────────────────────────────────────────────
        emitSaleCreated(branchId, data) {
            this.emit(`branch:${branchId}`, 'sale.created', data);
            this.emit('admin', 'sale.created', data);
        }
        emitSaleVoided(branchId, data) {
            this.emit(`branch:${branchId}`, 'sale.voided', data);
            this.emit('admin', 'sale.voided', data);
        }
        // ─── Inventory events ────────────────────────────────────────────────────────
        emitInventoryUpdated(branchId, data) {
            this.emit(`branch:${branchId}`, 'inventory.updated', data);
        }
        emitInventoryLocked(branchId, data) {
            this.emit(`branch:${branchId}`, 'inventory.locked', data);
        }
        emitInventoryUnlocked(branchId, data) {
            this.emit(`branch:${branchId}`, 'inventory.unlocked', data);
        }
        // ─── Order events ────────────────────────────────────────────────────────────
        emitOrderCreated(branchId, data) {
            this.emit(`branch:${branchId}`, 'order.created', data);
            this.emit('admin', 'order.created', data);
        }
        emitOrderStatusChanged(data) {
            this.emit('admin', 'order.status_changed', data);
            if (data.branchId) {
                this.emit(`branch:${data.branchId}`, 'order.status_changed', data);
            }
        }
        // ─── Payment events ──────────────────────────────────────────────────────────
        emitPaymentConfirmed(data) {
            this.emit('admin', 'payment.confirmed', data);
        }
        // ─── Transfer events ─────────────────────────────────────────────────────────
        emitTransferCreated(fromBranchId, data) {
            // Notify source branch, destination branch, and admin room
            this.emit(`branch:${fromBranchId}`, 'stock.transfer.created', data);
            if (data.toBranchId && data.toBranchId !== data.branchId) {
                this.emit(`branch:${data.toBranchId}`, 'stock.transfer.created', data);
            }
            this.emit('admin', 'stock.transfer.created', data);
        }
        emitTransferReceived(branchId, data) {
            this.emit(`branch:${branchId}`, 'stock.transfer.received', data);
        }
        emitTransferUpdated(branchId, data) {
            this.emit(`branch:${branchId}`, 'stock.transfer.updated', data);
            this.emit('admin', 'stock.transfer.updated', data);
        }
        // ─── Return events ────────────────────────────────────────────────────────────
        emitReturnCreated(branchId, data) {
            this.emit(`branch:${branchId}`, 'return.created', data);
            this.emit('admin', 'return.created', data);
        }
        // ─── Notification events ─────────────────────────────────────────────────────
        emitNotificationNew(userId, data) {
            this.emit(`user:${userId}`, 'notification.new', data);
        }
        // ─── Dashboard events ────────────────────────────────────────────────────────
        emitDashboardRefresh(branchId) {
            const room = branchId ? `branch:${branchId}` : 'admin';
            this.emit(room, 'dashboard.refresh', { timestamp: new Date().toISOString() });
        }
    };
    __setFunctionName(_classThis, "RealtimeService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RealtimeService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RealtimeService = _classThis;
})();
export { RealtimeService };
//# sourceMappingURL=realtime.service.js.map