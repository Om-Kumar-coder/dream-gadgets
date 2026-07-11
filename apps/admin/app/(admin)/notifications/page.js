'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Filter, RotateCcw, Loader2, } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';
const STATUS_COLORS = {
    sent: 'text-green-600 bg-green-50 border-green-200',
    failed: 'text-red-600 bg-red-50 border-red-200',
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
};
const STATUS_ICONS = {
    sent: CheckCircle,
    failed: XCircle,
    pending: Clock,
};
const CHANNEL_ICONS = {
    email: Mail,
    sms: Smartphone,
    whatsapp: MessageSquare,
    in_app: Bell,
};
const CHANNEL_COLORS = {
    email: 'text-blue-600 bg-blue-50',
    sms: 'text-purple-600 bg-purple-50',
    whatsapp: 'text-green-600 bg-green-50',
    in_app: 'text-orange-600 bg-orange-50',
};
export default function AdminNotificationsPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');
    const [channelFilter, setChannelFilter] = useState('');
    const [page, setPage] = useState(1);
    const pollingRef = useRef(null);
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-notifications', statusFilter, channelFilter, page],
        queryFn: async () => {
            const params = { page: String(page), limit: '20' };
            if (statusFilter)
                params.status = statusFilter;
            if (channelFilter)
                params.channel = channelFilter;
            const { data: res } = await apiClient.get('/admin/notifications', { params });
            return res;
        },
    });
    // Poll for new notifications every 10 seconds
    useEffect(() => {
        pollingRef.current = setInterval(() => {
            refetch();
        }, 10000);
        return () => {
            if (pollingRef.current)
                clearInterval(pollingRef.current);
        };
    }, [refetch]);
    const retryMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.post(`/admin/notifications/${id}/retry`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });
    const retryAllMutation = useMutation({
        mutationFn: async () => {
            await apiClient.post('/admin/notifications/retry-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });
    const notifications = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / 20);
    const failedCount = notifications.filter((n) => n.status === 'failed').length;
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Notifications" }), _jsxs("p", { className: "text-sm text-surface-500 mt-0.5", children: ["Delivery tracking & management \u2014 ", total, " total"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [failedCount > 0 && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => retryAllMutation.mutate(), disabled: retryAllMutation.isPending, className: "inline-flex items-center gap-1.5 text-xs", children: [_jsx(RotateCcw, { className: "w-3.5 h-3.5" }), retryAllMutation.isPending ? 'Retrying...' : `Retry All (${failedCount})`] })), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => refetch(), className: "inline-flex items-center gap-1.5 text-xs", children: [_jsx(RefreshCw, { className: "w-3.5 h-3.5" }), "Refresh"] })] })] }), _jsx("div", { className: "card p-4", children: _jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-surface-400" }), _jsx("span", { className: "text-xs font-medium text-surface-600", children: "Filters" })] }), _jsxs("select", { value: statusFilter, onChange: (e) => { setStatusFilter(e.target.value); setPage(1); }, className: "border border-surface-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "sent", children: "Sent" }), _jsx("option", { value: "failed", children: "Failed" }), _jsx("option", { value: "pending", children: "Pending" })] }), _jsxs("select", { value: channelFilter, onChange: (e) => { setChannelFilter(e.target.value); setPage(1); }, className: "border border-surface-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all", children: [_jsx("option", { value: "", children: "All Channels" }), _jsx("option", { value: "email", children: "Email" }), _jsx("option", { value: "sms", children: "SMS" }), _jsx("option", { value: "whatsapp", children: "WhatsApp" }), _jsx("option", { value: "in_app", children: "In-App" })] })] }) }), _jsx("div", { className: "grid grid-cols-4 gap-3", children: [
                    { label: 'Total', count: total, color: 'bg-blue-500', icon: Bell },
                    { label: 'Sent', count: notifications.filter((n) => n.status === 'sent').length, color: 'bg-green-500', icon: CheckCircle },
                    { label: 'Failed', count: failedCount, color: 'bg-red-500', icon: XCircle },
                    { label: 'Pending', count: notifications.filter((n) => n.status === 'pending').length, color: 'bg-yellow-500', icon: Clock },
                ].map((s) => (_jsxs("div", { className: "card p-4 flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${s.color}`, children: _jsx(s.icon, { className: "w-4 h-4 text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: s.label }), _jsx("p", { className: "text-lg font-bold text-surface-900", children: s.count })] })] }, s.label))) }), _jsxs("div", { className: "card overflow-hidden", children: [isLoading ? (_jsx("div", { className: "flex items-center justify-center py-16", children: _jsx(Loader2, { className: "w-6 h-6 text-gray-400 animate-spin" }) })) : notifications.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-gray-400", children: [_jsx(Bell, { className: "w-10 h-10 mb-3" }), _jsx("p", { className: "text-sm font-medium", children: "No notifications found" }), _jsx("p", { className: "text-xs mt-1", children: "Try adjusting your filters" })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "table-header", children: [_jsx("th", { className: "table-cell text-left", children: "Status" }), _jsx("th", { className: "table-cell text-left", children: "Channel" }), _jsx("th", { className: "table-cell text-left", children: "Type" }), _jsx("th", { className: "table-cell text-left", children: "Subject / Body" }), _jsx("th", { className: "table-cell text-left", children: "Target" }), _jsx("th", { className: "table-cell text-center", children: "Attempts" }), _jsx("th", { className: "table-cell text-left", children: "Created" }), _jsx("th", { className: "table-cell text-center", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-50", children: notifications.map((n) => {
                                        const StatusIcon = STATUS_ICONS[n.status] ?? Clock;
                                        const ChannelIcon = CHANNEL_ICONS[n.channel] ?? Bell;
                                        const statusClass = STATUS_COLORS[n.status] ?? 'text-gray-600 bg-gray-50 border-gray-200';
                                        const channelClass = CHANNEL_COLORS[n.channel] ?? 'text-gray-600 bg-gray-50';
                                        return (_jsxs("tr", { className: "table-row", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`, children: [_jsx(StatusIcon, { className: "w-3 h-3" }), n.status] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${channelClass}`, children: [_jsx(ChannelIcon, { className: "w-3 h-3" }), n.channel] }) }), _jsx("td", { className: "px-4 py-3 text-xs text-gray-700 font-mono max-w-[120px] truncate", children: n.type }), _jsxs("td", { className: "px-4 py-3 max-w-[240px]", children: [_jsx("p", { className: "text-xs font-medium text-gray-900 truncate", children: n.subject ?? '—' }), n.errorMessage && n.status === 'failed' && (_jsxs("p", { className: "text-[10px] text-red-500 truncate mt-0.5", title: n.errorMessage, children: [_jsx(AlertTriangle, { className: "w-2.5 h-2.5 inline mr-0.5" }), n.errorMessage] }))] }), _jsx("td", { className: "px-4 py-3 text-xs text-gray-500 font-mono max-w-[140px] truncate", children: n.target ?? '—' }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("span", { className: `text-xs font-mono ${n.attempts > 0 ? 'text-gray-700' : 'text-gray-400'}`, children: n.attempts }) }), _jsx("td", { className: "px-4 py-3 text-xs text-gray-500 whitespace-nowrap", children: new Date(n.createdAt).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }) }), _jsx("td", { className: "px-4 py-3 text-center", children: n.status === 'failed' && (_jsxs("button", { onClick: () => retryMutation.mutate(n.id), disabled: retryMutation.isPending, className: "inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors", title: "Retry delivery", children: [_jsx(RotateCcw, { className: "w-3 h-3" }), "Retry"] })) })] }, n.id));
                                    }) })] }) })), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-surface-100", children: [_jsxs("p", { className: "text-xs text-surface-500", children: ["Page ", page, " of ", totalPages, " (", total, " total)"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page <= 1, className: "px-3 py-1 text-xs font-medium text-surface-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: "Previous" }), _jsx("button", { onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page >= totalPages, className: "px-3 py-1 text-xs font-medium text-surface-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: "Next" })] })] }))] })] }));
}
//# sourceMappingURL=page.js.map