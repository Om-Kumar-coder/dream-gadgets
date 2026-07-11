type EventHandler = (...args: any[]) => void;
interface UseSocketOptions {
    /** Namespace to connect to (default: '/') */
    namespace?: string;
    /** Whether to auto-connect on mount (default: true) */
    autoConnect?: boolean;
    /** Auth token — if provided, connects with JWT auth */
    token?: string | null;
    /** Base URL for WebSocket (default: env var or localhost:3000) */
    url?: string;
}
interface UseSocketReturn {
    /** Subscribe to an event. Returns unsubscribe function. */
    on: (event: string, handler: EventHandler) => () => void;
    /** Emit an event with data */
    emit: (event: string, data?: any) => void;
    /** Manually disconnect */
    disconnect: () => void;
    /** Manually connect */
    connect: () => void;
    /** Whether the socket is currently connected */
    connected: boolean;
}
/**
 * useSocket — React hook for Socket.io realtime communication.
 *
 * Usage:
 * ```tsx
 * const socket = useSocket({ token: accessToken });
 * useEffect(() => {
 *   const unsub = socket.on('sale.created', (data) => console.log(data));
 *   return unsub;
 * }, []);
 * ```
 */
export declare function useSocket(options?: UseSocketOptions): UseSocketReturn;
export {};
//# sourceMappingURL=useSocket.d.ts.map