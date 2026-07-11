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
import { Injectable, NotFoundException, BadRequestException, Logger, } from '@nestjs/common';
import { Like } from 'typeorm';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
let OnlineOrderService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OnlineOrderService = _classThis = class {
        constructor(orderRepo, orderItemRepo, dataSource, eventService) {
            this.orderRepo = orderRepo;
            this.orderItemRepo = orderItemRepo;
            this.dataSource = dataSource;
            this.eventService = eventService;
            this.logger = new Logger(OnlineOrderService.name);
        }
        // ─── Generate unique order number ─────────────────────────────────────────────
        async generateOrderNumber() {
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.random().toString(36).slice(2, 6).toUpperCase();
            return `ORD-${timestamp}-${random}`;
        }
        // ─── Create online order ──────────────────────────────────────────────────────
        async create(dto) {
            const { clientId, branchId, shippingAddress, totalAmount, items, ...rest } = dto;
            const orderNumber = await this.generateOrderNumber();
            const order = this.orderRepo.create({
                orderNumber,
                clientId: clientId ?? null,
                branchId,
                status: OnlineOrderStatus.PENDING_PAYMENT,
                shippingAddress,
                subtotal: totalAmount,
                totalAmount,
                shippingCharge: rest.shippingCharge ?? 0,
                discountAmount: rest.discountAmount ?? 0,
                taxAmount: rest.taxAmount ?? 0,
                notes: rest.notes ?? null,
            });
            // Save the order first
            const savedOrder = await this.orderRepo.save(order);
            // Create order item records for each line item
            if (items && items.length > 0) {
                const orderItems = items.map((item) => {
                    const quantity = item.quantity ?? 1;
                    const unitPrice = Number(item.unitPrice);
                    const taxAmount = item.taxAmount ?? 0;
                    const total = (unitPrice * quantity) + taxAmount;
                    return this.orderItemRepo.create({
                        orderId: savedOrder.id,
                        itemId: item.itemId,
                        imei: item.imei,
                        description: item.description,
                        unitPrice,
                        taxRate: item.taxRate ?? 0,
                        taxAmount,
                        total,
                        hsnCode: item.hsnCode ?? null,
                    });
                });
                await this.orderItemRepo.save(orderItems);
            }
            // Reload with items relation (emit AFTER all persistence is complete)
            const result = (await this.orderRepo.findOne({
                where: { id: savedOrder.id },
                relations: ['items', 'client', 'branch', 'payments'],
            }));
            // Emit realtime event — only after ALL saves succeed
            try {
                this.eventService.emitOrderCreated(branchId, {
                    orderId: savedOrder.id,
                    orderNumber,
                    totalAmount: Number(totalAmount),
                    branchId,
                    timestamp: new Date().toISOString(),
                });
            }
            catch (err) {
                this.logger.warn(`[Event] Failed to emit order.created: ${err?.message}`);
            }
            return result;
        }
        // ─── Get order by ID ──────────────────────────────────────────────────────────
        async findById(id) {
            const order = await this.orderRepo.findOne({
                where: { id },
                relations: ['items', 'client', 'branch', 'payments'],
            });
            if (!order) {
                throw new NotFoundException({
                    code: 'ORDER_NOT_FOUND',
                    message: `Order ${id} not found`,
                });
            }
            return order;
        }
        // ─── Get orders for a client ──────────────────────────────────────────────────
        async findByClientId(clientId, page = 1, limit = 20, status, search) {
            const where = { clientId };
            if (status) {
                where.status = status;
            }
            if (search) {
                where.orderNumber = Like(`%${search}%`);
            }
            const [data, total] = await this.orderRepo.findAndCount({
                where,
                relations: ['client', 'branch', 'payments'],
                order: { orderedAt: 'DESC' },
                skip: (page - 1) * limit,
                take: limit,
            });
            return { data, total };
        }
        // ─── Update order status ──────────────────────────────────────────────────────
        async updateStatus(id, status) {
            const order = await this.findById(id);
            const newStatus = status;
            // Validate status transition if needed
            const validTransitions = {
                [OnlineOrderStatus.PENDING_PAYMENT]: [OnlineOrderStatus.PAYMENT_CONFIRMED, OnlineOrderStatus.CANCELLED],
                [OnlineOrderStatus.PAYMENT_CONFIRMED]: [OnlineOrderStatus.PROCESSING, OnlineOrderStatus.CANCELLED],
                [OnlineOrderStatus.PROCESSING]: [OnlineOrderStatus.PACKED, OnlineOrderStatus.CANCELLED],
                [OnlineOrderStatus.PACKED]: [OnlineOrderStatus.SHIPPED],
                [OnlineOrderStatus.SHIPPED]: [OnlineOrderStatus.OUT_FOR_DELIVERY],
                [OnlineOrderStatus.OUT_FOR_DELIVERY]: [OnlineOrderStatus.DELIVERED],
                [OnlineOrderStatus.DELIVERED]: [OnlineOrderStatus.RETURN_REQUESTED],
                [OnlineOrderStatus.RETURN_REQUESTED]: [OnlineOrderStatus.RETURNED],
                [OnlineOrderStatus.RETURNED]: [],
                [OnlineOrderStatus.CANCELLED]: [],
            };
            const allowed = validTransitions[order.status] ?? [];
            if (!allowed.includes(newStatus)) {
                throw new BadRequestException({
                    code: 'INVALID_STATUS_TRANSITION',
                    message: `Cannot transition from ${order.status} to ${newStatus}`,
                });
            }
            const previousStatus = order.status;
            order.status = newStatus;
            // Update timestamp columns based on status
            if (newStatus === OnlineOrderStatus.SHIPPED) {
                order.shippedAt = new Date();
            }
            else if (newStatus === OnlineOrderStatus.DELIVERED) {
                order.deliveredAt = new Date();
            }
            const saved = await this.orderRepo.save(order);
            // Emit realtime event
            try {
                this.eventService.emitOrderStatusChanged({
                    orderId: id,
                    orderNumber: saved.orderNumber,
                    status: newStatus,
                    previousStatus,
                    branchId: saved.branchId,
                    timestamp: new Date().toISOString(),
                });
            }
            catch (err) {
                this.logger.warn(`[Event] Failed to emit order.status_changed: ${err?.message}`);
            }
            return saved;
        }
        // ─── Cancel an order (convenience wrapper) ───────────────────────────────────
        async cancelOrder(id) {
            return this.updateStatus(id, OnlineOrderStatus.CANCELLED);
        }
        // ─── Get order with items and payment details (for public access) ────────────
        async getPublicOrderSummary(id) {
            const order = await this.findById(id);
            return {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                totalAmount: order.totalAmount,
                shippingAddress: order.shippingAddress,
                trackingNumber: order.trackingNumber,
                courier: order.courier,
                orderedAt: order.orderedAt,
                shippedAt: order.shippedAt,
                deliveredAt: order.deliveredAt,
                payments: order.payments.map(p => ({
                    id: p.id,
                    method: p.method,
                    amount: p.amount,
                    status: p.status,
                    razorpayRefundId: p.razorpayRefundId,
                    refundAmount: p.refundAmount,
                    refundStatus: p.refundStatus,
                    refundedAt: p.refundedAt,
                })),
            };
        }
        // ─── List orders with pagination and filtering ──────────────────────────────
        async findAll(page = 1, limit = 20, options) {
            const where = {};
            if (options?.status) {
                where.status = options.status;
            }
            if (options?.search) {
                where.orderNumber = Like(`%${options.search}%`);
            }
            const [data, total] = await this.orderRepo.findAndCount({
                where,
                relations: ['client', 'branch', 'payments'],
                order: { orderedAt: 'DESC' },
                skip: (page - 1) * limit,
                take: limit,
            });
            return { data, total };
        }
    };
    __setFunctionName(_classThis, "OnlineOrderService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OnlineOrderService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OnlineOrderService = _classThis;
})();
export { OnlineOrderService };
//# sourceMappingURL=online-order.service.js.map