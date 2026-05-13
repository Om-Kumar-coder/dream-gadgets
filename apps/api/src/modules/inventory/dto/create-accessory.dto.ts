import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsEnum, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const ACCESSORY_CATEGORIES = [
  'charger',
  'case',
  'screen_guard',
  'earphones',
  'cable',
  'power_bank',
  'stand',
  'cleaning_kit',
  'tempered_glass',
  'adapter',
] as const;

export type AccessoryCategory = typeof ACCESSORY_CATEGORIES[number];

export class CreateAccessoryDto {
  @ApiProperty({ description: 'Unique SKU for the accessory' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Name of the accessory' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the accessory' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Brand ID (optional)' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Model ID (optional)' })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiProperty({ description: 'Category of accessory' })
  @IsString()
  @IsEnum(ACCESSORY_CATEGORIES)
  category: AccessoryCategory;

  @ApiProperty({ description: 'Purchase price' })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiPropertyOptional({ description: 'Selling price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({ description: 'Wholesale price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wholesalePrice?: number;

  @ApiPropertyOptional({ description: 'Initial stock quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'Reorder level for low stock alert' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderLevel?: number;

  @ApiPropertyOptional({ description: 'HSN code for GST' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ description: 'Tax rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Specs as JSON object' })
  @IsOptional()
  specs?: object;

  @ApiPropertyOptional({ description: 'Photos as JSON array' })
  @IsOptional()
  photos?: object;
}