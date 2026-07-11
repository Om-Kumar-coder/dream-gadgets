import { JwtPayload } from '@dream-gadgets/shared-types';
interface AdminAuthState {
    user: JwtPayload | null;
    accessToken: string | null;
    refreshToken: string | null;
    setTokens: (accessToken: string, refreshToken: string, user: JwtPayload) => void;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
}
export declare const useAdminAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AdminAuthState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AdminAuthState, AdminAuthState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AdminAuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AdminAuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AdminAuthState, AdminAuthState>>;
    };
}>;
export {};
//# sourceMappingURL=auth.store.d.ts.map