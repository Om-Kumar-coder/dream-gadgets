export declare enum ItemStatus {
    AVAILABLE = "available",
    SOLD = "sold",
    TRANSFERRED = "transferred",
    RETURNED = "returned",
    BOOKED = "booked",
    SCRAPPED = "scrapped",
    IN_CART = "in_cart"
}
export declare enum ItemCondition {
    SEALED_PACK = "sealed_pack",
    OPEN_BOX = "open_box",
    SUPER_MINT = "super_mint",
    MINT = "mint",
    GOOD = "good"
}
export declare enum BoxType {
    WITH_BOX = "with_box",
    WITHOUT_BOX = "without_box",
    ACCESSORIES_ONLY = "accessories_only"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    ONLINE = "online",
    EXCHANGE = "exchange",
    ADVANCE = "advance",
    BAJAJ_EMI = "bajaj_emi"
}
export declare enum TransferStatus {
    DRAFT = "draft",
    INITIATED = "initiated",
    IN_TRANSIT = "in_transit",
    RECEIVED = "received",
    REJECTED = "rejected"
}
export declare enum OnlineOrderStatus {
    PENDING_PAYMENT = "pending_payment",
    PAYMENT_CONFIRMED = "payment_confirmed",
    PROCESSING = "processing",
    PACKED = "packed",
    SHIPPED = "shipped",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    RETURN_REQUESTED = "return_requested",
    RETURNED = "returned"
}
export declare enum EkycStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected"
}
export declare enum CustomerType {
    WALK_IN = "walk-in",
    ONLINE = "online",
    CORPORATE = "corporate",
    DEALER = "dealer"
}
export declare enum ReturnType {
    SALE = "sale",
    PURCHASE = "purchase"
}
export declare enum NotificationChannel {
    EMAIL = "email",
    WHATSAPP = "whatsapp",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app"
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    meta?: PaginationMeta;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}
export interface PaymentSplit {
    method: PaymentMethod;
    amount: number;
    reference?: string;
    note?: string;
    exchangeDeviceId?: string;
    emiPlan?: EmiPlan;
}
export interface EmiPlan {
    tenure: number;
    downPayment: number;
    emiAmount: number;
    annualRate: number;
    provider: string;
    referenceNumber?: string;
}
export interface GstBreakdown {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    permissions: string[];
    branchId: string | null;
    iat: number;
    exp: number;
}
//# sourceMappingURL=index.d.ts.map