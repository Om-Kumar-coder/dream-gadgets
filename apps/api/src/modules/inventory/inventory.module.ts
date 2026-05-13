import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { ItemPhoto } from './entities/item-photo.entity';
import { Brand } from './entities/brand.entity';
import { Model } from './entities/model.entity';
import { Branch } from './entities/branch.entity';
import { Accessory } from './entities/accessory.entity';
import { AccessoryModule } from './accessory.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([InventoryItem, ItemPhoto, Brand, Model, Branch, Accessory]),
    AccessoryModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService, AccessoryModule],
})
export class InventoryModule implements OnModuleInit {
  constructor(private readonly inventoryService: InventoryService) {}

  async onModuleInit() {
    // Optionally wire up BullMQ search queue if available
    try {
      const { Queue } = await import('bullmq');
      const { createClient } = await import('redis');
      // Try to get Redis URL from env
      const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
      const connection = { url: redisUrl };
      const queue = new Queue('search', { connection } as any);
      this.inventoryService.setSearchQueue(queue);
    } catch {
      // BullMQ or Redis not available — search queue disabled
    }
  }
}
