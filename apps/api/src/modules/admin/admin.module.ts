import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, Role, Branch } from '../auth/entities/user.entity';
import { Setting } from './entities/setting.entity';
import { Banner, ContentPage } from './entities/banner.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role, Branch, Setting, Banner, ContentPage]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
