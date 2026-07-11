import { Repository } from 'typeorm';
import { Accessory } from './entities/accessory.entity';
import { CreateAccessoryDto } from './dto/create-accessory.dto';
import { UpdateAccessoryDto } from './dto/update-accessory.dto';
import { QueryAccessoryDto } from './dto/query-accessory.dto';
export declare class AccessoryService {
    private accessoryRepo;
    constructor(accessoryRepo: Repository<Accessory>);
    create(dto: CreateAccessoryDto, userId: string): Promise<Accessory>;
    findAll(query: QueryAccessoryDto): Promise<{
        data: Accessory[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<Accessory>;
    findBySku(sku: string): Promise<Accessory>;
    update(id: string, dto: UpdateAccessoryDto): Promise<Accessory>;
    adjustStock(id: string, quantity: number, reason: string): Promise<Accessory>;
    toggleOnline(id: string): Promise<Accessory>;
    getLowStockAlerts(): Promise<Accessory[]>;
}
//# sourceMappingURL=accessory.service.d.ts.map