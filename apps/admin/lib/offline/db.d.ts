export interface CachedInventoryItem {
    id: string;
    imei: string;
    brandName: string;
    modelName: string;
    condition: string;
    sellingPrice: number;
    totalCost: number;
    storage?: string;
    colour?: string;
    ram?: string;
    status: string;
    branchId?: string;
    cachedAt: number;
}
export interface PendingSale {
    id?: number;
    createdAt: number;
    payload: string;
    status: 'pending' | 'syncing' | 'synced' | 'failed';
    retryCount: number;
    lastError?: string;
    syncedAt?: number;
    invoiceNumber?: string;
}
export interface CachedEntry {
    key: string;
    data: unknown;
    cachedAt: number;
}
export interface SyncLogEntry {
    id?: number;
    operation: string;
    status: 'started' | 'completed' | 'failed';
    details: string;
    timestamp: number;
}
export declare const offlineDB: {
    cacheInventoryItems(items: CachedInventoryItem[]): Promise<void>;
    getCachedInventory(): Promise<CachedInventoryItem[]>;
    searchCachedInventory(query: string): Promise<CachedInventoryItem[]>;
    getCachedItemByIMEI(imei: string): Promise<CachedInventoryItem | undefined>;
    getCachedItemById(id: string): Promise<CachedInventoryItem | undefined>;
    removeCachedItem(id: string): Promise<void>;
    clearInventoryCache(): Promise<void>;
    getInventoryCount(): Promise<number>;
    queueSale(payload: object): Promise<number>;
    getPendingSales(): Promise<PendingSale[]>;
    getAllPendingSales(): Promise<PendingSale[]>;
    updateSaleStatus(id: number, status: PendingSale["status"], error?: string, invoiceNumber?: string): Promise<void>;
    removeSale(id: number): Promise<void>;
    clearSyncedSales(): Promise<void>;
    getPendingSalesCount(): Promise<number>;
    setCache(key: string, data: unknown): Promise<void>;
    getCache<T>(key: string): Promise<T | undefined>;
    removeCache(key: string): Promise<void>;
    clearCache(): Promise<void>;
    logSync(operation: string, status: SyncLogEntry["status"], details: string): Promise<void>;
    getSyncLogs(limit?: number): Promise<SyncLogEntry[]>;
    clearSyncLogs(): Promise<void>;
    getDatabaseInfo(): Promise<{
        name: string;
        version: number;
        stores: string[];
    }>;
};
//# sourceMappingURL=db.d.ts.map