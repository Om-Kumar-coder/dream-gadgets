// Service Worker for Dream Gadgets Admin
// Provides offline caching for the POS terminal and admin panel.

const CACHE_NAME = 'dream-gadgets-admin-v1';

// Resources to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/sales/pos',
  '/sales',
  '/inventory',
  '/clients',
  '/dashboard',
];

// Cache strategies by URL pattern
const STRATEGIES = [
  // API calls — network first, fallback to cache
  { pattern: /\/api\/v1\//, strategy: 'network-first' },
  // Pages — network first, with offline fallback
  { pattern: /\/sales\/pos/, strategy: 'network-first' },
  { pattern: /\/sales/, strategy: 'network-first' },
  { pattern: /\/inventory/, strategy: 'network-first' },
  // Static assets — cache first
  { pattern: /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/, strategy: 'cache-first' },
  // Next.js data — stale while revalidate
  { pattern: /\/_next\//, strategy: 'stale-while-revalidate' },
];

// ── Install ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }),
  );
  // Activate immediately
  self.skipWaiting();
});

// ── Activate ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// ── Fetch ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Find matching strategy
  for (const { pattern, strategy } of STRATEGIES) {
    if (pattern.test(url.pathname) || pattern.test(event.request.url)) {
      event.respondWith(handleStrategy(event.request, strategy));
      return;
    }
  }

  // Default: network first with cache fallback
  event.respondWith(networkFirst(event.request));
});

// ── Strategy Handlers ──

async function handleStrategy(request: Request, strategy: string): Promise<Response> {
  switch (strategy) {
    case 'network-first':
      return networkFirst(request);
    case 'cache-first':
      return cacheFirst(request);
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request);
    default:
      return fetch(request);
  }
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return an offline fallback page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached ?? fetchPromise;
}

// ── Background Sync ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-sales') {
    event.waitUntil(syncOfflineSales());
  }
});

async function syncOfflineSales() {
  // Notify all clients to trigger sync
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_OFFLINE_SALES' });
  });
}
