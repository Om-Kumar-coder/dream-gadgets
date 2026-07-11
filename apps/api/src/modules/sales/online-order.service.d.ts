import { Repository, DataSource } from 'typeorm';
import { OnlineOrder } from './entities/online-order.entity';
import { OnlineOrderItem } from './entities/online-order-item.entity';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { EventService } from '../../common/events/event.service';
export interface CreateOnlineOrderDto {
    clientId?: string;
    branchId: string;
    items: Array<{
        itemId: string;
        imei?: string | null;
        description: string;
        unitPrice: number;
        quantity?: number;
        taxRate?: number;
        taxAmount?: number;
        hsnCode?: string;
    }>;
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
export declare class OnlineOrderService {
    private readonly orderRepo;
    private readonly orderItemRepo;
    private readonly dataSource;
    private readonly eventService;
    private readonly logger;
    constructor(orderRepo: Repository<OnlineOrder>, orderItemRepo: Repository<OnlineOrderItem>, dataSource: DataSource, eventService: EventService);
    private generateOrderNumber;
    create(dto: CreateOnlineOrderDto): Promise<OnlineOrder>;
    findById(id: string): Promise<OnlineOrder>;
    findByClientId(clientId: string, page?: number, limit?: number, status?: string, search?: string): Promise<{
        data: OnlineOrder[];
        total: number;
    }>;
    updateStatus(id: string, status: string): Promise<OnlineOrder>;
    cancelOrder(id: string): Promise<OnlineOrder>;
    getPublicOrderSummary(id: string): Promise<{
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
        payments: Array<{
            id: string;
            method: string;
            amount: number;
            status: string;
        }>;
    }>;
    findAll(page?: number, limit?: number, options?: FindAllOptions): Promise<{
        data: OnlineOrder[];
        total: number;
    }>;
}
//# sourceMappingURL=online-order.service.d.ts.map