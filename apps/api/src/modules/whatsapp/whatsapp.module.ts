import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappAppointmentService } from './whatsapp-appointment.service';
import { WhatsappConversation } from './entities/whatsapp-conversation.entity';
import { WhatsappMessage } from './entities/whatsapp-message.entity';
import { WhatsappTemplate } from './entities/whatsapp-template.entity';
import { WhatsappCampaign } from './entities/whatsapp-campaign.entity';
import { WhatsappAppointment } from './entities/whatsapp-appointment.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      WhatsappConversation,
      WhatsappMessage,
      WhatsappTemplate,
      WhatsappCampaign,
      WhatsappAppointment,
    ]),
    NotificationModule,
  ],
  controllers: [WhatsappController, WhatsappWebhookController],
  providers: [WhatsappService, WhatsappTemplateService, WhatsappAppointmentService],
  exports: [WhatsappService, WhatsappTemplateService, WhatsappAppointmentService],
})
export class WhatsappModule {}
