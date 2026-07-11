import { User } from '../../auth/entities/user.entity';
export declare class Return {
    id: string;
    returnNumber: string;
    returnType: 'sale' | 'purchase';
    originalId: string;
    clientId: string | null;
    reason: string;
    refundMethod: string | null;
    refundAmount: number | null;
    refundStatus: string;
    approvedBy: User;
    approvedById: string | null;
    createdBy: User;
    createdById: string;
    createdAt: Date;
}
//# sourceMappingURL=return.entity.d.ts.map