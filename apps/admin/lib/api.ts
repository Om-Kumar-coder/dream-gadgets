import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh`,
          { refreshToken },
        );
        localStorage.setItem('admin_access_token', data.data.accessToken);
        localStorage.setItem('admin_refresh_token', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(original);
      } catch {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
