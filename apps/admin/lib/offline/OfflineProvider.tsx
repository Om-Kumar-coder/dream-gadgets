'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { offlineDB, CachedInventoryItem } from './db';
import { syncQueue } from './sync-queue';
import { apiClient } from '@/lib/api';
import { SyncStatusBanner } from './SyncStatusBanner';
import { SplashScreen } from '@/components/SplashScreen';

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
  const [minElapsed, setMinElapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [initError, setInitError] = useState<string | null>(null);

  // Guarantee the branded splash is visible for a short moment so it
  // doesn't flash — IndexedDB init is usually near-instant.
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Initialize database
  useEffect(() => {
    let cancelled = false;

    // Failsafe — never leave the user stuck on the splash, even if
    // IndexedDB is slow or hangs. The app works without offline support.
    const failsafe = setTimeout(() => {
      if (!cancelled) setIsReady(true);
    }, 4000);

    const init = async () => {
      try {
        // Warm up the database by opening it
        const info = await offlineDB.getDatabaseInfo();
        if (!cancelled) {
          clearTimeout(failsafe);
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
          clearTimeout(failsafe);
          console.warn('[OfflineProvider] IndexedDB init failed:', error?.message);
          setInitError(error?.message);
          // Still mark as ready — the app works without offline support
          setIsReady(true);
        }
      }
    };

    init();
    return () => { cancelled = true; clearTimeout(failsafe); };
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

  const showSplash = !isReady || !minElapsed;

  return (
    <OfflineContext.Provider value={{ isReady, cacheInventory, refreshPendingCount, pendingCount }}>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <>
          <SyncStatusBanner />
          {children}
        </>
      )}
    </OfflineContext.Provider>
  );
}
