/**
 * Resolve an image URL returned by the API into something the browser can load.
 *
 * Uploaded product/banner images are stored as root-relative paths
 * (e.g. `/uploads/inventory/<file>.jpg`) and served by the API at
 * `<API_BASE>/uploads/...`. Absolute URLs (CDN, S3, data URIs) pass through
 * untouched, as do the local `/images/...` placeholder assets bundled with the
 * web app.
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');

export function resolveImageUrl(url?: string | null): string | null {
  if (!url) return null;
  // Already absolute (http/https/data/blob) — leave as-is.
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  // Locally bundled Next.js public assets must not be prefixed with the API base.
  if (url.startsWith('/images/')) return url;
  // Root-relative upload path served by the API.
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return url;
}
