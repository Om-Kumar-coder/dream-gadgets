import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayMinSize, ArrayMaxSize, IsUUID, IsDateString, IsNumber, Min, IsIn, IsBoolean, Matches, ValidateNested, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseItemDto {
  @ApiPropertyOptional({ description: 'Linked inventory item ID (omit for non-stock lines)' })
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiProperty({ description: 'Line description (item name, expense, service…)' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'HSN/SAC code' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ description: 'Quantity', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  quantity?: number;

  @ApiProperty({ description: 'Taxable unit price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'GST rate in percent (0-28)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(28)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Taxable value override (defaults to quantity × unitPrice)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxableValue?: number;
}

export class CreatePurchaseDto {
  @ApiProperty({ description: 'Vendor name (required)' })
  @IsString()
  @IsNotEmpty()
  vendorName: string;

  @ApiPropertyOptional({ description: 'Vendor client ID (optional FK to clients)' })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiProperty({ description: 'Branch ID where purchase is recorded' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ description: 'Purchase date (ISO date string)' })
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({
    description: 'Array of inventory item IDs to link to this purchase (required unless items are provided)',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('all', { each: true })
  itemIds?: string[];

  @ApiPropertyOptional({ description: 'Tax amount for the purchase (defaults to Σ line tax when items provided)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Vendor GSTIN (validated; first 2 digits set the vendor state code)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/, {
    message: 'Vendor GSTIN format is invalid',
  })
  vendorGstin?: string;

  @ApiPropertyOptional({ description: 'Vendor 2-digit GST state code (explicit override)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}$/, { message: 'vendorStateCode must be a 2-digit GST state code' })
  vendorStateCode?: string;

  @ApiPropertyOptional({ description: 'Place of supply state code (defaults to vendor state code)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}$/, { message: 'placeOfSupply must be a 2-digit GST state code' })
  placeOfSupply?: string;

  @ApiPropertyOptional({
    description: 'Manual supply type override. When omitted, derived from branch vs vendor state; if derivation is unresolved and tax > 0, creation is rejected.',
    enum: ['intra', 'inter'],
  })
  @IsOptional()
  @IsIn(['intra', 'inter'])
  supplyType?: 'intra' | 'inter';

  @ApiPropertyOptional({ description: 'Reverse-charge purchase (RCM)', default: false })
  @IsOptional()
  @IsBoolean()
  isReverseCharge?: boolean;

  @ApiPropertyOptional({ description: 'Whether this purchase carries eligible ITC', default: true })
  @IsOptional()
  @IsBoolean()
  isItcEligible?: boolean;

  @ApiPropertyOptional({
    description: 'Line items (preferred). When omitted, lines are auto-created from itemIds for back-compat.',
    type: [CreatePurchaseItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items?: CreatePurchaseItemDto[];

  @ApiPropertyOptional({ description: 'Notes or remarks' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Purchase status', default: 'completed' })
  @IsOptional()
  @IsString()
  status?: string;
}
