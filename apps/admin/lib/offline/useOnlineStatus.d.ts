interface OnlineStatus {
    isOnline: boolean;
    wasOffline: boolean;
    lastOnlineAt: number | null;
    lastOfflineAt: number | null;
    checkConnection: () => Promise<boolean>;
}
/**
 * useOnlineStatus — tracks browser connectivity status.
 *
 * Uses both `navigator.onLine` and periodic fetch pings to a
 * lightweight endpoint to detect actual network availability
 * (not just local connectivity).
 *
 * Returns:
 *   isOnline      — whether the app currently has connectivity
 *   wasOffline    — true if the app was offline at any point during the session
 *   lastOnlineAt  — timestamp of the last online transition
 *   lastOfflineAt — timestamp of the last offline transition
 *   checkConnection — force a connectivity check
 */
export declare function useOnlineStatus(): OnlineStatus;
export {};
//# sourceMappingURL=useOnlineStatus.d.ts.map