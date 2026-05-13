import { IsString, IsNotEmpty, IsArray, IsUUID, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() fromBranchId: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() toBranchId: string;
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMinSize(1) @IsUUID('all', { each: true }) itemIds: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
