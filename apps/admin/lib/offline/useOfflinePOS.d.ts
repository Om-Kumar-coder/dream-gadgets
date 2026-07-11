import { CachedInventoryItem } from './db';
interface OfflineSearchResult {
    item: CachedInventoryItem;
    source: 'cache' | 'server';
}
/**
 * useOfflinePOS — hook that adds offline intelligence to the POS terminal.
 *
 * Features:
 * - Caches available inventory items for offline search
 * - Searches cached inventory when offline
 * - Queues sales when offline and syncs when back online
 * - Provides sync status and controls
 */
export declare function useOfflinePOS(): {
    searchItems: (query: string) => Promise<OfflineSearchResult[]>;
    submitSale: (salePayload: object) => Promise<{
        success: boolean;
        invoiceNumber?: string;
        queued: boolean;
        queueId?: number;
    }>;
    cacheInventory: () => Promise<number>;
    syncNow: () => Promise<{
        synced: number;
        failed: number;
        total: number;
    } | undefined>;
    refreshPendingCount: () => Promise<number>;
    isReady: boolean;
    isOnline: boolean;
    pendingSyncCount: number;
    cachedItemCount: number;
    isCaching: boolean;
    isSyncing: boolean;
    lastSyncResult: {
        synced: number;
        failed: number;
    } | null;
};
export {};
//# sourceMappingURL=useOfflinePOS.d.ts.map