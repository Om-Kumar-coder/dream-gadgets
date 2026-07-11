'use client';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
/**
 * useRealtimeUpdates — Web app hook that listens for realtime events and
 * invalidates React Query caches so the UI auto-refreshes.
 *
 * Automatically invalidates query keys:
 *   - ['orders']          on order.status_changed
 *   - ['public-products'] on inventory.updated
 *   - ['orders']          on return.created
 */
export function useRealtimeUpdates(options = {}) {
    const { enabled = true, onOrderStatusChanged, onInventoryUpdated, onReturnCreated } = options;
    const queryClient = useQueryClient();
    const socket = useSocket();
    const stableCallbacks = useRef({ onOrderStatusChanged, onInventoryUpdated, onReturnCreated });
    stableCallbacks.current = { onOrderStatusChanged, onInventoryUpdated, onReturnCreated };
    useEffect(() => {
        if (!enabled || !socket.connected)
            return;
        const unsubOrderStatus = socket.on('order.status_changed', (data) => {
            // Invalidate orders queries so the UI re-fetches
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order'] });
            stableCallbacks.current.onOrderStatusChanged?.(data);
        });
        const unsubInventory = socket.on('inventory.updated', (data) => {
            queryClient.invalidateQueries({ queryKey: ['public-products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
            stableCallbacks.current.onInventoryUpdated?.(data);
        });
        const unsubReturn = socket.on('return.created', (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            stableCallbacks.current.onReturnCreated?.(data);
        });
        return () => {
            unsubOrderStatus();
            unsubInventory();
            unsubReturn();
        };
    }, [enabled, socket.connected, queryClient, socket]);
}
//# sourceMappingURL=useRealtimeUpdates.js.map