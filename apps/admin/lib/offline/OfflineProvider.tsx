'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { offlineDB, CachedInventoryItem } from './db';
import { syncQueue } from './sync-queue';
import { apiClient } from '@/lib/api';
import { SyncStatusBanner } from './SyncStatusBanner';

interface OfflineContextValue {
  isReady: boolean;
  cacheInventory: () => Promise<number>;
  refreshPendingCount: () => Promise<number>;
  pendingCount: number;
}

const OfflineContext = createContext<OfflineContextValue>({
  isReady: false,
  cacheInventory: async () => 0,
  refreshPendingCount: async () => 0,
  pendingCount: 0,
});

export function useOffline() {
  return useContext(OfflineContext);
}

/**
 * OfflineProvider — initializes the offline database and provides
 * context values for the rest of the app.
 *
 * Must be placed inside the QueryClient provider.
 */
export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize database
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Warm up the database by opening it
        const info = await offlineDB.getDatabaseInfo();
        if (!cancelled) {
          setIsReady(true);
        }

        // Count pending
        const count = await offlineDB.getPendingSalesCount();
        if (!cancelled) {
          setPendingCount(count);
        }

        // Auto-sync if pending sales exist
        if (count > 0 && navigator.onLine) {
          syncQueue.processAll().catch(() => {});
        }
      } catch (error: any) {
        if (!cancelled) {
          console.warn('[OfflineProvider] IndexedDB init failed:', error?.message);
          setInitError(error?.message);
          // Still mark as ready — the app works without offline support
          setIsReady(true);
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await offlineDB.getPendingSalesCount();
      setPendingCount(count);
      return count;
    } catch {
      return 0;
    }
  }, []);

  // Cache inventory items for offline search
  const cacheInventory = useCallback(async (): Promise<number> => {
    try {
      const { data } = await apiClient.get('/inventory', {
        params: { limit: 1000, status: 'available' },
      });
      const items: CachedInventoryItem[] = (data.data?.items ?? data.data ?? []).map(
        (item: any) => ({
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
        }),
      );
      await offlineDB.cacheInventoryItems(items);
      return items.length;
    } catch {
      return 0;
    }
  }, []);

  return (
    <OfflineContext.Provider value={{ isReady, cacheInventory, refreshPendingCount, pendingCount }}>
      <SyncStatusBanner />
      {children}
    </OfflineContext.Provider>
  );
}
