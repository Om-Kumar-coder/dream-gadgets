'use client';
import { offlineDB } from './db';
import { apiClient } from '@/lib/api';
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
    async get(endpoint, config) {
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
        }
        catch (error) {
            // If offline or network error, try cache
            if (!navigator.onLine || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
                const cached = await offlineDB.getCache(`api:${endpoint}`);
                if (cached) {
                    return { data: cached, status: 200, statusText: 'OK (cached)', headers: {}, config: {} };
                }
            }
            throw error;
        }
    },
    async post(endpoint, data, config) {
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
            };
        }
        try {
            return await apiClient.post(endpoint, data);
        }
        catch (error) {
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
                };
            }
            throw error;
        }
    },
    async patch(endpoint, data) {
        if (!navigator.onLine) {
            const id = await this.enqueue({
                endpoint,
                method: 'PATCH',
                data,
                queuedAt: Date.now(),
                retryCount: 0,
                priority: 'normal',
            });
            return { data: { status: 'queued', queueId: id }, status: 202 };
        }
        try {
            return await apiClient.patch(endpoint, data);
        }
        catch (error) {
            if (error?.code === 'ERR_NETWORK' || !navigator.onLine) {
                const id = await this.enqueue({ endpoint, method: 'PATCH', data, queuedAt: Date.now(), retryCount: 0, priority: 'normal' });
                return { data: { status: 'queued', queueId: id }, status: 202 };
            }
            throw error;
        }
    },
    async put(endpoint, data) {
        if (!navigator.onLine) {
            const id = await this.enqueue({ endpoint, method: 'PUT', data, queuedAt: Date.now(), retryCount: 0, priority: 'normal' });
            return { data: { status: 'queued', queueId: id }, status: 202 };
        }
        try {
            return await apiClient.put(endpoint, data);
        }
        catch (error) {
            if (error?.code === 'ERR_NETWORK' || !navigator.onLine) {
                const id = await this.enqueue({ endpoint, method: 'PUT', data, queuedAt: Date.now(), retryCount: 0, priority: 'normal' });
                return { data: { status: 'queued', queueId: id }, status: 202 };
            }
            throw error;
        }
    },
    // ── Queue management ──
    async enqueue(item) {
        const queue = (await offlineDB.getCache(QUEUE_KEY)) || [];
        const id = Date.now() + Math.random();
        queue.push({ ...item, id });
        await offlineDB.setCache(QUEUE_KEY, queue);
        return id;
    },
    async getQueue() {
        return (await offlineDB.getCache(QUEUE_KEY)) || [];
    },
    async processQueue() {
        const queue = await this.getQueue();
        if (queue.length === 0)
            return { processed: 0, failed: 0 };
        let processed = 0;
        let failed = 0;
        const processedIds = [];
        for (const item of queue) {
            if (item.retryCount >= 3) {
                failed++;
                continue;
            }
            try {
                if (item.method === 'POST') {
                    await apiClient.post(item.endpoint, item.data);
                }
                else if (item.method === 'PATCH') {
                    await apiClient.patch(item.endpoint, item.data);
                }
                else if (item.method === 'PUT') {
                    await apiClient.put(item.endpoint, item.data);
                }
                else if (item.method === 'DELETE') {
                    await apiClient.delete(item.endpoint, { data: item.data });
                }
                processed++;
                processedIds.push(item.id);
            }
            catch {
                item.retryCount++;
                failed++;
            }
        }
        // Keep items that weren't successfully processed and still have retries left
        const remaining = queue.filter((item) => !processedIds.includes(item.id) && item.retryCount < 3);
        await offlineDB.setCache(QUEUE_KEY, remaining);
        return { processed, failed };
    },
    async clearQueue() {
        await offlineDB.removeCache(QUEUE_KEY);
    },
};
//# sourceMappingURL=api-offline.js.map