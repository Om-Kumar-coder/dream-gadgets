import { Response } from 'express';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';
export declare class PurchaseController {
    private readonly purchaseService;
    constructor(purchaseService: PurchaseService);
    create(dto: CreatePurchaseDto, user: any): Promise<import("./entities/purchase.entity").Purchase>;
    findAll(query: QueryPurchaseDto): Promise<{
        data: import("./entities/purchase.entity").Purchase[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("./entities/purchase.entity").Purchase & {
        items?: import("../inventory/entities/inventory-item.entity").InventoryItem[];
    }>;
    update(id: string, dto: UpdatePurchaseDto): Promise<import("./entities/purchase.entity").Purchase>;
    getInvoice(id: string, res: Response): Promise<void>;
}
//# sourceMappingURL=purchase.controller.d.ts.map