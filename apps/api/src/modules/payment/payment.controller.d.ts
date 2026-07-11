import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
declare class CreateRazorpayOrderDto {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
}
declare class VerifyPaymentDto {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
}
declare class CreateRefundDto {
    paymentId: string;
    amount?: number;
    notes?: Record<string, string>;
}
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createPublicOrder(dto: CreateRazorpayOrderDto, req: any): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        receipt?: string;
    }>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string, body: any): Promise<{
        processed: boolean;
        message: string;
    }>;
    verifyPayment(dto: VerifyPaymentDto): Promise<{
        verified: boolean;
        payment: import("../sales/entities/payment.entity").Payment;
        order: import("../sales/entities/online-order.entity").OnlineOrder;
    }>;
    createRefund(dto: CreateRefundDto): Promise<{
        refundId: string;
        amount: number;
        status: string;
    }>;
    findById(id: string): Promise<import("../sales/entities/payment.entity").Payment>;
    findBySaleId(saleId: string): Promise<import("../sales/entities/payment.entity").Payment[]>;
    findRefundsNeedingAction(): Promise<any[]>;
    retryRefund(paymentId: string, amount: string | undefined, user: any): Promise<{
        refundId: string;
        amount: number;
        status: string;
    }>;
}
export {};
//# sourceMappingURL=payment.controller.d.ts.map