import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuybackController } from './buyback.controller';
import { BuybackService } from './buyback.service';
import { BuybackLead } from './entities/buyback-lead.entity';
import { BuybackPhoto } from './entities/buyback-photo.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([BuybackLead, BuybackPhoto]), NotificationModule],
  controllers: [BuybackController],
  providers: [BuybackService],
  exports: [BuybackService],
})
export class BuybackModule {}
