import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { AdminNotificationsController } from './admin-notifications.controller';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { WhatsAppService } from './channels/whatsapp.service';
import { Notification } from './entities/notification.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Notification, User]),
    BullModule.registerQueue({
      name: 'notification',
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [
    NotificationService,
    NotificationProcessor,
    EmailService,
    SmsService,
    WhatsAppService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
