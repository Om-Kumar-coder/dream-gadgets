/**
 * Admin session cookie.
 *
 * This cookie is a *presence marker* used by the Next.js middleware to gate hard
 * (server) navigations. It deliberately does NOT store the JWT: the access token
 * is ~4 KB, which exceeds the browser's per-cookie size limit, so assigning the
 * raw token to `document.cookie` silently fails and the middleware then bounces
 * every hard navigation to /login. The real token stays in localStorage and is
 * attached as a Bearer header by the axios interceptor.
 */
export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_VALUE = '1';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days — matches refresh-token lifetime

export function setSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ADMIN_SESSION_COOKIE}=${ADMIN_SESSION_VALUE}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
