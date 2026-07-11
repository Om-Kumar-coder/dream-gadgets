'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
// ─── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diffMs = now - date;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1)
        return 'Just now';
    if (mins < 60)
        return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7)
        return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function getNotificationIcon(type) {
    switch (type) {
        case 'order_status':
        case 'order_status_changed':
            return '📦';
        case 'refund_processed':
        case 'payment_confirmed':
            return '💰';
        case 'invoice_delivery':
            return '📄';
        case 'buyback_lead':
            return '🔄';
        case 'birthday_offer':
            return '🎂';
        case 'otp':
            return '🔐';
        default:
            return '🔔';
    }
}
function truncateText(text, maxLen) {
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}
// ─── NotificationBell Component ─────────────────────────────────────────────────
export function NotificationBell() {
    const queryClient = useQueryClient();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    // Fetch notifications
    const { data, isLoading, isError } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => apiClient.get('/notifications').then(r => r.data?.data ?? r.data),
        refetchInterval: 30000, // Poll every 30s
        staleTime: 10000,
    });
    const notifications = data?.notifications ?? [];
    const unreadCount = data?.unreadCount ?? 0;
    // Mark single as read
    const markReadMut = useMutation({
        mutationFn: (id) => apiClient.patch(`/notifications/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
    // Mark all as read
    const markAllReadMut = useMutation({
        mutationFn: () => apiClient.patch('/notifications/read-all'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [dropdownOpen]);
    // Close on Escape
    useEffect(() => {
        function handleEscape(event) {
            if (event.key === 'Escape')
                setDropdownOpen(false);
        }
        if (dropdownOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [dropdownOpen]);
    const handleClick = (n) => {
        if (!n.isRead) {
            markReadMut.mutate(n.id);
        }
    };
    const hasUnread = unreadCount > 0;
    return (_jsxs("div", { ref: dropdownRef, className: "relative", children: [_jsxs("button", { onClick: () => setDropdownOpen(o => !o), className: "relative flex items-center justify-center w-9 h-9 rounded-lg text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors focus:outline-none focus:ring-2 focus:ring-surface-200", "aria-label": `Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`, "aria-expanded": dropdownOpen, "aria-haspopup": "true", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }), hasUnread && (_jsx("span", { className: "absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm border-2 border-white animate-dropdown", children: unreadCount > 99 ? '99+' : unreadCount }))] }), dropdownOpen && (_jsx("div", { className: "absolute right-0 top-full mt-2 w-80 origin-top-right animate-dropdown", role: "menu", children: _jsxs("div", { className: "bg-white border border-surface-100 rounded-2xl shadow-xl shadow-black/5 overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-surface-50", children: [_jsx("h3", { className: "text-sm font-semibold text-surface-900", children: "Notifications" }), hasUnread && (_jsx("button", { onClick: () => markAllReadMut.mutate(), disabled: markAllReadMut.isPending, className: "text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50", children: markAllReadMut.isPending ? 'Marking…' : 'Mark all read' }))] }), _jsx("div", { className: "max-h-80 overflow-y-auto", children: isLoading ? (_jsx("div", { className: "px-4 py-8 space-y-3", children: [1, 2, 3].map(i => (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-surface-100 rounded-full animate-pulse shrink-0" }), _jsxs("div", { className: "flex-1 space-y-1.5", children: [_jsx("div", { className: "h-3 bg-surface-100 rounded animate-pulse w-3/4" }), _jsx("div", { className: "h-2.5 bg-surface-50 rounded animate-pulse w-1/2" })] })] }, i))) })) : isError ? (_jsxs("div", { className: "px-4 py-10 text-center", children: [_jsx("div", { className: "text-3xl mb-2", children: "\u26A0\uFE0F" }), _jsx("p", { className: "text-sm text-surface-400 font-medium", children: "Couldn't load notifications" }), _jsx("p", { className: "text-xs text-surface-300 mt-1", children: "Pull down to try again" })] })) : notifications.length === 0 ? (_jsxs("div", { className: "px-4 py-10 text-center", children: [_jsx("div", { className: "text-3xl mb-2", children: "\uD83D\uDD14" }), _jsx("p", { className: "text-sm text-surface-400 font-medium", children: "No notifications yet" }), _jsx("p", { className: "text-xs text-surface-300 mt-1", children: "We'll notify you when something arrives" })] })) : (notifications.map(n => (_jsxs("button", { onClick: () => handleClick(n), className: `w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${n.isRead
                                    ? 'hover:bg-surface-50'
                                    : 'bg-primary/5 hover:bg-primary/10'}`, children: [_jsx("span", { className: "text-lg shrink-0 mt-0.5", children: getNotificationIcon(n.type) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("p", { className: `text-sm ${n.isRead ? 'text-surface-600' : 'text-surface-900 font-semibold'}`, children: n.subject ? truncateText(n.subject, 60) : 'Notification' }), !n.isRead && (_jsx("span", { className: "w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" }))] }), n.body && (_jsx("p", { className: "text-xs text-surface-400 mt-0.5 line-clamp-2", children: n.body.replace(/<[^>]*>/g, '') })), _jsx("p", { className: "text-[10px] text-surface-300 mt-1", children: timeAgo(n.createdAt) })] })] }, n.id)))) })] }) }))] }));
}
//# sourceMappingURL=NotificationBell.js.map