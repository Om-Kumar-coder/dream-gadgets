import { IsArray, IsDefined, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePurchaseDto } from './create-purchase.dto';

/**
 * One inventory unit in the combined Add-Stock payload (P1-5).
 * Mirrors CreateInventoryUnitDto in purchase.service.ts but as a
 * class-validator DTO so the global ValidationPipe (whitelist: true)
 * keeps the fields instead of stripping them.
 */
export class CreateInventoryUnitFieldsDto {
  @ApiProperty({ description: 'IMEI (Luhn-validated, 15 digits)' })
  @IsString()
  imei: string;

  @ApiPropertyOptional({ description: 'Second IMEI (dual-SIM devices)' })
  @IsOptional()
  @IsString()
  imei2?: string;

  @ApiProperty({ description: 'Brand ID' })
  @IsString()
  brandId: string;

  @ApiProperty({ description: 'Model ID' })
  @IsString()
  modelId: string;

  @ApiPropertyOptional({ description: 'Colour' })
  @IsOptional()
  @IsString()
  colour?: string;

  @ApiPropertyOptional({ description: 'Storage capacity (e.g. 128GB)' })
  @IsOptional()
  @IsString()
  storage?: string;

  @ApiPropertyOptional({ description: 'RAM (e.g. 8GB)' })
  @IsOptional()
  @IsString()
  ram?: string;

  @ApiProperty({ description: 'Box type (with_box / without_box / accessories_only)' })
  @IsString()
  boxType: string;

  @ApiProperty({ description: 'Condition (sealed_pack / open_box / super_mint / mint / good)' })
  @IsString()
  condition: string;

  @ApiPropertyOptional({ description: 'Display name override for the unit' })
  @IsOptional()
  @IsString()
  itemName?: string;

  @ApiPropertyOptional({ description: 'First-invoice date (ISO) — drives warranty expiry' })
  @IsOptional()
  @IsString()
  firstInvoiceDate?: string;

  @ApiProperty({ description: 'Purchase price (taxable)' })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiPropertyOptional({ description: 'GST rate in percent (0-28)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Tax amount for the unit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Battery health percent (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  batteryHealth?: number;

  @ApiPropertyOptional({ description: 'PKU code' })
  @IsOptional()
  @IsString()
  pkuCode?: string;

  @ApiPropertyOptional({ description: 'Country of origin' })
  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @ApiPropertyOptional({ description: 'HSN/SAC code' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ description: 'Notes or remarks' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * POST /purchases/with-inventory body: the purchase record AND its inventory
 * units in one transactional request (Add Stock flow).
 */
export class CreatePurchaseWithStockDto extends CreatePurchaseDto {
  @ApiProperty({
    description: 'Inventory units to create and link to this purchase (Add Stock flow)',
    type: [CreateInventoryUnitFieldsDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryUnitFieldsDto)
  inventoryUnits!: CreateInventoryUnitFieldsDto[];
}
