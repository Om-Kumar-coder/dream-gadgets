import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleReturnDto {
  @ApiProperty({ description: 'Reason for the return' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ enum: ['original_payment', 'store_credit', 'cash'] })
  @IsOptional()
  @IsIn(['original_payment', 'store_credit', 'cash'])
  refundMethod?: string;

  @ApiPropertyOptional({ description: 'Refund amount (defaults to sale total if not provided)' })
  @IsOptional()
  @IsNumber()
  refundAmount?: number;

  @ApiPropertyOptional({ description: 'Condition assessment: available or scrapped' })
  @IsOptional()
  @IsIn(['available', 'scrapped'])
  conditionAssessment?: 'available' | 'scrapped';

  @ApiPropertyOptional({ description: 'Manager override for expired return window' })
  @IsOptional()
  @IsBoolean()
  managerOverride?: boolean;

  @ApiPropertyOptional({ description: 'Approver user ID' })
  @IsOptional()
  @IsUUID()
  approvedById?: string;
}

export class CreatePurchaseReturnDto {
  @ApiProperty({ description: 'Reason for the return' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Specific item IDs to return (defaults to all)' })
  @IsOptional()
  @IsUUID('4', { each: true })
  itemIds?: string[];

  @ApiPropertyOptional({ description: 'Condition assessment: scrapped or available' })
  @IsOptional()
  @IsIn(['available', 'scrapped'])
  conditionAssessment?: 'available' | 'scrapped';
}
