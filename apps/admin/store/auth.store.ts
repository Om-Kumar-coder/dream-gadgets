import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JwtPayload } from '@dream-gadgets/shared-types';

interface AdminAuthState {
  user: JwtPayload | null;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string, user: JwtPayload) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      hasPermission: (permission) => get().user?.permissions?.includes(permission) ?? false,
    }),
    { name: 'admin-auth-storage' },
  ),
);
