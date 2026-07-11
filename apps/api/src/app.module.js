var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
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
import { GstModule } from './modules/gst/gst.module';
import { HealthModule } from './modules/health/health.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { EmiModule } from './modules/emi/emi.module';
import { RedisModule } from './common/redis/redis.module';
import { EventsModule } from './common/events/events.module';
let AppModule = (() => {
    let _classDecorators = [Module({
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
                    useFactory: (config) => ({
                        type: 'postgres',
                        url: config.get('database.url'),
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
                        synchronize: false,
                        logging: config.get('app.env') === 'development',
                        poolSize: config.get('database.poolSize') || 20,
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
                    useFactory: (config) => ({
                        redis: config.get('redis.url'),
                    }),
                }),
                // Redis cache
                CacheModule.registerAsync({
                    isGlobal: true,
                    inject: [ConfigService],
                    useFactory: async (config) => {
                        const { redisStore } = await import('cache-manager-redis-yet');
                        return {
                            store: redisStore,
                            url: config.get('redis.url'),
                            ttl: 60,
                        };
                    },
                }),
                // Redis shared connection
                RedisModule,
                // Domain events (global — provides EventService)
                EventsModule,
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
                GstModule,
                HealthModule,
                CouponModule,
                WhatsappModule,
                EmiModule,
            ],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppModule = _classThis = class {
    };
    __setFunctionName(_classThis, "AppModule");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
})();
export { AppModule };
//# sourceMappingURL=app.module.js.map