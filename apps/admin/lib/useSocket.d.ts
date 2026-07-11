type EventHandler = (...args: any[]) => void;
interface UseSocketOptions {
    namespace?: string;
    autoConnect?: boolean;
    token?: string | null;
    url?: string;
}
interface UseSocketReturn {
    on: (event: string, handler: EventHandler) => () => void;
    emit: (event: string, data?: any) => void;
    disconnect: () => void;
    connect: () => void;
    connected: boolean;
}
/**
 * useSocket — shared Socket.io hook for the admin app.
 * Uses admin_access_token from localStorage.
 */
export declare function useSocket(options?: UseSocketOptions): UseSocketReturn;
export {};
//# sourceMappingURL=useSocket.d.ts.map