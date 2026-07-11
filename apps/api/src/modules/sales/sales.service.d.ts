import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Payment } from './entities/payment.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Accessory } from '../inventory/entities/accessory.entity';
import { Branch } from '../auth/entities/user.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';
import { CouponService } from '../coupon/coupon.service';
import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../../common/redis/redis.service';
import { EventService } from '../../common/events/event.service';
export declare class SalesService {
    private saleRepo;
    private saleItemRepo;
    private paymentRepo;
    private itemRepo;
    private accessoryRepo;
    private branchRepo;
    private dataSource;
    private configService;
    private redisService;
    private eventService;
    private couponService;
    private notificationService;
    private readonly logger;
    constructor(saleRepo: Repository<Sale>, saleItemRepo: Repository<SaleItem>, paymentRepo: Repository<Payment>, itemRepo: Repository<InventoryItem>, accessoryRepo: Repository<Accessory>, branchRepo: Repository<Branch>, dataSource: DataSource, configService: ConfigService, redisService: RedisService, eventService: EventService, couponService: CouponService, notificationService: NotificationService);
    generateInvoiceNumber(branchId: string): Promise<string>;
    create(dto: CreateSaleDto, userId: string, userRole: string): Promise<Sale>;
    findAll(query: QuerySaleDto): Promise<{
        data: Sale[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<Sale>;
    generateInvoicePdf(id: string): Promise<Buffer>;
    generateThermalPdf(id: string): Promise<Buffer>;
    private buildA4InvoiceHtml;
    private buildThermalReceiptHtml;
    private renderPdf;
    emailInvoice(id: string, email?: string): Promise<{
        message: string;
    }>;
    whatsappInvoice(id: string, phone?: string): Promise<{
        message: string;
    }>;
    voidSale(id: string, userId: string): Promise<Sale>;
    lockItem(itemId: string): Promise<{
        message: string;
    }>;
    unlockItem(itemId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=sales.service.d.ts.map