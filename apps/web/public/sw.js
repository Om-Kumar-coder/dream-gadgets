// Service Worker for Dream Gadgets storefront (PWA).
//
// GUARD PATTERN (mandatory for every future SW in this repo):
//   - Only same-origin requests are handled at all.
//   - NON-GET REQUESTS ARE NEVER INTERCEPTED. POST/PUT/PATCH/DELETE/HEAD go
//     straight to the network. Feeding a POST response into cache.put() throws
//     (the Cache API only supports GET), and the catch then returned a fake 503
//     to the page even though the server replied 200 — that bug silently broke
//     the admin login. If you change this file, keep this guard.
//   - Navigations and API traffic are passed through without caching so the
//     storefront always serves fresh pages, prices and stock.
//
// Only immutable-ish static assets (Next.js chunks + images) are cached.
// Bump CACHE_NAME on every functional change so stale logic never lingers.
const CACHE_NAME = 'dream-gadgets-web-v1';

// ── Install ──
self.addEventListener('install', (event) => {
  // Activate immediately so the (guarded) code takes effect on the next load.
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

  // Only handle same-origin requests (CDN images, fonts, etc. pass through)
  if (url.origin !== self.location.origin) return;

  // GUARD: never intercept non-GET requests (login, cart, checkout, buyback,
  // search, contact...). They must go straight to the network.
  if (event.request.method !== 'GET') return;

  // Never intercept navigations — storefront pages must always be fresh
  // (products, prices, announcements). No stale-HTML fallback.
  if (event.request.mode === 'navigate') return;

  // Never intercept API traffic — live data (prices, stock, branches) must
  // never be served from cache.
  if (url.pathname.startsWith('/api/')) return;

  // Cache static assets + Next.js chunks: serve cached instantly, refresh in
  // the background. Hashed chunks are immutable, so this can't go stale.
  if (
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/.test(url.pathname) ||
    /\/_next\/static\//.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Everything else (public files, manifests): pass through untouched.
});

async function staleWhileRevalidate(request) {
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
