import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getPriceSuggestion(modelId: string, condition: string): Promise<{
        median: number | null;
        count: number;
    }>;
    getCityStock(modelId: string): Promise<{
        branchId: string;
        city: string;
        count: number;
    }[]>;
    getBrands(): Promise<import("./entities/brand.entity").Brand[]>;
    getModels(brandId?: string): Promise<import("./entities/model.entity").Model[]>;
    bulkImport(file: {
        buffer: Buffer;
    }, user: any): Promise<{
        created: number;
        errors: Array<{
            row: number;
            errors: string[];
        }>;
    }>;
    findByImei(imei: string): Promise<import("./entities/inventory-item.entity").InventoryItem>;
    findAll(query: QueryInventoryDto): Promise<{
        data: import("./entities/inventory-item.entity").InventoryItem[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(dto: CreateInventoryItemDto, user: any): Promise<import("./entities/inventory-item.entity").InventoryItem>;
    findById(id: string): Promise<import("./entities/inventory-item.entity").InventoryItem>;
    update(id: string, dto: UpdateInventoryItemDto, user: any): Promise<import("./entities/inventory-item.entity").InventoryItem>;
    addPhoto(id: string, body: {
        filename: string;
        s3Key?: string;
        sortOrder?: number;
    }): Promise<import("./entities/item-photo.entity").ItemPhoto | {
        uploadUrl: string;
        key: string;
    }>;
    deletePhoto(id: string, photoId: string): Promise<void>;
    toggleOnline(id: string, user: any): Promise<import("./entities/inventory-item.entity").InventoryItem>;
}
//# sourceMappingURL=inventory.controller.d.ts.map