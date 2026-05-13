import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateInventoryItemDto } from './create-inventory-item.dto';

export class UpdateInventoryItemDto extends PartialType(CreateInventoryItemDto) {
  @ApiPropertyOptional({ description: 'New status for state machine transition' })
  @IsOptional()
  @IsString()
  status: string;
}
