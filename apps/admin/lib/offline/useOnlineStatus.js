'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [wasOffline, setWasOffline] = useState(false);
    const [lastOnlineAt, setLastOnlineAt] = useState(typeof navigator !== 'undefined' && navigator.onLine ? Date.now() : null);
    const [lastOfflineAt, setLastOfflineAt] = useState(null);
    // Use a ref to avoid stale closures in the checkConnection callback
    const isOnlineRef = useRef(isOnline);
    isOnlineRef.current = isOnline;
    const handleOnline = useCallback(() => {
        setIsOnline(true);
        setLastOnlineAt(Date.now());
    }, []);
    const handleOffline = useCallback(() => {
        setIsOnline(false);
        setWasOffline(true);
        setLastOfflineAt(Date.now());
    }, []);
    // Check real connectivity by pinging a lightweight endpoint
    // Stable reference — uses ref for isOnline to avoid interval churn
    const checkConnection = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch('/api/v1/health', {
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-store',
            });
            clearTimeout(timeoutId);
            const connected = response.ok;
            if (connected !== isOnlineRef.current) {
                setIsOnline(connected);
                if (connected) {
                    setLastOnlineAt(Date.now());
                }
                else {
                    setWasOffline(true);
                    setLastOfflineAt(Date.now());
                }
            }
            return connected;
        }
        catch {
            if (isOnlineRef.current) {
                setIsOnline(false);
                setWasOffline(true);
                setLastOfflineAt(Date.now());
            }
            return false;
        }
    }, []); // No dependencies — stable reference, never recreated
    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        // Poll connectivity every 30 seconds as a backup
        const interval = setInterval(checkConnection, 30000);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [handleOnline, handleOffline, checkConnection]);
    return { isOnline, wasOffline, lastOnlineAt, lastOfflineAt, checkConnection };
}
//# sourceMappingURL=useOnlineStatus.js.map