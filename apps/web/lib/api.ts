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

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
});

// Attach JWT from localStorage on each request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
