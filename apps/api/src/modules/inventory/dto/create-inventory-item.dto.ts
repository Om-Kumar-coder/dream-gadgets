import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @ApiProperty({ description: '15-digit IMEI number' })
  @IsString()
  @IsNotEmpty()
  imei: string;

  @ApiPropertyOptional({ description: 'Secondary IMEI for dual-SIM devices' })
  @IsOptional()
  @IsString()
  imei2: string;

  @ApiProperty()
  @IsUUID()
  brandId: string;

  @ApiProperty()
  @IsUUID()
  modelId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  colour: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storage: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ram: string;

  @ApiProperty({ description: 'with_box | without_box | accessories_only' })
  @IsString()
  @IsNotEmpty()
  boxType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pkuCode: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  batteryHealth: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryOfOrigin: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hsnCode: string;

  @ApiProperty({ description: 'sealed_pack | open_box | super_mint | mint | good' })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  itemName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  firstInvoiceDate: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  purchasePrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  wholesalePrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  boxPrice: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxRate: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sellingPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  onlinePrice: number;

  @ApiProperty()
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional()
  @IsOptional()
  accessories: object;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warrantyStatus: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  birthdayOffer: boolean;
}
