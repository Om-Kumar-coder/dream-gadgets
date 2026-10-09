/**
 * Resolve a stored photo path to a usable URL.
 *
 * Uploads are persisted root-relative (e.g. `/uploads/inventory/x.jpg`) but the
 * API serves them under its prefix — `app.useStaticAssets(uploadsPath, { prefix:
 * '/api/v1/uploads' })`. A bare `/uploads/...` path therefore resolves against
 * the frontend host and 404s, so every consumer must prepend the API origin.
 * Mirrors the storefront's `web/lib/images.ts`.
 */
export function resolvePhotoUrl(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
  ).replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
