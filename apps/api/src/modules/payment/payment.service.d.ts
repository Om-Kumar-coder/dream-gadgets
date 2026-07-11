import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../sales/entities/payment.entity';
import { OnlineOrder } from '../sales/entities/online-order.entity';
import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../../common/redis/redis.service';
import { EventService } from '../../common/events/event.service';
export declare class PaymentService {
    private paymentRepo;
    private orderRepo;
    private configService;
    private notificationService;
    private redisService;
    private eventService;
    private readonly logger;
    constructor(paymentRepo: Repository<Payment>, orderRepo: Repository<OnlineOrder>, configService: ConfigService, notificationService: NotificationService, redisService: RedisService, eventService: EventService);
    createRazorpayOrder(params: {
        amount: number;
        currency?: string;
        receipt?: string;
        notes?: Record<string, string>;
    }): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        receipt?: string;
    }>;
    verifyWebhookSignature(payload: string, signature: string): boolean;
    handleWebhook(rawBody: string, signature: string, event: any): Promise<{
        processed: boolean;
        message: string;
    }>;
    private processWebhookEvent;
    createRefund(params: {
        paymentId: string;
        amount?: number;
        notes?: Record<string, string>;
        dbPaymentId?: string;
    }): Promise<{
        refundId: string;
        amount: number;
        status: string;
    }>;
    verifyPayment(params: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        orderId: string;
    }): Promise<{
        verified: boolean;
        payment: Payment;
        order: OnlineOrder;
    }>;
    findById(id: string): Promise<Payment>;
    private sendRefundNotifications;
    findBySaleId(saleId: string): Promise<Payment[]>;
    findRefundsNeedingAction(): Promise<any[]>;
    retryRefund(params: {
        paymentId: string;
        amount?: number;
        adminId: string;
        notes?: Record<string, string>;
    }): Promise<{
        refundId: string;
        amount: number;
        status: string;
    }>;
}
//# sourceMappingURL=payment.service.d.ts.map