import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InventoryItem } from './entities/inventory-item.entity';
import { ItemPhoto } from './entities/item-photo.entity';
import { Brand } from './entities/brand.entity';
import { Model } from './entities/model.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { EventService } from '../../common/events/event.service';
import { RedisService } from '../../common/redis/redis.service';
export declare class InventoryService {
    private itemRepo;
    private photoRepo;
    private brandRepo;
    private modelRepo;
    private dataSource;
    private configService;
    private eventService;
    private redisService;
    private searchQueue;
    constructor(itemRepo: Repository<InventoryItem>, photoRepo: Repository<ItemPhoto>, brandRepo: Repository<Brand>, modelRepo: Repository<Model>, dataSource: DataSource, configService: ConfigService, eventService: EventService, redisService: RedisService);
    setSearchQueue(queue: any): void;
    /**
     * Invalidates all cached public product listings so repeat visitors
     * see fresh data after any inventory mutation.
     */
    private invalidatePublicCache;
    create(dto: CreateInventoryItemDto, userId: string): Promise<InventoryItem>;
    findAll(query: QueryInventoryDto): Promise<{
        data: InventoryItem[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<InventoryItem>;
    findByImei(imei: string): Promise<InventoryItem>;
    update(id: string, dto: UpdateInventoryItemDto, userId: string): Promise<InventoryItem>;
    transitionStatus(id: string, newStatus: string, userId: string): Promise<InventoryItem>;
    getPresignedUploadUrl(itemId: string, filename: string): Promise<{
        uploadUrl: string;
        key: string;
    }>;
    addPhoto(itemId: string, s3Key: string, sortOrder?: number): Promise<ItemPhoto>;
    deletePhoto(itemId: string, photoId: string): Promise<void>;
    toggleOnline(id: string, userId: string): Promise<InventoryItem>;
    bulkImport(csvBuffer: Buffer, userId: string): Promise<{
        created: number;
        errors: Array<{
            row: number;
            errors: string[];
        }>;
    }>;
    getBrands(): Promise<Brand[]>;
    getModels(brandId?: string): Promise<Model[]>;
    getPriceSuggestion(modelId: string, condition: string): Promise<{
        median: number | null;
        count: number;
    }>;
    getCityStock(modelId: string): Promise<Array<{
        branchId: string;
        city: string;
        count: number;
    }>>;
}
//# sourceMappingURL=inventory.service.d.ts.map