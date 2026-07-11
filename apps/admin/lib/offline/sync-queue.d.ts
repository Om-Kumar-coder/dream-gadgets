export type SyncEventCallback = (event: {
    type: 'sync-started' | 'sale-synced' | 'sale-failed' | 'sync-completed' | 'sync-error';
    saleId?: number;
    invoiceNumber?: string;
    error?: string;
    pending: number;
    synced: number;
    failed: number;
}) => void;
/**
 * SyncQueue — processes pending offline sales when connectivity is restored.
 *
 * Features:
 * - FIFO order processing
 * - Per-sale retry (max 3 attempts)
 * - Progress callbacks for UI updates
 * - Automatic processing when called
 */
export declare class SyncQueue {
    private processing;
    private listeners;
    private aborted;
    subscribe(callback: SyncEventCallback): () => void;
    private notify;
    /**
     * Process all pending sales. Returns the number of successfully synced sales.
     */
    processAll(): Promise<{
        synced: number;
        failed: number;
        total: number;
    }>;
    abort(): void;
    get isProcessing(): boolean;
}
export declare const syncQueue: SyncQueue;
//# sourceMappingURL=sync-queue.d.ts.map