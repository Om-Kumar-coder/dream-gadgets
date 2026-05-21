import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { OrdersController } from './orders.controller';
import { SalesService } from './sales.service';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Payment } from './entities/payment.entity';
import { OnlineOrder } from './entities/online-order.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Branch } from '../auth/entities/user.entity';
import { OnlineOrderService } from './online-order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Payment, OnlineOrder, InventoryItem, Branch])],
  controllers: [SalesController, OrdersController],
  providers: [SalesService, OnlineOrderService],
  exports: [SalesService, OnlineOrderService],
})
export class SalesModule {}
