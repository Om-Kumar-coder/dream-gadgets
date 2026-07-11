import { Sale } from './sale.entity';
import { OnlineOrder } from './online-order.entity';
export declare class Payment {
    id: string;
    sale: Sale;
    saleId: string | null;
    onlineOrder: OnlineOrder;
    onlineOrderId: string | null;
    method: string;
    amount: number;
    reference: string | null;
    note: string | null;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    razorpaySignature: string | null;
    status: string;
    emiPlan: object | null;
    createdAt: Date;
    razorpayRefundId: string | null;
    refundAmount: number | null;
    refundStatus: string | null;
    refundedAt: Date | null;
}
//# sourceMappingURL=payment.entity.d.ts.map