'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../lib/useSocket';
import { useQueryClient } from '@tanstack/react-query';
let toastId = 0;
function ToastContainer({ toasts, onDismiss }) {
    if (toasts.length === 0)
        return null;
    return (_jsx("div", { className: "fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2 max-w-sm", children: toasts.map((t) => (_jsxs("div", { className: `flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-right-2 ${t.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : t.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'}`, children: [_jsx("span", { className: "shrink-0 mt-0.5", children: t.type === 'success' ? '✅' : t.type === 'warning' ? '⚠️' : 'ℹ️' }), _jsx("p", { className: "flex-1", children: t.message }), _jsx("button", { onClick: () => onDismiss(t.id), className: "shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, t.id))) }));
}
export function RealtimeProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const queryClient = useQueryClient();
    const socket = useSocket();
    const toastTimers = useRef(new Map());
    // Cleanup all pending toast timers on unmount
    useEffect(() => {
        const timers = toastTimers.current;
        return () => {
            timers.forEach((t) => clearTimeout(t));
            timers.clear();
        };
    }, []);
    const addToast = (message, type = 'info') => {
        const id = ++toastId;
        setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
        const timer = setTimeout(() => {
            toastTimers.current.delete(id);
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
        toastTimers.current.set(id, timer);
    };
    useEffect(() => {
        if (!socket.connected)
            return;
        const unsub1 = socket.on('order.status_changed', (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order'] });
            const status = data?.status ?? 'updated';
            addToast(`Order #${data?.orderNumber ?? ''} is now ${status.replace(/_/g, ' ')}`, 'info');
        });
        const unsub2 = socket.on('inventory.updated', (data) => {
            queryClient.invalidateQueries({ queryKey: ['public-products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
        });
        const unsub3 = socket.on('return.created', (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            addToast('Return request submitted successfully', 'success');
        });
        const unsub4 = socket.on('sale.created', () => {
            // For authenticated users who may have checkout open
        });
        return () => {
            unsub1();
            unsub2();
            unsub3();
            unsub4();
        };
    }, [socket.connected, queryClient, socket]);
    return (_jsxs(_Fragment, { children: [children, _jsx(ToastContainer, { toasts: toasts, onDismiss: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)) })] }));
}
//# sourceMappingURL=RealtimeProvider.js.map