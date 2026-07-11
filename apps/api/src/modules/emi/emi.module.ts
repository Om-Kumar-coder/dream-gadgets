import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmiController } from './emi.controller';
import { EmiService } from './emi.service';
import { EmiProvider, EmiPlan } from './emi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmiProvider, EmiPlan])],
  controllers: [EmiController],
  providers: [EmiService],
  exports: [EmiService],
})
export class EmiModule {}
