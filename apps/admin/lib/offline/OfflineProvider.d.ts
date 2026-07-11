import { ReactNode } from 'react';
interface OfflineContextValue {
    isReady: boolean;
    cacheInventory: () => Promise<number>;
    refreshPendingCount: () => Promise<number>;
    pendingCount: number;
}
export declare function useOffline(): OfflineContextValue;
/**
 * OfflineProvider — initializes the offline database and provides
 * context values for the rest of the app.
 *
 * Must be placed inside the QueryClient provider.
 */
export declare function OfflineProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=OfflineProvider.d.ts.map