import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Payment } from './entities/payment.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Branch } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Payment, InventoryItem, Branch])],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
