import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
export interface SearchFilters {
    itemId?: string;
    condition?: string;
    status?: string;
    brand?: string;
    model?: string;
    branchId?: string;
    minPrice?: number;
    maxPrice?: number;
    isOnline?: boolean;
    storage?: string;
    colour?: string;
    city?: string;
    page?: number;
    limit?: number;
}
export interface SearchResult {
    items: any[];
    total: number;
    page: number;
    limit: number;
}
export declare class SearchService {
    private dataSource;
    private configService;
    private readonly logger;
    private queue;
    constructor(dataSource: DataSource, configService: ConfigService);
    private readonly fallbackImage;
    private initQueue;
    searchInventory(query: string, filters?: SearchFilters): Promise<SearchResult>;
    searchPublicProducts(query: string, filters?: SearchFilters): Promise<SearchResult>;
    private getPublicFacets;
    getRelatedProducts(itemId: string, limit?: number): Promise<any[]>;
    getProductWithSpecs(itemId: string): Promise<any | null>;
    syncItem(itemId: string): Promise<void>;
    removeItem(itemId: string): Promise<void>;
}
//# sourceMappingURL=search.service.d.ts.map