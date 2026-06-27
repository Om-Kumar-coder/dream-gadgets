import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsIn,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaleItemDto {
  @ApiProperty({ description: 'Inventory item UUID' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'Unit selling price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Item-level discount amount', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax rate percentage', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'HSN code for GST' })
  @IsOptional()
  @IsString()
  hsnCode?: string;
}

export class SaleAccessoryItemDto {
  @ApiProperty({ description: 'Accessory UUID' })
  @IsUUID()
  accessoryId: string;

  @ApiProperty({ description: 'Quantity of this accessory', default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number = 1;

  @ApiProperty({ description: 'Unit selling price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Item-level discount amount', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax rate percentage', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'HSN code for GST' })
  @IsOptional()
  @IsString()
  hsnCode?: string;
}

export class PaymentSplitDto {
  @ApiProperty({ description: 'Payment method', enum: ['cash', 'card', 'online', 'exchange', 'advance', 'bajaj_emi'] })
  @IsIn(['cash', 'card', 'online', 'exchange', 'advance', 'bajaj_emi'])
  method: string;

  @ApiProperty({ description: 'Amount for this payment split' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Reference number (UPI/NEFT/card)' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Additional note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'EMI plan details (for bajaj_emi)' })
  @IsOptional()
  emiPlan?: object;
}

export class CreateSaleDto {
  @ApiProperty({ description: 'Branch UUID' })
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({ description: 'Client UUID (optional for walk-in)' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({ description: 'Sale items', type: [SaleItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiPropertyOptional({ description: 'Accessory items', type: [SaleAccessoryItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleAccessoryItemDto)
  accessoryItems?: SaleAccessoryItemDto[];

  @ApiProperty({ description: 'Payment splits', type: [PaymentSplitDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentSplitDto)
  payments: PaymentSplitDto[];

  @ApiPropertyOptional({ description: 'Sale-level discount amount', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Whether this is an inter-state sale (IGST)', default: false })
  @IsOptional()
  @IsBoolean()
  isInterState?: boolean;

  @ApiPropertyOptional({ description: 'Sale type', enum: ['in-store', 'online'], default: 'in-store' })
  @IsOptional()
  @IsIn(['in-store', 'online'])
  saleType?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
