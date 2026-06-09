import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ReturnController } from './return.controller';
import { ReturnService } from './return.service';
import { Return } from './entities/return.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Payment } from '../sales/entities/payment.entity';
import { EventsModule } from '../../common/events/events.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Return, Sale, SaleItem, Purchase, InventoryItem, Payment]),
    EventsModule,
  ],
  controllers: [ReturnController],
  providers: [ReturnService],
  exports: [ReturnService],
})
export class ReturnModule {}
