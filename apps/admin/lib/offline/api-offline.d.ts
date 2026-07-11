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
export declare const apiOffline: {
    get(endpoint: string, config?: {
        params?: Record<string, unknown>;
        useCache?: boolean;
    }): Promise<any>;
    post(endpoint: string, data?: unknown, config?: {
        offline?: boolean;
    }): Promise<any>;
    patch(endpoint: string, data?: unknown): Promise<any>;
    put(endpoint: string, data?: unknown): Promise<any>;
    enqueue(item: Omit<OfflineQueueItem, "id">): Promise<number>;
    getQueue(): Promise<OfflineQueueItem[]>;
    processQueue(): Promise<{
        processed: number;
        failed: number;
    }>;
    clearQueue(): Promise<void>;
};
export {};
//# sourceMappingURL=api-offline.d.ts.map