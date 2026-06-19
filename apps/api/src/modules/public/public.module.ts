import { Module } from '@nestjs/common';
import { SearchModule } from '../search/search.module';
import { SalesModule } from '../sales/sales.module';
import { PaymentModule } from '../payment/payment.module';
import { AdminModule } from '../admin/admin.module';
import { PublicController } from './public.controller';

@Module({
  imports: [SearchModule, SalesModule, PaymentModule, AdminModule],
  controllers: [PublicController],
})
export class PublicModule {}
