import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accessory } from './entities/accessory.entity';
import { AccessoryService } from './accessory.service';
import { AccessoryController } from './accessory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Accessory])],
  controllers: [AccessoryController],
  providers: [AccessoryService],
  exports: [AccessoryService],
})
export class AccessoryModule {}