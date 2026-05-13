import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayMinSize, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ description: 'Array of inventory item IDs to link to this purchase', type: [String] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one inventory item must be provided' })
  @IsUUID('all', { each: true })
  itemIds: string[];

  @ApiPropertyOptional({ description: 'Tax amount for the purchase' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Notes or remarks' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Purchase status', default: 'completed' })
  @IsOptional()
  @IsString()
  status?: string;
}
