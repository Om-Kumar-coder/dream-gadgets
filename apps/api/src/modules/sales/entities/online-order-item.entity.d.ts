import { OnlineOrder } from './online-order.entity';
export declare class OnlineOrderItem {
    id: string;
    order: OnlineOrder;
    orderId: string;
    itemId: string | null;
    imei: string | null;
    description: string | null;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    hsnCode: string | null;
}
//# sourceMappingURL=online-order-item.entity.d.ts.map