import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { Client } from '../../client/entities/client.entity';
import { Branch, User } from '../../auth/entities/user.entity';
import { Payment } from './payment.entity';
import { OnlineOrderItem } from './online-order-item.entity';
export declare class OnlineOrder {
    id: string;
    orderNumber: string;
    client: Client | null;
    clientId: string | null;
    branch: Branch;
    branchId: string;
    status: OnlineOrderStatus;
    subtotal: number;
    shippingCharge: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    shippingAddress: {
        name: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    trackingNumber: string | null;
    courier: string | null;
    notes: string | null;
    assignedTo: User | null;
    assignedToId: string | null;
    orderedAt: Date;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    items: OnlineOrderItem[];
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=online-order.entity.d.ts.map