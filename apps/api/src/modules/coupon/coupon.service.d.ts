import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
export declare class CouponService {
    private couponRepo;
    constructor(couponRepo: Repository<Coupon>);
    create(dto: CreateCouponDto, userId: string): Promise<Coupon>;
    findAll(query: QueryCouponDto): Promise<{
        data: Coupon[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<Coupon>;
    update(id: string, dto: UpdateCouponDto): Promise<Coupon>;
    toggleActive(id: string): Promise<Coupon>;
    remove(id: string): Promise<void>;
    validate(dto: ValidateCouponDto): Promise<{
        valid: boolean;
        coupon?: Coupon;
        discount?: number;
        message: string;
    }>;
    recordUsage(code: string): Promise<void>;
}
//# sourceMappingURL=coupon.service.d.ts.map