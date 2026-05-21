import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from '../sales/entities/payment.entity';
import { OnlineOrder } from '../sales/entities/online-order.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment, OnlineOrder]),
    NotificationModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
