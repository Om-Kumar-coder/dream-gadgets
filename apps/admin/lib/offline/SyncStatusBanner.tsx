'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, X, List, ArrowUpDown } from 'lucide-react';
import { useOnlineStatus } from './useOnlineStatus';
import { syncQueue } from './sync-queue';
import { offlineDB } from './db';

/**
 * SyncStatusBanner — shows the current connectivity status and sync progress
 * at the top of the admin panel.
 *
 * States:
 * - Online, no pending syncs: hidden or small indicator
 * - Online, pending syncs: shows "X sales pending sync" with sync button
 * - Offline: shows "You are offline — sales will be queued"
 * - Syncing: shows progress bar
 * - Error: shows error with retry
 */
export function SyncStatusBanner() {
  const { isOnline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; failed: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [syncLogs, setSyncLogs] = useState<Array<{ operation: string; status: string; details: string; timestamp: number }>>([]);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await offlineDB.getPendingSalesCount();
      setPendingCount(count);
    } catch {
      // DB might not be ready
    }
  }, []);

  // Refresh pending count periodically
  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 10_000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  // Subscribe to sync events
  useEffect(() => {
    const unsub = syncQueue.subscribe((event) => {
      if (event.type === 'sync-started') {
        setIsSyncing(true);
        setSyncResult(null);
      } else if (event.type === 'sync-completed') {
        setIsSyncing(false);
        setSyncResult({ synced: event.synced, failed: event.failed });
        refreshPendingCount();
      } else if (event.type === 'sync-error') {
        setIsSyncing(false);
      }
    });
    return unsub;
  }, [refreshPendingCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      syncQueue.processAll().catch(() => {});
    }
  }, [isOnline, pendingCount, isSyncing]);

  const handleSyncNow = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      await syncQueue.processAll();
    } catch {
      // Handled by sync queue
    }
  };

  const handleViewLogs = async () => {
    try {
      const logs = await offlineDB.getSyncLogs(20);
      setSyncLogs(
        logs.map((l: any) => ({
          operation: l.operation,
          status: l.status,
          details: l.details,
          timestamp: l.timestamp,
        })),
      );
    } catch {
      // Ignore
    }
    setShowDetails(!showDetails);
  };

  // Don't show if dismissed and no pending items
  if (dismissed && isOnline && pendingCount === 0) return null;

  // When online with no pending syncs, show a minimal indicator
  if (isOnline && pendingCount === 0 && !syncResult) {
    return (
      <div className="flex items-center justify-end px-6 py-1 bg-emerald-50 border-b border-emerald-100">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
          <Wifi className="w-3 h-3" />
          <span>Online</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`px-6 py-2 border-b text-sm flex items-center justify-between gap-3 transition-all ${
        !isOnline
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : isSyncing
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : syncResult
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-surface-50 border-surface-200 text-surface-700'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 shrink-0 text-amber-500" />
            <span className="font-medium text-xs sm:text-sm">
              You are offline
            </span>
            <span className="text-xs opacity-75 hidden sm:inline">
              — sales will be queued and synced automatically when connection is restored
            </span>
            {pendingCount > 0 && (
              <span className="badge-warning text-[10px] px-1.5 py-0.5">
                {pendingCount} pending
              </span>
            )}
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-blue-500" />
            <span className="font-medium text-xs sm:text-sm">Syncing offline sales…</span>
          </>
        ) : syncResult ? (
          <>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="text-xs sm:text-sm">
              Synced {syncResult.synced} sale{syncResult.synced !== 1 ? 's' : ''}
              {syncResult.failed > 0 ? ` (${syncResult.failed} failed)` : ''}
            </span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <ArrowUpDown className="w-4 h-4 shrink-0 text-surface-500" />
            <span className="font-medium text-xs sm:text-sm">
              {pendingCount} sale{pendingCount !== 1 ? 's' : ''} pending sync
            </span>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {pendingCount > 0 && isOnline && !isSyncing && (
          <button
            onClick={handleSyncNow}
            className="btn-ghost btn-sm text-xs gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Sync Now
          </button>
        )}

        <button
          onClick={handleViewLogs}
          className="btn-ghost btn-sm text-xs"
          title="View sync history"
        >
          <List className="w-3 h-3" />
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="btn-ghost btn-sm text-xs p-1"
          title="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Sync Logs Dropdown */}
      {showDetails && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-surface-200 shadow-lg rounded-b-xl max-h-48 overflow-y-auto">
          {syncLogs.length === 0 ? (
            <p className="px-4 py-3 text-xs text-surface-400">No sync logs yet</p>
          ) : (
            syncLogs.map((log, i) => (
              <div key={i} className="px-4 py-2 border-b border-surface-50 last:border-0 flex items-start gap-2">
                <span
                  className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    log.status === 'completed'
                      ? 'bg-emerald-500'
                      : log.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-xs text-surface-700 truncate">{log.details}</p>
                  <p className="text-[10px] text-surface-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
