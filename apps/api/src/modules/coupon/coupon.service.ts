import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
  ) {}

  // ─── Create coupon ───────────────────────────────────────────────────────────

  async create(dto: CreateCouponDto, userId: string): Promise<Coupon> {
    const existing = await this.couponRepo.findOne({ where: { code: dto.code.toUpperCase() } });
    if (existing) {
      throw new ConflictException({
        code: 'COUPON_CODE_EXISTS',
        message: `A coupon with code "${dto.code}" already exists`,
      });
    }

    const coupon = this.couponRepo.create({
      ...dto,
      code: dto.code.toUpperCase(),
      type: dto.type as any,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      createdById: userId,
    });

    return this.couponRepo.save(coupon);
  }

  // ─── List coupons ────────────────────────────────────────────────────────────

  async findAll(query: QueryCouponDto): Promise<{ data: Coupon[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, type, isActive } = query;

    const qb = this.couponRepo.createQueryBuilder('c')
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('(c.code ILIKE :search OR c.description ILIKE :search)', { search: `%${search}%` });
    }
    if (type) {
      qb.andWhere('c.type = :type', { type });
    }
    if (isActive !== undefined) {
      qb.andWhere('c.isActive = :isActive', { isActive: isActive === 'true' });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── Find by ID ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return coupon;
  }

  // ─── Update coupon ───────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findById(id);

    if (dto.code && dto.code.toUpperCase() !== coupon.code) {
      const existing = await this.couponRepo.findOne({ where: { code: dto.code.toUpperCase() } });
      if (existing) {
        throw new ConflictException({
          code: 'COUPON_CODE_EXISTS',
          message: `A coupon with code "${dto.code}" already exists`,
        });
      }
    }

    Object.assign(coupon, {
      ...dto,
      code: dto.code ? dto.code.toUpperCase() : coupon.code,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : coupon.startsAt,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : coupon.expiresAt,
    });

    return this.couponRepo.save(coupon);
  }

  // ─── Toggle active ──────────────────────────────────────────────────────────

  async toggleActive(id: string): Promise<Coupon> {
    const coupon = await this.findById(id);
    coupon.isActive = !coupon.isActive;
    return this.couponRepo.save(coupon);
  }

  // ─── Delete coupon ──────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    const coupon = await this.findById(id);
    await this.couponRepo.remove(coupon);
  }

  // ─── Validate coupon against a cart ─────────────────────────────────────────

  async validate(dto: ValidateCouponDto): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount?: number;
    message: string;
  }> {
    const code = dto.code.toUpperCase();
    const coupon = await this.couponRepo.findOne({ where: { code } });

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'This coupon is no longer active' };
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon has reached its usage limit' };
    }

    // Note: per-user limit check requires a coupon_usage table to track which user
    // used which coupon. This is a future enhancement — for now, the usageLimit
    // (total uses across all users) is enforced via usedCount.

    // Check date validity
    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return { valid: false, message: 'This coupon is not yet valid' };
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return { valid: false, message: 'This coupon has expired' };
    }

    // Check minimum order amount
    if (dto.subtotal < Number(coupon.minOrderAmount)) {
      return {
        valid: false,
        message: `Minimum order amount of ₹${Number(coupon.minOrderAmount).toLocaleString('en-IN')} required`,
      };
    }

    // Calculate discount
    let discount = 0;
    switch (coupon.type) {
      case 'percentage': {
        discount = (dto.subtotal * Number(coupon.value)) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, Number(coupon.maxDiscount));
        }
        break;
      }
      case 'fixed_amount': {
        discount = Number(coupon.value);
        break;
      }
      case 'free_shipping': {
        // For now, treat as a fixed discount estimate
        discount = 0; // Shipping cost is calculated separately
        break;
      }
      case 'bogo': {
        // BOGO is handled at the item level — no automatic discount here
        discount = 0;
        break;
      }
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount * 100) / 100,
      message: `Coupon "${coupon.code}" applied! You saved ₹${Math.round(discount).toLocaleString('en-IN')}`,
    };
  }

  // ─── Increment usage count (called when a sale uses this coupon) ────────────

  async recordUsage(code: string): Promise<void> {
    await this.couponRepo.increment({ code: code.toUpperCase() }, 'usedCount', 1);
  }
}
