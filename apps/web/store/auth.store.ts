import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JwtPayload } from '@dream-gadgets/shared-types';

interface AuthState {
  user: JwtPayload | null;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string, user: JwtPayload) => void;
  logout: () => void;
  hydrate: () => void;
}

function syncToLocalStorage(accessToken: string | null, refreshToken: string | null) {
  if (accessToken) {
    localStorage.setItem('access_token', accessToken);
  } else {
    localStorage.removeItem('access_token');
  }
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  } else {
    localStorage.removeItem('refresh_token');
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
      hydrate: () => {
        // On app mount, ensure localStorage access_token matches store
        const stored = localStorage.getItem('access_token');
        const state = useAuthStore.getState();
        if (stored && !state.accessToken) {
          // Token in localStorage but not in store — rehydrate from persisted store
          const persisted = localStorage.getItem('auth-storage');
          if (persisted) {
            try {
              const parsed = JSON.parse(persisted);
              if (parsed?.state?.accessToken) {
                set(parsed.state);
              }
            } catch {}
          }
        } else if (state.accessToken && !stored) {
          // Store has token but localStorage doesn't — sync it
          syncToLocalStorage(state.accessToken, state.refreshToken);
        }
      },
    }),
    { name: 'auth-storage' },
  ),
);

// Alias for web app usage
export const useWebAuthStore = useAuthStore;
