import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { ItemPhoto } from './entities/item-photo.entity';
import { Brand } from './entities/brand.entity';
import { Model } from './entities/model.entity';
import { Accessory } from './entities/accessory.entity';
import { AccessoryModule } from './accessory.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([InventoryItem, ItemPhoto, Brand, Model, Accessory]),
    AccessoryModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService, AccessoryModule],
})
// BUG-18: the OnModuleInit hook here created a 'search' BullMQ queue whose
// jobs were consumed by nobody — the producer side has been removed along
// with InventoryService.setSearchQueue.
export class InventoryModule {}
