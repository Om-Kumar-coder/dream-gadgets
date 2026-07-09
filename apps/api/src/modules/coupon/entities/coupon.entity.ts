import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'bogo';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 20 })
  type: CouponType;

  /** For percentage: the percent (e.g. 10 = 10%). For fixed_amount: the rupee amount */
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  value: number;

  /** Minimum order subtotal required to apply this coupon */
  @Column('decimal', { name: 'min_order_amount', precision: 12, scale: 2, default: 0 })
  minOrderAmount: number;

  /** Maximum discount this coupon can give (for percentage coupons) */
  @Column('decimal', { name: 'max_discount', precision: 12, scale: 2, nullable: true })
  maxDiscount: number | null;

  /** Total times this coupon can be used across all users */
  @Column({ name: 'usage_limit', default: 0 })
  usageLimit: number;

  /** How many times a single user can use this coupon */
  @Column({ name: 'per_user_limit', default: 1 })
  perUserLimit: number;

  /** Running count of how many times the coupon has been used */
  @Column({ name: 'used_count', default: 0 })
  usedCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  /** Optional: comma-separated list of brand IDs this coupon applies to (empty = all) */
  @Column({ name: 'applicable_brands', type: 'text', nullable: true })
  applicableBrands: string | null;

  /** Optional: comma-separated list of category slugs this coupon applies to (empty = all) */
  @Column({ name: 'applicable_categories', type: 'text', nullable: true })
  applicableCategories: string | null;

  /** For BOGO: the accessory/product SKU that is free when buying a phone */
  @Column({ name: 'free_item_sku', length: 100, nullable: true })
  freeItemSku: string | null;

  /** Internal description / admin notes */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true, type: 'varchar' })
  createdById: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
