'use client';
import { useEffect } from 'react';
/**
 * ServiceWorkerRegister — registers the service worker for offline caching.
 */
export function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Register service worker
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                console.log('[SW] Registered:', registration.scope);
            })
                .catch((error) => {
                console.warn('[SW] Registration failed:', error);
            });
        }
    }, []);
    return null;
}
//# sourceMappingURL=ServiceWorkerRegister.js.map