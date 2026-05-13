import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { ExchangeDevice } from './entities/exchange-device.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeDevice, InventoryItem])],
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
