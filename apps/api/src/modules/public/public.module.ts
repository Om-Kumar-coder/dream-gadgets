import { Module } from '@nestjs/common';
import { SearchModule } from '../search/search.module';
import { SalesModule } from '../sales/sales.module';
import { PaymentModule } from '../payment/payment.module';
import { AdminModule } from '../admin/admin.module';
import { PublicController } from './public.controller';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [SearchModule, SalesModule, PaymentModule, AdminModule],
  controllers: [PublicController, AddressController],
  providers: [AddressService],
})
export class PublicModule {}
