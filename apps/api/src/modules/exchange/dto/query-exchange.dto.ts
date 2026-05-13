import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryExchangeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() modelId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() condition?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() addedToInventory?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) page?: number = 1;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) limit?: number = 20;
}
