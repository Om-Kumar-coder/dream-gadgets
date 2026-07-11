'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineDB } from './db';
import { syncQueue } from './sync-queue';
import { useOnlineStatus } from './useOnlineStatus';
import { apiClient } from '@/lib/api';
/**
 * useOfflinePOS — hook that adds offline intelligence to the POS terminal.
 *
 * Features:
 * - Caches available inventory items for offline search
 * - Searches cached inventory when offline
 * - Queues sales when offline and syncs when back online
 * - Provides sync status and controls
 */
export function useOfflinePOS() {
    const { isOnline } = useOnlineStatus();
    const [state, setState] = useState({
        isReady: false,
        isOnline: true,
        pendingSyncCount: 0,
        cachedItemCount: 0,
        isCaching: false,
        isSyncing: false,
        lastSyncResult: null,
    });
    const initDone = useRef(false);
    // Initialize
    useEffect(() => {
        if (initDone.current)
            return;
        initDone.current = true;
        const init = async () => {
            try {
                const info = await offlineDB.getDatabaseInfo();
                const count = await offlineDB.getPendingSalesCount();
                const cachedCount = await offlineDB.getInventoryCount();
                setState((prev) => ({
                    ...prev,
                    isReady: true,
                    isOnline: navigator.onLine,
                    pendingSyncCount: count,
                    cachedItemCount: cachedCount,
                }));
            }
            catch {
                // DB not available — proceed without offline support
                setState((prev) => ({ ...prev, isReady: true }));
            }
        };
        init();
    }, []);
    // Update online status
    useEffect(() => {
        setState((prev) => ({ ...prev, isOnline }));
    }, [isOnline]);
    // Subscribe to sync events
    useEffect(() => {
        const unsub = syncQueue.subscribe((event) => {
            if (event.type === 'sync-started') {
                setState((prev) => ({ ...prev, isSyncing: true }));
            }
            else if (event.type === 'sync-completed') {
                setState((prev) => ({
                    ...prev,
                    isSyncing: false,
                    pendingSyncCount: 0,
                    lastSyncResult: { synced: event.synced, failed: event.failed },
                }));
            }
            else if (event.type === 'sync-error') {
                setState((prev) => ({ ...prev, isSyncing: false }));
            }
        });
        return unsub;
    }, []);
    // Auto-sync when coming online
    useEffect(() => {
        if (isOnline && state.pendingSyncCount > 0 && !state.isSyncing) {
            syncQueue.processAll().then((result) => {
                setState((prev) => ({
                    ...prev,
                    pendingSyncCount: 0,
                    lastSyncResult: { synced: result.synced, failed: result.failed },
                }));
            });
        }
    }, [isOnline, state.pendingSyncCount, state.isSyncing]);
    /**
     * Search inventory — tries server first, falls back to cache when offline.
     */
    const searchItems = useCallback(async (query) => {
        if (!query || query.length < 2)
            return [];
        // If online, try the API first
        if (navigator.onLine) {
            try {
                const { data } = await apiClient.get('/inventory', {
                    params: { search: query, status: 'available', limit: 20 },
                });
                const items = (data.data?.items ?? data.data ?? []);
                // Update cache in the background
                if (items.length > 0) {
                    const cacheItems = items.map((item) => ({
                        id: item.id,
                        imei: item.imei,
                        brandName: item.brand?.name ?? item.brand ?? '',
                        modelName: item.model?.name ?? item.model ?? '',
                        condition: item.condition,
                        sellingPrice: Number(item.sellingPrice ?? item.totalCost ?? 0),
                        totalCost: Number(item.totalCost ?? 0),
                        storage: item.storage,
                        colour: item.colour,
                        ram: item.ram,
                        status: item.status,
                        branchId: item.branchId ?? item.branch?.id,
                        cachedAt: Date.now(),
                    }));
                    offlineDB.cacheInventoryItems(cacheItems).catch(() => { });
                }
                return items.map((item) => ({
                    item: {
                        id: item.id,
                        imei: item.imei,
                        brandName: item.brand?.name ?? item.brand ?? '',
                        modelName: item.model?.name ?? item.model ?? '',
                        condition: item.condition,
                        sellingPrice: Number(item.sellingPrice ?? item.totalCost ?? 0),
                        totalCost: Number(item.totalCost ?? 0),
                        storage: item.storage,
                        colour: item.colour,
                        ram: item.ram,
                        status: item.status,
                        branchId: item.branchId ?? item.branch?.id,
                        cachedAt: Date.now(),
                    },
                    source: 'server',
                }));
            }
            catch {
                // Fall through to cache
            }
        }
        // Offline or server error — search locally
        const cached = await offlineDB.searchCachedInventory(query);
        return cached
            .filter((item) => item.status === 'available')
            .map((item) => ({ item, source: 'cache' }));
    }, []);
    /**
     * Submit a sale — sends to server if online, otherwise queues it.
     */
    const submitSale = useCallback(async (salePayload) => {
        if (navigator.onLine) {
            try {
                const { data } = await apiClient.post('/sales', salePayload);
                const invoiceNumber = data?.data?.invoiceNumber ?? data?.invoiceNumber;
                return { success: true, invoiceNumber, queued: false };
            }
            catch (error) {
                // If network error, queue it
                if (!navigator.onLine || error?.code === 'ERR_NETWORK') {
                    const id = await offlineDB.queueSale(salePayload);
                    await offlineDB.logSync('sale-queued', 'started', 'Sale queued due to network error');
                    setState((prev) => ({ ...prev, pendingSyncCount: prev.pendingSyncCount + 1 }));
                    return { success: true, queued: true, queueId: id };
                }
                throw error;
            }
        }
        else {
            // Definitely offline — queue it
            const id = await offlineDB.queueSale(salePayload);
            await offlineDB.logSync('sale-queued', 'started', 'Sale queued while offline');
            setState((prev) => ({ ...prev, pendingSyncCount: prev.pendingSyncCount + 1 }));
            return { success: true, queued: true, queueId: id };
        }
    }, []);
    /**
     * Cache available inventory for offline use.
     */
    const cacheInventory = useCallback(async () => {
        setState((prev) => ({ ...prev, isCaching: true }));
        try {
            const { data } = await apiClient.get('/inventory', {
                params: { limit: 1000, status: 'available' },
            });
            const items = (data.data?.items ?? data.data ?? []).map((item) => ({
                id: item.id,
                imei: item.imei,
                brandName: item.brand?.name ?? item.brand ?? '',
                modelName: item.model?.name ?? item.model ?? '',
                condition: item.condition,
                sellingPrice: Number(item.sellingPrice ?? item.totalCost ?? 0),
                totalCost: Number(item.totalCost ?? 0),
                storage: item.storage,
                colour: item.colour,
                ram: item.ram,
                status: item.status,
                branchId: item.branchId ?? item.branch?.id,
                cachedAt: Date.now(),
            }));
            await offlineDB.cacheInventoryItems(items);
            setState((prev) => ({
                ...prev,
                cachedItemCount: items.length,
                isCaching: false,
            }));
            return items.length;
        }
        catch {
            setState((prev) => ({ ...prev, isCaching: false }));
            return 0;
        }
    }, []);
    /**
     * Sync pending sales manually.
     */
    const syncNow = useCallback(async () => {
        if (!navigator.onLine || state.isSyncing)
            return;
        const result = await syncQueue.processAll();
        setState((prev) => ({
            ...prev,
            pendingSyncCount: 0,
            lastSyncResult: { synced: result.synced, failed: result.failed },
        }));
        return result;
    }, [state.isSyncing]);
    /**
     * Refresh pending sync count.
     */
    const refreshPendingCount = useCallback(async () => {
        try {
            const count = await offlineDB.getPendingSalesCount();
            setState((prev) => ({ ...prev, pendingSyncCount: count }));
            return count;
        }
        catch {
            return 0;
        }
    }, []);
    return {
        ...state,
        searchItems,
        submitSale,
        cacheInventory,
        syncNow,
        refreshPendingCount,
    };
}
//# sourceMappingURL=useOfflinePOS.js.map