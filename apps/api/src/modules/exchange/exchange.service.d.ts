import { Repository } from 'typeorm';
import { ExchangeDevice } from './entities/exchange-device.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { QueryExchangeDto } from './dto/query-exchange.dto';
export declare class ExchangeService {
    private exchangeRepo;
    private itemRepo;
    constructor(exchangeRepo: Repository<ExchangeDevice>, itemRepo: Repository<InventoryItem>);
    create(dto: CreateExchangeDto, userId: string): Promise<ExchangeDevice>;
    findAll(query: QueryExchangeDto): Promise<{
        data: ExchangeDevice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<ExchangeDevice>;
    update(id: string, dto: Partial<CreateExchangeDto>): Promise<ExchangeDevice>;
    suggestPrice(params: {
        basePrice: number;
        batteryHealth: number;
        monthsSinceFirstInvoice: number;
    }): Promise<{
        suggestedPrice: number;
        batteryHealth: number;
        monthsSinceFirstInvoice: number;
        basePrice: number;
    }>;
    addToInventory(id: string, inventoryData: {
        branchId: string;
        boxType?: string;
        purchasePrice?: number;
        taxRate?: number;
        createdById?: string;
    }): Promise<ExchangeDevice>;
    getPriceGuide(modelId?: string): Promise<Array<{
        modelId: string;
        condition: string;
        basePrice: number;
    }>>;
}
//# sourceMappingURL=exchange.service.d.ts.map