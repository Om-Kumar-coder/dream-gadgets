import { Repository } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';
export declare class PurchaseService {
    private purchaseRepo;
    private itemRepo;
    constructor(purchaseRepo: Repository<Purchase>, itemRepo: Repository<InventoryItem>);
    private generateInvoiceNumber;
    create(dto: CreatePurchaseDto, userId: string): Promise<Purchase>;
    findAll(query: QueryPurchaseDto): Promise<{
        data: Purchase[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<Purchase & {
        items?: InventoryItem[];
    }>;
    update(id: string, dto: UpdatePurchaseDto): Promise<Purchase>;
    generateInvoicePdf(id: string): Promise<Buffer>;
}
//# sourceMappingURL=purchase.service.d.ts.map