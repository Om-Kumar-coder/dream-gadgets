'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

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

// Derive WS origin from the API URL so it works in both dev and production
// NEXT_PUBLIC_API_URL is e.g. 'http://localhost:3000/api/v1' in dev or 'https://dreamgadgets.in/api/v1' in prod
function getDefaultWsUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      // fall through to default
    }
  }
  return 'http://localhost:3000';
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || getDefaultWsUrl();

const socketCache = new Map<string, Socket>();

function getCacheKey(token: string | null | undefined, namespace: string): string {
  return `${namespace}::${token ?? 'anonymous'}`;
}

/**
 * useSocket — shared Socket.io hook for the admin app.
 * Uses admin_access_token from localStorage.
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const {
    namespace = '/',
    token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null,
    url = WS_URL,
    autoConnect = true,
  } = options;

  const cacheKey = getCacheKey(token, namespace);
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const connectedRef = useRef(false);

  const getSocket = useCallback((): Socket => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    const cached = socketCache.get(cacheKey);
    if (cached?.connected) {
      socketRef.current = cached;
      connectedRef.current = true;
      return cached;
    }

    const socket = io(url, {
      auth: token ? { token } : undefined,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => { connectedRef.current = true; });
    socket.on('disconnect', () => { connectedRef.current = false; });
    socket.on('connect_error', (err) => {
      console.warn('[useSocket] Admin connection error:', err.message);
    });

    socketCache.set(cacheKey, socket);
    socketRef.current = socket;
    return socket;
  }, [cacheKey, url, token]);

  useEffect(() => {
    if (!autoConnect) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();
  }, [autoConnect, getSocket]);

  const on = useCallback((event: string, handler: EventHandler): (() => void) => {
    const socket = getSocket();
    socket.on(event, handler);

    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    return () => {
      socket.off(event, handler);
      handlersRef.current.get(event)?.delete(handler);
      if (handlersRef.current.get(event)?.size === 0) {
        handlersRef.current.delete(event);
      }
    };
  }, [getSocket]);

  const emit = useCallback((event: string, data?: any) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit(event, data);
    } else {
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
    if (!socket.connected) socket.connect();
  }, [getSocket]);

  return { on, emit, disconnect, connect, connected: connectedRef.current };
}
