import { Repository, DataSource } from 'typeorm';
import { StockTransfer } from './entities/stock-transfer.entity';
import { StockTransferItem } from './entities/stock-transfer-item.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Branch } from '../auth/entities/user.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { QueryTransferDto } from './dto/query-transfer.dto';
import { EventService } from '../../common/events/event.service';
export declare class TransferService {
    private transferRepo;
    private transferItemRepo;
    private itemRepo;
    private branchRepo;
    private dataSource;
    private eventService;
    private readonly logger;
    constructor(transferRepo: Repository<StockTransfer>, transferItemRepo: Repository<StockTransferItem>, itemRepo: Repository<InventoryItem>, branchRepo: Repository<Branch>, dataSource: DataSource, eventService: EventService);
    private generateTransferNumber;
    create(dto: CreateTransferDto, userId: string): Promise<StockTransfer>;
    findAll(query: QueryTransferDto): Promise<{
        data: StockTransfer[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<StockTransfer>;
    receive(id: string, confirmedItemIds: string[], userId: string): Promise<StockTransfer>;
    reject(id: string, rejectionReason: string): Promise<StockTransfer>;
    generateManifestPdf(id: string): Promise<Buffer>;
}
//# sourceMappingURL=transfer.service.d.ts.map