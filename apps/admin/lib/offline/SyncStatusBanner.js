'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, X, List, ArrowUpDown } from 'lucide-react';
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
    const [syncResult, setSyncResult] = useState(null);
    const [dismissed, setDismissed] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [syncLogs, setSyncLogs] = useState([]);
    const refreshPendingCount = useCallback(async () => {
        try {
            const count = await offlineDB.getPendingSalesCount();
            setPendingCount(count);
        }
        catch {
            // DB might not be ready
        }
    }, []);
    // Refresh pending count periodically
    useEffect(() => {
        refreshPendingCount();
        const interval = setInterval(refreshPendingCount, 10000);
        return () => clearInterval(interval);
    }, [refreshPendingCount]);
    // Subscribe to sync events
    useEffect(() => {
        const unsub = syncQueue.subscribe((event) => {
            if (event.type === 'sync-started') {
                setIsSyncing(true);
                setSyncResult(null);
            }
            else if (event.type === 'sync-completed') {
                setIsSyncing(false);
                setSyncResult({ synced: event.synced, failed: event.failed });
                refreshPendingCount();
            }
            else if (event.type === 'sync-error') {
                setIsSyncing(false);
            }
        });
        return unsub;
    }, [refreshPendingCount]);
    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && pendingCount > 0 && !isSyncing) {
            syncQueue.processAll().catch(() => { });
        }
    }, [isOnline, pendingCount, isSyncing]);
    const handleSyncNow = async () => {
        if (isSyncing || !isOnline)
            return;
        setIsSyncing(true);
        setSyncResult(null);
        try {
            await syncQueue.processAll();
        }
        catch {
            // Handled by sync queue
        }
    };
    const handleViewLogs = async () => {
        try {
            const logs = await offlineDB.getSyncLogs(20);
            setSyncLogs(logs.map((l) => ({
                operation: l.operation,
                status: l.status,
                details: l.details,
                timestamp: l.timestamp,
            })));
        }
        catch {
            // Ignore
        }
        setShowDetails(!showDetails);
    };
    // Don't show if dismissed and no pending items
    if (dismissed && isOnline && pendingCount === 0)
        return null;
    // When online with no pending syncs, show a minimal indicator
    if (isOnline && pendingCount === 0 && !syncResult) {
        return (_jsx("div", { className: "flex items-center justify-end px-6 py-1 bg-emerald-50 border-b border-emerald-100", children: _jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-emerald-600", children: [_jsx(Wifi, { className: "w-3 h-3" }), _jsx("span", { children: "Online" })] }) }));
    }
    return (_jsxs("div", { className: `px-6 py-2 border-b text-sm flex items-center justify-between gap-3 transition-all ${!isOnline
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : isSyncing
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : syncResult
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-surface-50 border-surface-200 text-surface-700'}`, children: [_jsx("div", { className: "flex items-center gap-2 min-w-0", children: !isOnline ? (_jsxs(_Fragment, { children: [_jsx(WifiOff, { className: "w-4 h-4 shrink-0 text-amber-500" }), _jsx("span", { className: "font-medium text-xs sm:text-sm", children: "You are offline" }), _jsx("span", { className: "text-xs opacity-75 hidden sm:inline", children: "\u2014 sales will be queued and synced automatically when connection is restored" }), pendingCount > 0 && (_jsxs("span", { className: "badge-warning text-[10px] px-1.5 py-0.5", children: [pendingCount, " pending"] }))] })) : isSyncing ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 shrink-0 animate-spin text-blue-500" }), _jsx("span", { className: "font-medium text-xs sm:text-sm", children: "Syncing offline sales\u2026" })] })) : syncResult ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "w-4 h-4 shrink-0 text-emerald-500" }), _jsxs("span", { className: "text-xs sm:text-sm", children: ["Synced ", syncResult.synced, " sale", syncResult.synced !== 1 ? 's' : '', syncResult.failed > 0 ? ` (${syncResult.failed} failed)` : ''] })] })) : pendingCount > 0 ? (_jsxs(_Fragment, { children: [_jsx(ArrowUpDown, { className: "w-4 h-4 shrink-0 text-surface-500" }), _jsxs("span", { className: "font-medium text-xs sm:text-sm", children: [pendingCount, " sale", pendingCount !== 1 ? 's' : '', " pending sync"] })] })) : null }), _jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [pendingCount > 0 && isOnline && !isSyncing && (_jsxs("button", { onClick: handleSyncNow, className: "btn-ghost btn-sm text-xs gap-1", children: [_jsx(RefreshCw, { className: "w-3 h-3" }), "Sync Now"] })), _jsx("button", { onClick: handleViewLogs, className: "btn-ghost btn-sm text-xs", title: "View sync history", children: _jsx(List, { className: "w-3 h-3" }) }), _jsx("button", { onClick: () => setDismissed(true), className: "btn-ghost btn-sm text-xs p-1", title: "Dismiss", children: _jsx(X, { className: "w-3 h-3" }) })] }), showDetails && (_jsx("div", { className: "absolute top-full left-0 right-0 z-50 bg-white border border-surface-200 shadow-lg rounded-b-xl max-h-48 overflow-y-auto", children: syncLogs.length === 0 ? (_jsx("p", { className: "px-4 py-3 text-xs text-surface-400", children: "No sync logs yet" })) : (syncLogs.map((log, i) => (_jsxs("div", { className: "px-4 py-2 border-b border-surface-50 last:border-0 flex items-start gap-2", children: [_jsx("span", { className: `mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'completed'
                                ? 'bg-emerald-500'
                                : log.status === 'failed'
                                    ? 'bg-red-500'
                                    : 'bg-amber-500'}` }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs text-surface-700 truncate", children: log.details }), _jsx("p", { className: "text-[10px] text-surface-400", children: new Date(log.timestamp).toLocaleString() })] })] }, i)))) }))] }));
}
//# sourceMappingURL=SyncStatusBanner.js.map