import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem, InventoryItem])],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
