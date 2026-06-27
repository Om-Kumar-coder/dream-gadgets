'use client';

import { offlineDB, PendingSale } from './db';
import { apiClient } from '@/lib/api';

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
export class SyncQueue {
  private processing = false;
  private listeners: Set<SyncEventCallback> = new Set();
  private aborted = false;

  subscribe(callback: SyncEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(event: Parameters<SyncEventCallback>[0]) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch {
        // Silently ignore listener errors
      }
    });
  }

  /**
   * Process all pending sales. Returns the number of successfully synced sales.
   */
  async processAll(): Promise<{ synced: number; failed: number; total: number }> {
    if (this.processing) return { synced: 0, failed: 0, total: 0 };
    this.processing = true;
    this.aborted = false;

    const pending = await offlineDB.getPendingSales();
    if (pending.length === 0) {
      this.processing = false;
      return { synced: 0, failed: 0, total: 0 };
    }

    await offlineDB.logSync('sync-batch-started', 'started', `Processing ${pending.length} pending sales`);

    this.notify({
      type: 'sync-started',
      pending: pending.length,
      synced: 0,
      failed: 0,
    });

    let synced = 0;
    let failed = 0;

    for (const sale of pending) {
      if (this.aborted) break;

      // Max 3 retries
      if (sale.retryCount >= 3) {
        failed++;
        continue;
      }

      await offlineDB.updateSaleStatus(sale.id!, 'syncing');

      try {
        const payload = JSON.parse(sale.payload);
        const { data } = await apiClient.post('/sales', payload);

        const invoiceNumber = data?.data?.invoiceNumber ?? data?.invoiceNumber ?? 'Unknown';
        await offlineDB.updateSaleStatus(sale.id!, 'synced', undefined, invoiceNumber);
        await offlineDB.logSync('sale-synced', 'completed', `Sale synced: ${invoiceNumber}`);

        synced++;

        this.notify({
          type: 'sale-synced',
          saleId: sale.id,
          invoiceNumber,
          pending: pending.length - synced - failed,
          synced,
          failed,
        });
      } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';

        // For 409 conflicts (item already sold), mark as synced
        if (error?.response?.status === 409) {
          await offlineDB.updateSaleStatus(sale.id!, 'synced', 'Item already sold');
          synced++;
          continue;
        }

        // For 4xx client errors, don't retry (mark as failed)
        if (error?.response?.status && error.response.status >= 400 && error.response.status < 500) {
          await offlineDB.updateSaleStatus(sale.id!, 'failed', errorMsg);
          failed++;
          this.notify({
            type: 'sale-failed',
            saleId: sale.id,
            error: errorMsg,
            pending: pending.length - synced - failed,
            synced,
            failed,
          });
          continue;
        }

        // Transient errors (network, 5xx) — leave as pending for retry
        await offlineDB.updateSaleStatus(sale.id!, 'pending', errorMsg);
        failed++;

        this.notify({
          type: 'sale-failed',
          saleId: sale.id,
          error: errorMsg,
          pending: pending.length - synced - failed,
          synced,
          failed,
        });
      }
    }

    // Clean up synced sales older than 7 days
    try {
      await offlineDB.clearSyncedSales();
    } catch {
      // Non-critical
    }

    const status = failed > 0 && synced > 0 ? 'completed' : synced > 0 ? 'completed' : 'failed';
    await offlineDB.logSync(
      'sync-batch-completed',
      status,
      `Synced: ${synced}, Failed: ${failed}`,
    );

    this.notify({
      type: 'sync-completed',
      pending: 0,
      synced,
      failed,
    });

    this.processing = false;
    return { synced, failed, total: pending.length };
  }

  abort() {
    this.aborted = true;
  }

  get isProcessing(): boolean {
    return this.processing;
  }
}

// Singleton instance
export const syncQueue = new SyncQueue();
