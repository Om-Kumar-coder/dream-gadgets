import { IsString, IsOptional, IsNumber, IsBoolean, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExchangeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() saleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brandId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() modelId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() imei?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colour?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() storage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() condition?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) batteryHealth?: number;
  @ApiPropertyOptional() @IsOptional() @IsObject() conditionNotes?: object;
  @ApiProperty() @IsNumber() @Min(0) exchangePrice: number;
  @ApiPropertyOptional() @IsOptional() @IsObject() photos?: object;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() kycVerified?: boolean;
}
