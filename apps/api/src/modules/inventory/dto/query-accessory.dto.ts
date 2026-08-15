import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ACCESSORY_CATEGORIES, AccessoryCategory } from './create-accessory.dto';

export class QueryAccessoryDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  @IsEnum(ACCESSORY_CATEGORIES)
  category?: AccessoryCategory;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by brand ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;
}