'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Eye, XCircle, Package } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { toast } from 'react-hot-toast';
import { useRealtimeUpdates } from '@/lib/useRealtimeUpdates';
const STATUS_COLORS = {
    pending_payment: 'bg-yellow-100 text-yellow-700',
    payment_confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    packed: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    out_for_delivery: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    return_requested: 'bg-orange-100 text-orange-700',
    returned: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700',
};
const PAYMENT_STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
};
export default function OnlineOrdersPage() {
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');
    // Auto-refresh on order events
    useRealtimeUpdates({
        'order.created': [['orders']],
        'order.status_changed': [['orders']],
        'payment.confirmed': [['orders']],
    });
    const cancelOrder = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.post(`/orders/${id}/cancel`);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order cancelled successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        },
    });
    const columns = [
        {
            accessorKey: 'orderNumber',
            header: 'Order #',
            cell: ({ row }) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Package, { className: "w-3.5 h-3.5 text-gray-400" }), _jsx("span", { className: "font-mono text-xs font-medium", children: row.original.orderNumber })] })),
        },
        {
            accessorKey: 'client',
            header: 'Customer',
            cell: ({ row }) => {
                const client = row.original.client;
                if (!client)
                    return _jsx("span", { className: "text-gray-400 text-sm", children: "Guest" });
                return (_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium", children: [client.firstName ?? '', " ", client.lastName ?? ''] }), client.email && (_jsx("p", { className: "text-xs text-surface-400", children: client.email }))] }));
            },
        },
        {
            accessorKey: 'items',
            header: 'Items',
            cell: ({ row }) => (_jsx("span", { className: "text-sm", children: row.original.items?.length ?? 0 })),
        },
        {
            accessorKey: 'totalAmount',
            header: 'Total',
            cell: ({ row }) => (_jsxs("span", { className: "font-medium", children: ["\u20B9", Number(row.original.totalAmount).toLocaleString('en-IN')] })),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row.original.status] ?? 'bg-gray-100 text-gray-600'}`, children: row.original.status })),
        },
        {
            accessorKey: 'paymentStatus',
            header: 'Payment',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_COLORS[row.original.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`, children: row.original.paymentStatus })),
        },
        {
            accessorKey: 'paymentMethod',
            header: 'Method',
            cell: ({ row }) => (_jsx("span", { className: "text-sm capitalize text-gray-600", children: row.original.paymentMethod ?? '—' })),
        },
        {
            accessorKey: 'branch',
            header: 'Branch',
            cell: ({ row }) => (_jsx("span", { className: "text-xs text-surface-500", children: row.original.branch?.name ?? '—' })),
        },
        {
            accessorKey: 'orderedAt',
            header: 'Date',
            cell: ({ row }) => (_jsx("span", { className: "text-surface-500 text-xs", children: row.original.orderedAt
                    ? format(new Date(row.original.orderedAt), 'dd MMM yyyy')
                    : '—' })),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const order = row.original;
                return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Link, { href: `/orders/${order.id}`, className: "p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100", title: "View details", children: _jsx(Eye, { className: "w-3.5 h-3.5" }) }), order.status !== 'cancelled' && order.status !== 'delivered' && (_jsx("button", { onClick: () => {
                                if (confirm(`Cancel order ${order.orderNumber}?`)) {
                                    cancelOrder.mutate(order.id);
                                }
                            }, disabled: cancelOrder.isPending, className: "p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50", title: "Cancel order", children: _jsx(XCircle, { className: "w-3.5 h-3.5" }) }))] }));
            },
        },
    ];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Online Orders" }), _jsx("p", { className: "text-sm text-surface-500", children: "Customer orders placed through the website" })] }) }), _jsx("div", { className: "flex gap-2 flex-wrap", children: [
                    '',
                    'pending_payment',
                    'payment_confirmed',
                    'processing',
                    'packed',
                    'shipped',
                    'out_for_delivery',
                    'delivered',
                    'return_requested',
                    'returned',
                    'cancelled',
                ].map((status) => (_jsx("button", { onClick: () => setStatusFilter(status), className: `badge text-xs px-3 py-1.5 transition-colors ${statusFilter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'badge-neutral cursor-pointer hover:bg-surface-200'}`, children: status ? status.replace(/_/g, ' ') : 'All' }, status || 'all'))) }), _jsx(DataTable, { columns: columns, queryKey: ['orders', statusFilter], apiEndpoint: "/orders", queryParams: { status: statusFilter || undefined }, enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20, renderNoResults: () => (_jsxs("div", { className: "py-12 text-center", children: [_jsx("div", { className: "text-gray-400 text-4xl mb-2", children: "\uD83D\uDCE6" }), _jsx("p", { className: "text-gray-500", children: "No orders found" }), statusFilter && (_jsx("button", { onClick: () => setStatusFilter(''), className: "text-blue-600 hover:underline text-sm mt-2", children: "Clear status filter" }))] })) })] }));
}
//# sourceMappingURL=page.js.map