import { create } from 'zustand';
import { persist } from 'zustand/middleware';
function syncToLocalStorage(accessToken, refreshToken) {
    if (accessToken) {
        localStorage.setItem('admin_access_token', accessToken);
    }
    else {
        localStorage.removeItem('admin_access_token');
    }
    if (refreshToken) {
        localStorage.setItem('admin_refresh_token', refreshToken);
    }
    else {
        localStorage.removeItem('admin_refresh_token');
    }
}
export const useAdminAuthStore = create()(persist((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    setTokens: (accessToken, refreshToken, user) => {
        syncToLocalStorage(accessToken, refreshToken);
        set({ accessToken, refreshToken, user });
    },
    logout: () => {
        syncToLocalStorage(null, null);
        set({ user: null, accessToken: null, refreshToken: null });
    },
    hasPermission: (permission) => get().user?.permissions?.includes(permission) ?? false,
}), { name: 'admin-auth-storage' }));
//# sourceMappingURL=auth.store.js.map