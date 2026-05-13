import { IsOptional, IsString, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryInventoryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  condition: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  brandId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  modelId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;
}
