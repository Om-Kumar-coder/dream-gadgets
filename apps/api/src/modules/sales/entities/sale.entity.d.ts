import { Branch, User } from '../../auth/entities/user.entity';
import { SaleItem } from './sale-item.entity';
import { Payment } from './payment.entity';
export declare class Sale {
    id: string;
    invoiceNumber: string;
    clientId: string | null;
    branch: Branch;
    branchId: string;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paymentStatus: string;
    saleType: string;
    notes: string | null;
    createdBy: User;
    createdById: string;
    saleDate: Date;
    isVoided: boolean;
    voidedById: string | null;
    voidedAt: Date | null;
    items: SaleItem[];
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=sale.entity.d.ts.map