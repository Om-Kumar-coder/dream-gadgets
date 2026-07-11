'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
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
export function useRealtimeUpdates(eventMap) {
    const qc = useQueryClient();
    const socket = useSocket();
    useEffect(() => {
        const unsubs = [];
        for (const [event, queryKeys] of Object.entries(eventMap)) {
            const unsub = socket.on(event, () => {
                for (const key of queryKeys) {
                    qc.invalidateQueries({ queryKey: key });
                }
            });
            unsubs.push(unsub);
        }
        return () => {
            unsubs.forEach((fn) => fn());
        };
    }, [socket, qc, eventMap]);
}
//# sourceMappingURL=useRealtimeUpdates.js.map