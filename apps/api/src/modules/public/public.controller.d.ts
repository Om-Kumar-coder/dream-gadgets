import { DataSource } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { SearchService } from '../search/search.service';
import { RedisService } from '../../common/redis/redis.service';
import { OnlineOrderService } from '../sales/online-order.service';
import { PaymentService } from '../payment/payment.service';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
declare class ContactInquiryDto {
    name: string;
    phone: string;
    email?: string;
    message: string;
}
declare class CreatePublicOrderDto {
    clientId?: string;
    items: Array<{
        itemId: string;
        imei?: string | null;
        description: string;
        unitPrice: number;
        quantity?: number;
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
}
export declare class PublicController {
    private readonly searchService;
    private readonly onlineOrderService;
    private readonly paymentService;
    private readonly adminService;
    private readonly redisService;
    private readonly dataSource;
    constructor(searchService: SearchService, onlineOrderService: OnlineOrderService, paymentService: PaymentService, adminService: AdminService, redisService: RedisService, dataSource: DataSource);
    health(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
    }>;
    getProducts(query: Record<string, any>): Promise<any>;
    getProduct(id: string): Promise<{
        data: any;
    }>;
    getRelatedProducts(id: string): Promise<{
        data: any[];
    }>;
    createOrder(dto: CreatePublicOrderDto, req: any): Promise<{
        data: import("../sales/entities/online-order.entity").OnlineOrder;
    }>;
    getOrder(id: string): Promise<{
        data: {
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
        };
    }>;
    cancelOrder(id: string, req: any): Promise<{
        data: import("../sales/entities/online-order.entity").OnlineOrder;
        refund: {
            refundId: string;
            amount: number;
            status: string;
        } | undefined;
    }>;
    getUserOrders(req: any, query: Record<string, any>): Promise<{
        data: {
            data: import("../sales/entities/online-order.entity").OnlineOrder[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getBanners(pageType: string, position: string, deviceType?: string): Promise<import("../admin/entities/banner.entity").Banner[]>;
    getAllActiveBanners(pageType: string): Promise<{
        slider: import("../admin/entities/banner.entity").Banner[];
        middle: import("../admin/entities/banner.entity").Banner[];
        bottom: import("../admin/entities/banner.entity").Banner[];
        offer: import("../admin/entities/banner.entity").Banner[];
    }>;
    trackBannerClick(id: string): Promise<{
        status: string;
    }>;
    submitContact(dto: ContactInquiryDto): Promise<{
        data: any;
    }>;
    trackWhatsAppClick(body: {
        source: string;
        productId?: string | null;
        phone: string;
        url: string;
        userAgent?: string | null;
        referrer?: string | null;
    }): Promise<{
        status: string;
    }>;
    getWhatsAppAnalytics(req: any, from?: string, to?: string, source?: string): Promise<{
        total: any;
        bySource: any;
        dailyTrend: any;
    }>;
    getAnnouncement(): Promise<any>;
    getBrandHero(slug: string): Promise<{
        imageUrl: string | null;
    }>;
    getUserProfile(req: any): Promise<{
        data: {
            id: any;
            firstName: any;
            lastName: any;
            email: any;
            phone: any;
            memberSince: any;
            stats: any;
        };
    }>;
}
export {};
//# sourceMappingURL=public.controller.d.ts.map