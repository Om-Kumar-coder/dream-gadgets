'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';

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
export function useRealtimeUpdates(eventMap: RealtimeEventMap): void {
  const qc = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const unsubs: Array<() => void> = [];

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
