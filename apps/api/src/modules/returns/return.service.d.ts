import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Return } from './entities/return.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Payment } from '../sales/entities/payment.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreateSaleReturnDto, CreatePurchaseReturnDto } from './dto/create-return.dto';
import { RedisService } from '../../common/redis/redis.service';
import { EventService } from '../../common/events/event.service';
export declare class ReturnService {
    private returnRepo;
    private saleRepo;
    private saleItemRepo;
    private paymentRepo;
    private purchaseRepo;
    private itemRepo;
    private configService;
    private dataSource;
    private redisService;
    private eventService;
    private readonly logger;
    constructor(returnRepo: Repository<Return>, saleRepo: Repository<Sale>, saleItemRepo: Repository<SaleItem>, paymentRepo: Repository<Payment>, purchaseRepo: Repository<Purchase>, itemRepo: Repository<InventoryItem>, configService: ConfigService, dataSource: DataSource, redisService: RedisService, eventService: EventService);
    createSaleReturn(saleId: string, dto: CreateSaleReturnDto, userId: string, userRole: string): Promise<Return>;
    createPurchaseReturn(purchaseId: string, dto: CreatePurchaseReturnDto, userId: string): Promise<Return>;
    findAll(query: {
        page?: number;
        limit?: number;
        returnType?: string;
        originalId?: string;
    }): Promise<{
        data: Return[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<Return>;
    generateReturnPdf(id: string): Promise<Buffer>;
    private buildReturnNoteHtml;
    private renderPdf;
    private getReturnWindowDays;
}
//# sourceMappingURL=return.service.d.ts.map