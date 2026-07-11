export interface RealtimeEventMap {
    /**
     * Map of socket event names to query keys that should be invalidated.
     * When the event fires, all listed query keys are invalidated.
     */
    [eventName: string]: string[][];
}
/**
 * useRealtimeUpdates — subscribe to Socket.io events and auto-invalidate
 * React Query caches when events fire.
 *
 * Usage:
 * ```tsx
 * useRealtimeUpdates({
 *   'sale.created': [['sales']],
 *   'inventory.updated': [['inventory']],
 * });
 * ```
 *
 * The token is read from localStorage('admin_access_token') automatically.
 */
export declare function useRealtimeUpdates(eventMap: RealtimeEventMap): void;
//# sourceMappingURL=useRealtimeUpdates.d.ts.map