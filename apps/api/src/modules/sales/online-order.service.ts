import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { OnlineOrder } from './entities/online-order.entity';
import { OnlineOrderItem } from './entities/online-order-item.entity';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { EventService } from '../../common/events/event.service';
import { NotificationService } from '../notification/notification.service';

export interface CreateOnlineOrderDto {
  clientId?: string;
  branchId: string;
  items: Array<{ itemId: string; imei?: string | null; description: string; unitPrice: number; quantity?: number; taxRate?: number; taxAmount?: number; hsnCode?: string }>;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalAmount: number;
  shippingCharge?: number;
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
}

export interface FindAllOptions {
  search?: string;
  status?: string;
}

@Injectable()
export class OnlineOrderService {
  private readonly logger = new Logger(OnlineOrderService.name);

  constructor(
    @InjectRepository(OnlineOrder)
    private readonly orderRepo: Repository<OnlineOrder>,
    @InjectRepository(OnlineOrderItem)
    private readonly orderItemRepo: Repository<OnlineOrderItem>,
    private readonly dataSource: DataSource,
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Generate unique order number ─────────────────────────────────────────────

  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  // ─── Create online order ──────────────────────────────────────────────────────

  async create(dto: CreateOnlineOrderDto): Promise<OnlineOrder> {
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
    }))!;

    // Emit realtime event — only after ALL saves succeed
    try {
      this.eventService.emitOrderCreated(branchId, {
        orderId: savedOrder.id,
        orderNumber,
        totalAmount: Number(totalAmount),
        branchId,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      this.logger.warn(`[Event] Failed to emit order.created: ${err?.message}`);
    }

    return result;
  }

  // ─── Get order by ID ──────────────────────────────────────────────────────────

  async findById(id: string): Promise<OnlineOrder> {
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

  async findByClientId(
    clientId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
  ): Promise<{ data: OnlineOrder[]; total: number }> {
    const where: any = { clientId };
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

  async updateStatus(id: string, status: string): Promise<OnlineOrder> {
    const order = await this.findById(id);

    const newStatus = status as OnlineOrderStatus;

    // Validate status transition if needed
    const validTransitions: Record<OnlineOrderStatus, OnlineOrderStatus[]> = {
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
    } else if (newStatus === OnlineOrderStatus.DELIVERED) {
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
    } catch (err: any) {
      this.logger.warn(`[Event] Failed to emit order.status_changed: ${err?.message}`);
    }

    // Notify the customer — fire-and-forget so a slow provider never blocks
    // the status update itself.
    this.notifyOrderStatusUpdate(saved).catch((err: any) =>
      this.logger.warn(`[Notify] Failed to send order status update: ${err?.message}`),
    );

    return saved;
  }

  // ─── Customer notification on status change ──────────────────────────────────

  private static readonly STATUS_LABELS: Record<string, string> = {
    [OnlineOrderStatus.PENDING_PAYMENT]: 'Payment Pending',
    [OnlineOrderStatus.PAYMENT_CONFIRMED]: 'Payment Confirmed',
    [OnlineOrderStatus.PROCESSING]: 'Processing',
    [OnlineOrderStatus.PACKED]: 'Packed',
    [OnlineOrderStatus.SHIPPED]: 'Shipped',
    [OnlineOrderStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [OnlineOrderStatus.DELIVERED]: 'Delivered',
    [OnlineOrderStatus.RETURN_REQUESTED]: 'Return Requested',
    [OnlineOrderStatus.RETURNED]: 'Returned',
    [OnlineOrderStatus.CANCELLED]: 'Cancelled',
  };

  private async notifyOrderStatusUpdate(order: OnlineOrder): Promise<void> {
    // Don't spam on the initial creation — only notify once the order moves
    // past payment-pending into a meaningful state.
    if (order.status === OnlineOrderStatus.PENDING_PAYMENT) return;

    const customerPhone = order.shippingAddress?.phone ?? order.client?.phone ?? null;
    const customerEmail = order.client?.email ?? null;
    if (!customerPhone && !customerEmail) {
      this.logger.log(`[Notify] Order ${order.orderNumber}: no customer contact — skipped`);
      return;
    }

    const vars: Record<string, string> = {
      name: order.shippingAddress?.name ?? 'Customer',
      orderNumber: order.orderNumber,
      status: OnlineOrderService.STATUS_LABELS[order.status] ?? order.status,
      amount: Number(order.totalAmount ?? 0).toFixed(2),
    };

    const userId = order.clientId ?? undefined;

    if (customerEmail) {
      await this.notificationService.sendEmail({
        userId,
        to: customerEmail,
        type: 'order_status',
        templateKey: 'order_status',
        templateVars: vars,
        metadata: { orderId: order.id, orderNumber: order.orderNumber, status: order.status },
      });
    }

    if (customerPhone) {
      await this.notificationService.sendWhatsApp({
        userId,
        to: customerPhone,
        type: 'order_status',
        templateKey: 'order_status',
        templateVars: vars,
        metadata: { orderId: order.id, orderNumber: order.orderNumber, status: order.status },
      });
    }
  }

  // ─── Cancel an order (convenience wrapper) ───────────────────────────────────

  async cancelOrder(id: string): Promise<OnlineOrder> {
    return this.updateStatus(id, OnlineOrderStatus.CANCELLED);
  }

  // ─── Get order with items and payment details (for public access) ────────────

  async getPublicOrderSummary(id: string): Promise<{
    id: string;
    orderNumber: string;
    status: OnlineOrderStatus;
    totalAmount: number;
    shippingAddress: any;
    trackingNumber: string | null;
    courier: string | null;
    orderedAt: Date;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    payments: Array<{ id: string; method: string; amount: number; status: string }>;
  }> {
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

  async findAll(
    page: number = 1,
    limit: number = 20,
    options?: FindAllOptions,
  ): Promise<{ data: OnlineOrder[]; total: number }> {
    const where: any = {};

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
}
