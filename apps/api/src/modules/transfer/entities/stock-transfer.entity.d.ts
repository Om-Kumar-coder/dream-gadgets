import { Branch, User } from '../../auth/entities/user.entity';
import { StockTransferItem } from './stock-transfer-item.entity';
export declare class StockTransfer {
    id: string;
    transferNumber: string;
    fromBranch: Branch;
    fromBranchId: string;
    toBranch: Branch;
    toBranchId: string;
    status: string;
    notes: string | null;
    initiatedBy: User;
    initiatedById: string;
    receivedBy: User;
    receivedById: string | null;
    initiatedAt: Date;
    receivedAt: Date | null;
    rejectionReason: string | null;
    items: StockTransferItem[];
    createdAt: Date;
}
//# sourceMappingURL=stock-transfer.entity.d.ts.map