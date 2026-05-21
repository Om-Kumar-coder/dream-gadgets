import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { SalesModule } from './modules/sales/sales.module';
import { ClientModule } from './modules/client/client.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { ReturnModule } from './modules/returns/return.module';
import { PaymentModule } from './modules/payment/payment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReportModule } from './modules/report/report.module';
import { AdminModule } from './modules/admin/admin.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { SearchModule } from './modules/search/search.module';
import { PublicModule } from './modules/public/public.module';
import { AccessoryModule } from './modules/inventory/accessory.module';
import { BuybackModule } from './modules/buyback/buyback.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: config.get<string>('app.env') === 'development',
        poolSize: config.get<number>('database.poolSize') || 20,
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [{ ttl: 60000, limit: 100 }],
      }),
    }),

    // BullMQ queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('redis.url'),
      }),
    }),

    // Redis cache
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const { redisStore } = await import('cache-manager-redis-yet');
        return {
          store: redisStore,
          url: config.get<string>('redis.url'),
          ttl: 60,
        };
      },
    }),

    // Feature modules
    AuthModule,
    InventoryModule,
    PurchaseModule,
    SalesModule,
    ClientModule,
    TransferModule,
    ExchangeModule,
    ReturnModule,
    PaymentModule,
    NotificationModule,
    ReportModule,
    AdminModule,
    RealtimeModule,
    SearchModule,
    PublicModule,
    AccessoryModule,
    BuybackModule,
    ReviewsModule,
  ],
})
export class AppModule {}
