export declare const COUPON_TYPES: readonly ["percentage", "fixed_amount", "free_shipping", "bogo"];
export declare class CreateCouponDto {
    code: string;
    type: string;
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    isActive?: boolean;
    startsAt?: string;
    expiresAt?: string;
    applicableBrands?: string;
    applicableCategories?: string;
    freeItemSku?: string;
    description?: string;
}
//# sourceMappingURL=create-coupon.dto.d.ts.map