import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
export declare class CouponController {
    private readonly couponService;
    constructor(couponService: CouponService);
    validate(dto: ValidateCouponDto): Promise<{
        valid: boolean;
        coupon?: import("./entities/coupon.entity").Coupon;
        discount?: number;
        message: string;
    }>;
    create(dto: CreateCouponDto, user: any): Promise<import("./entities/coupon.entity").Coupon>;
    findAll(query: QueryCouponDto): Promise<{
        data: import("./entities/coupon.entity").Coupon[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("./entities/coupon.entity").Coupon>;
    update(id: string, dto: UpdateCouponDto): Promise<import("./entities/coupon.entity").Coupon>;
    toggleActive(id: string): Promise<import("./entities/coupon.entity").Coupon>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=coupon.controller.d.ts.map