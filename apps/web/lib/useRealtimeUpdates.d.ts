export type RealtimeEvent = 'order.status_changed' | 'sale.created' | 'inventory.updated' | 'return.created' | 'stock.transfer.created' | 'stock.transfer.updated' | 'stock.transfer.received';
export interface UseRealtimeOptions {
    enabled?: boolean;
    onOrderStatusChanged?: (data: {
        orderId: string;
        status: string;
    }) => void;
    onInventoryUpdated?: (data: {
        itemId: string;
        status: string;
    }) => void;
    onReturnCreated?: (data: {
        returnId: string;
        type: string;
    }) => void;
}
/**
 * useRealtimeUpdates — Web app hook that listens for realtime events and
 * invalidates React Query caches so the UI auto-refreshes.
 *
 * Automatically invalidates query keys:
 *   - ['orders']          on order.status_changed
 *   - ['public-products'] on inventory.updated
 *   - ['orders']          on return.created
 */
export declare function useRealtimeUpdates(options?: UseRealtimeOptions): void;
//# sourceMappingURL=useRealtimeUpdates.d.ts.map