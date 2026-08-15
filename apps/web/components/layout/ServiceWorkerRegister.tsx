'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegister — registers the storefront service worker (PWA).
 * The SW (public/sw.js) only caches static assets and NEVER intercepts
 * non-GET or API/navigation traffic, so it cannot corrupt API calls.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
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
