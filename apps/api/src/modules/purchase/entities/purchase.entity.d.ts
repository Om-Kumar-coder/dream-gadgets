import { Branch, User } from '../../auth/entities/user.entity';
export declare class Purchase {
    id: string;
    invoiceNumber: string;
    vendorId: string | null;
    vendorName: string;
    branch: Branch;
    branchId: string;
    totalAmount: number;
    taxAmount: number;
    notes: string | null;
    status: string;
    createdBy: User;
    createdById: string;
    purchaseDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=purchase.entity.d.ts.map