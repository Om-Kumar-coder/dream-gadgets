import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JwtPayload } from '@dream-gadgets/shared-types';

interface AuthState {
  user: JwtPayload | null;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string, user: JwtPayload) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'auth-storage' },
  ),
);

// Alias for web app usage
export const useWebAuthStore = useAuthStore;
