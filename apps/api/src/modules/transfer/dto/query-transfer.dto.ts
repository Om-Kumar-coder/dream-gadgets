import { IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTransferDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fromBranchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() toBranchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['draft', 'initiated', 'in_transit', 'received', 'rejected']) status?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) page?: number = 1;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) limit?: number = 20;
}
