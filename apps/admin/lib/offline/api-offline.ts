'use client';

import { offlineDB } from './db';
import { apiClient } from '@/lib/api';

type OfflineQueueItem = {
  id?: number;
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  data?: unknown;
  params?: Record<string, unknown>;
  queuedAt: number;
  retryCount: number;
  priority: 'high' | 'normal' | 'low';
};

const QUEUE_KEY = 'offline-api-queue';

/**
 * Offline-aware API client.
 *
 * When online: passes requests through to the real apiClient.
 * When offline: caches GET responses from IndexedDB and queues mutating
 * requests (POST/PATCH/PUT/DELETE) for later replay.
 *
 * Returns the same shape as the real API client so it can
 * be used as a drop-in replacement.
 */
export const apiOffline = {
  async get(endpoint: string, config?: { params?: Record<string, unknown>; useCache?: boolean }) {
    // Try real API first
    try {
      const response = await apiClient.get(endpoint, { params: config?.params });
      // Cache the response for offline use (if it's cacheable data)
      if (config?.useCache !== false && response.data?.data) {
        await offlineDB.setCache(`api:${endpoint}`, {
          data: response.data.data,
          meta: response.data.meta,
          cachedAt: Date.now(),
        });
      }
      return response;
    } catch (error: any) {
      // If offline or network error, try cache
      if (!navigator.onLine || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
        const cached = await offlineDB.getCache<{ data: unknown }>(`api:${endpoint}`);
        if (cached) {
          return { data: cached, status: 200, statusText: 'OK (cached)', headers: {}, config: {} } as any;
        }
      }
      throw error;
    }
  },

  async post(endpoint: string, data?: unknown, config?: { offline?: boolean }) {
    // If offline, queue the request
    if (!navigator.onLine || config?.offline) {
      const id = await this.enqueue({
        endpoint,
        method: 'POST',
        data,
        queuedAt: Date.now(),
        retryCount: 0,
        priority: 'high',
      });
      return {
        data: {
          status: 'queued',
          message: 'Request queued for sync when connection is restored',
          queueId: id,
        },
        status: 202,
        statusText: 'Accepted (queued offline)',
      } as any;
    }

    try {
      return await apiClient.post(endpoint, data);
    } catch (error: any) {
      // If network error, queue it
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network') || !navigator.onLine) {
        const id = await this.enqueue({
          endpoint,
          method: 'POST',
          data,
          queuedAt: Date.now(),
          retryCount: 0,
          priority: 'high',
        });
        return {
          data: {
            status: 'queued',
            message: 'Request queued for sync',
            queueId: id,
          },
          status: 202,
        } as any;
      }
      throw error;
    }
  },

  async patch(endpoint: string, data?: unknown) {
    if (!navigator.onLine) {
      const id = await this.enqueue({
        endpoint,
        method: 'PATCH',
        data,
        queuedAt: Date.now(),
        retryCount: 0,
        priority: 'normal',
      });
      return { data: { status: 'queued', queueId: id }, status: 202 } as any;
    }
    try {
      return await apiClient.patch(endpoint, data);
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK' || !navigator.onLine) {
        const id = await this.enqueue({ endpoint, method: 'PATCH', data, queuedAt: Date.now(), retryCount: 0, priority: 'normal' });
        return { data: { status: 'queued', queueId: id }, status: 202 } as any;
      }
      throw error;
    }
  },

  async put(endpoint: string, data?: unknown) {
    if (!navigator.onLine) {
      const id = await this.enqueue({ endpoint, method: 'PUT', data, queuedAt: Date.now(), retryCount: 0, priority: 'normal' });
      return { data: { status: 'queued', queueId: id }, status: 202 } as any;
    }
    try {
      return await apiClient.put(endpoint, data);
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK' || !navigator.onLine) {
        const id = await this.enqueue({ endpoint, method: 'PUT', data, queuedAt: Date.now(), retryCount: 0, priority: 'normal' });
        return { data: { status: 'queued', queueId: id }, status: 202 } as any;
      }
      throw error;
    }
  },

  // ── Queue management ──
  async enqueue(item: Omit<OfflineQueueItem, 'id'>): Promise<number> {
    const queue = (await offlineDB.getCache<OfflineQueueItem[]>(QUEUE_KEY)) || [];
    const id = Date.now() + Math.random();
    queue.push({ ...item, id } as OfflineQueueItem);
    await offlineDB.setCache(QUEUE_KEY, queue);
    return id;
  },

  async getQueue(): Promise<OfflineQueueItem[]> {
    return (await offlineDB.getCache<OfflineQueueItem[]>(QUEUE_KEY)) || [];
  },

  async processQueue(): Promise<{ processed: number; failed: number }> {
    const queue = await this.getQueue();
    if (queue.length === 0) return { processed: 0, failed: 0 };

    let processed = 0;
    let failed = 0;
    const processedIds: number[] = [];

    for (const item of queue) {
      if (item.retryCount >= 3) {
        failed++;
        continue;
      }

      try {
        if (item.method === 'POST') {
          await apiClient.post(item.endpoint, item.data);
        } else if (item.method === 'PATCH') {
          await apiClient.patch(item.endpoint, item.data);
        } else if (item.method === 'PUT') {
          await apiClient.put(item.endpoint, item.data);
        } else if (item.method === 'DELETE') {
          await apiClient.delete(item.endpoint, { data: item.data });
        }
        processed++;
        processedIds.push(item.id!);
      } catch {
        item.retryCount++;
        failed++;
      }
    }

    // Keep items that weren't successfully processed and still have retries left
    const remaining = queue.filter((item) => !processedIds.includes(item.id!) && item.retryCount < 3);
    await offlineDB.setCache(QUEUE_KEY, remaining);

    return { processed, failed };
  },

  async clearQueue() {
    await offlineDB.removeCache(QUEUE_KEY);
  },
};
