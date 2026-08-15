import axios from 'axios';

// Track in-flight refresh to avoid concurrent requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

/**
 * Fully clear all auth state — localStorage tokens AND the zustand persisted store.
 * This prevents the redirect loop where hydrate() re-syncs expired tokens.
 */
function clearAllAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth-storage'); // zustand persist key
}

/**
 * Redirect to login only if we are not already on an auth page.
 * This prevents a redirect loop (home → login → home → login).
 */
function safeRedirectToLogin() {
  const currentPath = window.location.pathname;
  if (
    currentPath === '/login' ||
    currentPath === '/register' ||
    currentPath.startsWith('/reset-password')
  ) {
    return; // Already on an auth page — don't redirect again
  }
  window.location.href = '/login';
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
});

// Auth endpoints must never carry a (possibly stale) session token. A stale
// bearer on /auth/login would make the response interceptor treat a login
// 401 as an expired-session 401 and try to refresh — wasting the click and
// showing a confusing error instead of "Invalid credentials".
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/login-otp',
  '/auth/login-otp/verify',
  '/auth/refresh',
  '/auth/send-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Attach JWT from localStorage on each request (except auth endpoints)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => config.url?.includes(p));
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});



// Auto-refresh on 401 — only for requests that had an auth token
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Don't retry if:
    // - No response (network error)
    // - Not a 401
    // - Already retried
    // - Was the refresh endpoint itself (avoid infinite loop)
    // - No auth header was present
    if (
      !error.response ||
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    const hadAuthHeader = original.headers?.Authorization;
    if (!hadAuthHeader) {
      return Promise.reject(error);
    }

    original._retry = true;

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh`,
        { refreshToken },
      );

      const accessToken = data?.data?.accessToken;
      const newRefreshToken = data?.data?.refreshToken;

      if (!accessToken || !newRefreshToken) {
        throw new Error('Invalid refresh response');
      }

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', newRefreshToken);

      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (err) {
      processQueue(err, null);
      clearAllAuth();
      safeRedirectToLogin();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
