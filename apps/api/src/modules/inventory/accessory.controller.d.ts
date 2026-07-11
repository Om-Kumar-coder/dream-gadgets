import { AccessoryService } from './accessory.service';
import { CreateAccessoryDto } from './dto/create-accessory.dto';
import { UpdateAccessoryDto } from './dto/update-accessory.dto';
import { QueryAccessoryDto } from './dto/query-accessory.dto';
export declare class AccessoryController {
    private readonly accessoryService;
    constructor(accessoryService: AccessoryService);
    create(dto: CreateAccessoryDto, user: any): Promise<import("./entities/accessory.entity").Accessory>;
    findAll(query: QueryAccessoryDto): Promise<{
        data: import("./entities/accessory.entity").Accessory[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("./entities/accessory.entity").Accessory>;
    findBySku(sku: string): Promise<import("./entities/accessory.entity").Accessory>;
    update(id: string, dto: UpdateAccessoryDto): Promise<import("./entities/accessory.entity").Accessory>;
    adjustStock(id: string, dto: {
        quantity: number;
        reason: string;
    }): Promise<import("./entities/accessory.entity").Accessory>;
    toggleOnline(id: string): Promise<import("./entities/accessory.entity").Accessory>;
    getLowStockAlerts(): Promise<import("./entities/accessory.entity").Accessory[]>;
}
//# sourceMappingURL=accessory.controller.d.ts.map