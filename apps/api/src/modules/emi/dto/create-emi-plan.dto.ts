import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max, MinLength, MaxLength, IsUUID } from 'class-validator';

export class CreateEmiPlanDto {
  @IsUUID()
  providerId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  label: string;

  @IsNumber()
  @Min(1)
  @Max(84)
  tenureMonths: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  annualRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  processingFee?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateEmiPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  label?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(84)
  tenureMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  annualRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  processingFee?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class EmiQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  providerSlug?: string;
}

export class CalculateEmiDto {
  @IsNumber()
  @Min(0)
  principal: number;

  @IsNumber()
  @Min(1)
  @Max(84)
  tenureMonths: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  annualRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  processingFee?: number;
}
