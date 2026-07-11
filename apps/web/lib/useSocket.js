'use client';
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
// Derive WS origin from the API URL so it works in both dev and production
// NEXT_PUBLIC_API_URL is e.g. 'http://localhost:3000/api/v1' in dev or 'https://dreamgadgets.in/api/v1' in prod
function getDefaultWsUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
        try {
            return new URL(apiUrl).origin;
        }
        catch {
            // fall through to default
        }
    }
    return 'http://localhost:3000';
}
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || getDefaultWsUrl();
/**
 * Shared socket client instance cache — ensures one socket per namespace+token combo.
 * This avoids creating duplicate connections when multiple components use the hook.
 */
const socketCache = new Map();
function getCacheKey(token, namespace) {
    return `${namespace}::${token ?? 'anonymous'}`;
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
export function useSocket(options = {}) {
    const { namespace = '/', token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null, url = WS_URL, autoConnect = !!token, // only auto-connect when there's an auth token
     } = options;
    const cacheKey = getCacheKey(token, namespace);
    const socketRef = useRef(null);
    const handlersRef = useRef(new Map());
    const connectedRef = useRef(false);
    // Get or create the socket instance
    const getSocket = useCallback(() => {
        if (socketRef.current?.connected) {
            return socketRef.current;
        }
        // Check cache
        const cached = socketCache.get(cacheKey);
        if (cached?.connected) {
            socketRef.current = cached;
            connectedRef.current = true;
            return cached;
        }
        // Create new connection
        const socket = io(url, {
            auth: token ? { token } : undefined,
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
        socket.on('connect', () => {
            connectedRef.current = true;
        });
        socket.on('disconnect', () => {
            connectedRef.current = false;
        });
        socket.on('connect_error', (err) => {
            console.warn('[useSocket] Connection error:', err.message);
        });
        socketCache.set(cacheKey, socket);
        socketRef.current = socket;
        return socket;
    }, [cacheKey, url, token]);
    // Connect on mount if autoConnect
    useEffect(() => {
        if (!autoConnect)
            return;
        const socket = getSocket();
        if (!socket.connected) {
            socket.connect();
        }
        return () => {
            // Don't disconnect on unmount — other components may use the same socket
        };
    }, [autoConnect, getSocket]);
    // Wire up the handler subscription system
    useEffect(() => {
        const socket = getSocket();
        const handlerMap = handlersRef.current;
        // For each registered handler, attach it to the socket
        const unsubs = [];
        handlerMap.forEach((handlers, event) => {
            handlers.forEach((handler) => {
                socket.on(event, handler);
                unsubs.push(() => socket.off(event, handler));
            });
        });
        return () => {
            unsubs.forEach((fn) => fn());
        };
    }, [getSocket]);
    const on = useCallback((event, handler) => {
        const socket = getSocket();
        socket.on(event, handler);
        if (!handlersRef.current.has(event)) {
            handlersRef.current.set(event, new Set());
        }
        handlersRef.current.get(event).add(handler);
        return () => {
            socket.off(event, handler);
            handlersRef.current.get(event)?.delete(handler);
            if (handlersRef.current.get(event)?.size === 0) {
                handlersRef.current.delete(event);
            }
        };
    }, [getSocket]);
    const emit = useCallback((event, data) => {
        const socket = getSocket();
        if (socket.connected) {
            socket.emit(event, data);
        }
        else {
            console.warn(`[useSocket] Cannot emit ${event} — socket not connected`);
        }
    }, [getSocket]);
    const disconnect = useCallback(() => {
        const socket = socketRef.current;
        if (socket) {
            socket.disconnect();
            socketCache.delete(cacheKey);
            connectedRef.current = false;
        }
    }, [cacheKey]);
    const connect = useCallback(() => {
        const socket = getSocket();
        if (!socket.connected) {
            socket.connect();
        }
    }, [getSocket]);
    return {
        on,
        emit,
        disconnect,
        connect,
        connected: connectedRef.current,
    };
}
//# sourceMappingURL=useSocket.js.map