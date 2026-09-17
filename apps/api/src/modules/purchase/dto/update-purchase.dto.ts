import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePurchaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Vendor GSTIN snapshot' })
  @IsOptional()
  @IsString()
  vendorGstin?: string;

  @ApiPropertyOptional({ description: 'Vendor 2-digit GST state code' })
  @IsOptional()
  @IsString()
  vendorStateCode?: string;

  @ApiPropertyOptional({ description: 'Place of supply state code' })
  @IsOptional()
  @IsString()
  placeOfSupply?: string;

  @ApiPropertyOptional({ enum: ['intra', 'inter'] })
  @IsOptional()
  @IsIn(['intra', 'inter'])
  supplyType?: 'intra' | 'inter';

  @ApiPropertyOptional({ description: 'Reverse-charge purchase (RCM)' })
  @IsOptional()
  @IsBoolean()
  isReverseCharge?: boolean;

  @ApiPropertyOptional({ description: 'Whether this purchase carries eligible ITC' })
  @IsOptional()
  @IsBoolean()
  isItcEligible?: boolean;

  @ApiPropertyOptional({ description: 'Persisted CGST portion' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999999.99)
  cgstAmount?: number;

  @ApiPropertyOptional({ description: 'Persisted SGST/UTGST portion' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999999.99)
  sgstAmount?: number;

  @ApiPropertyOptional({ description: 'Persisted IGST portion' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999999.99)
  igstAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
