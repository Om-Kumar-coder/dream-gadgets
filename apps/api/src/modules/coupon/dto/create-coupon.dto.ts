import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const COUPON_TYPES = ['percentage', 'fixed_amount', 'free_shipping', 'bogo'] as const;

export class CreateCouponDto {
  @ApiProperty({ description: 'Coupon code (user-facing, unique)' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Discount type', enum: COUPON_TYPES })
  @IsIn(COUPON_TYPES)
  type: string;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Minimum order amount to apply', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Max discount cap (for percentage coupons)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Total usage limit (0 = unlimited)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Per-user usage limit', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({ description: 'Whether the coupon is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Start date (ISO string)' })
  @IsOptional()
  @IsString()
  startsAt?: string;

  @ApiPropertyOptional({ description: 'Expiry date (ISO string)' })
  @IsOptional()
  @IsString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Comma-separated brand IDs (empty = all brands)' })
  @IsOptional()
  @IsString()
  applicableBrands?: string;

  @ApiPropertyOptional({ description: 'Comma-separated category slugs (empty = all)' })
  @IsOptional()
  @IsString()
  applicableCategories?: string;

  @ApiPropertyOptional({ description: 'Free item SKU for BOGO coupons' })
  @IsOptional()
  @IsString()
  freeItemSku?: string;

  @ApiPropertyOptional({ description: 'Internal description / notes' })
  @IsOptional()
  @IsString()
  description?: string;
}
