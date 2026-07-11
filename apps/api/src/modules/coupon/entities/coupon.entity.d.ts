import { User } from '../../auth/entities/user.entity';
export type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'bogo';
export declare class Coupon {
    id: string;
    code: string;
    type: CouponType;
    /** For percentage: the percent (e.g. 10 = 10%). For fixed_amount: the rupee amount */
    value: number;
    /** Minimum order subtotal required to apply this coupon */
    minOrderAmount: number;
    /** Maximum discount this coupon can give (for percentage coupons) */
    maxDiscount: number | null;
    /** Total times this coupon can be used across all users */
    usageLimit: number;
    /** How many times a single user can use this coupon */
    perUserLimit: number;
    /** Running count of how many times the coupon has been used */
    usedCount: number;
    isActive: boolean;
    startsAt: Date | null;
    expiresAt: Date | null;
    /** Optional: comma-separated list of brand IDs this coupon applies to (empty = all) */
    applicableBrands: string | null;
    /** Optional: comma-separated list of category slugs this coupon applies to (empty = all) */
    applicableCategories: string | null;
    /** For BOGO: the accessory/product SKU that is free when buying a phone */
    freeItemSku: string | null;
    /** Internal description / admin notes */
    description: string | null;
    createdBy: User;
    createdById: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=coupon.entity.d.ts.map