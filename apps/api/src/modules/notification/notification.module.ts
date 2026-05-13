import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Notification]),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
