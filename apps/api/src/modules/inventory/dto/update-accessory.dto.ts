import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsEnum, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ACCESSORY_CATEGORIES, AccessoryCategory } from './create-accessory.dto';

export class UpdateAccessoryDto {
  @ApiPropertyOptional({ description: 'SKU (must be unique)' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Name of the accessory' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the accessory' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Model ID' })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiPropertyOptional({ description: 'Category of accessory' })
  @IsOptional()
  @IsString()
  @IsEnum(ACCESSORY_CATEGORIES)
  category?: AccessoryCategory;

  @ApiPropertyOptional({ description: 'Purchase price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

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

  @ApiPropertyOptional({ description: 'Stock quantity adjustment' })
  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'Reorder level' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderLevel?: number;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Is online' })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({ description: 'HSN code' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ description: 'Tax rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Specs' })
  @IsOptional()
  specs?: object;

  @ApiPropertyOptional({ description: 'Photos' })
  @IsOptional()
  photos?: object;
}