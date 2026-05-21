import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { OnlineOrder } from './entities/online-order.entity';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';

export interface CreateOnlineOrderDto {
  clientId?: string;
  branchId: string;
  items: Array<{ itemId: string; unitPrice: number; quantity?: number }>;
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
  constructor(
    @InjectRepository(OnlineOrder)
    private readonly orderRepo: Repository<OnlineOrder>,
    private readonly dataSource: DataSource,
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

    return this.orderRepo.save(order);
  }

  // ─── Get order by ID ──────────────────────────────────────────────────────────

  async findById(id: string): Promise<OnlineOrder> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['client', 'branch', 'payments'],
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

    order.status = newStatus;

    // Update timestamp columns based on status
    if (newStatus === OnlineOrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    } else if (newStatus === OnlineOrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    return this.orderRepo.save(order);
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
