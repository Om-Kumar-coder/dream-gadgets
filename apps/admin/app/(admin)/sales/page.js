'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FileText, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { toast } from 'react-hot-toast';
import { useRealtimeUpdates } from '@/lib/useRealtimeUpdates';
const STATUS_COLORS = {
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    voided: 'bg-red-100 text-red-700',
};
export default function SalesPage() {
    const qc = useQueryClient();
    // Auto-refresh on sale events
    useRealtimeUpdates({
        'sale.created': [['sales']],
        'sale.voided': [['sales']],
    });
    const columns = [
        {
            accessorKey: 'invoiceNumber',
            header: 'Invoice #',
            cell: ({ row }) => (_jsx("span", { className: "font-mono text-xs", children: row.original.invoiceNumber })),
        },
        {
            accessorKey: 'client',
            header: 'Client',
            cell: ({ row }) => {
                const client = row.original.client;
                if (!client)
                    return _jsx("span", { className: "text-gray-400", children: "Walk-in" });
                return (_jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [client.firstName ?? '', " ", client.lastName ?? ''] }), client.email && (_jsx("div", { className: "text-xs text-gray-400", children: client.email }))] }));
            },
        },
        {
            accessorKey: 'branch',
            header: 'Branch',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.branch?.name ?? 'N/A' }),
        },
        {
            accessorKey: 'items',
            header: 'Items',
            cell: ({ row }) => _jsx("span", { children: row.original.items?.length ?? 0 }),
        },
        {
            accessorKey: 'totalAmount',
            header: 'Total',
            cell: ({ row }) => (_jsxs("span", { className: "font-medium", children: ["\u20B9", Number(row.original.totalAmount).toLocaleString()] })),
        },
        {
            accessorKey: 'paymentStatus',
            header: 'Status',
            cell: ({ row }) => {
                const isVoided = row.original.isVoided;
                const status = isVoided ? 'voided' : row.original.paymentStatus;
                return (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`, children: status }));
            },
        },
        {
            accessorKey: 'saleDate',
            header: 'Date',
            cell: ({ row }) => (_jsx("span", { className: "text-gray-500", children: row.original.saleDate ? format(new Date(row.original.saleDate), 'dd MMM yyyy') : '—' })),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => _jsx(SaleActions, { sale: row.original }),
        },
    ];
    const voidSale = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.post(`/sales/${id}/void`);
            return data;
        },
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: ['sales'] });
            toast.success('Sale voided successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to void sale');
        },
    });
    const SaleActions = ({ sale }) => {
        const [showMenu, setShowMenu] = useState(false);
        return (_jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowMenu(!showMenu), className: "text-gray-600 hover:text-blue-600 transition-colors", children: _jsx(MoreHorizontal, { className: "w-4 h-4" }) }), showMenu && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setShowMenu(false) }), _jsxs("div", { className: "absolute right-0 top-6 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1", children: [_jsxs(Link, { href: `/api/v1/sales/${sale.id}/invoice`, target: "_blank", rel: "noreferrer", className: "flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50", children: [_jsx(FileText, { className: "w-3.5 h-3.5" }), " View PDF"] }), _jsxs(Link, { href: `/sales/${sale.id}`, className: "flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50", children: [_jsx(Eye, { className: "w-3.5 h-3.5" }), " View Details"] }), !sale.isVoided && (_jsxs("button", { onClick: () => {
                                        if (confirm('Are you sure you want to void this sale?')) {
                                            voidSale.mutate(sale.id);
                                        }
                                    }, disabled: voidSale.isPending, className: "flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left", children: [_jsx(Trash2, { className: "w-3.5 h-3.5" }), " Void Sale"] }))] })] }))] }));
    };
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Sales" }), _jsx("p", { className: "text-sm text-surface-500", children: "All completed transactions" })] }), _jsxs(Link, { href: "/sales/pos", className: "btn-primary btn-md", children: [_jsx(Plus, { className: "w-4 h-4" }), "New Sale (POS)"] })] }), _jsx(DataTable, { columns: columns, queryKey: ['sales'], apiEndpoint: "/sales", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20, renderNoResults: () => (_jsxs("div", { className: "py-12 text-center", children: [_jsx("div", { className: "text-gray-400 text-4xl mb-2", children: "\uD83D\uDD0D" }), _jsx("p", { className: "text-gray-500", children: "No sales found" })] })) })] }));
}
//# sourceMappingURL=page.js.map