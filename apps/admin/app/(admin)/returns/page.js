'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { DataTable } from '@/components/table';
import { format } from 'date-fns';
import { useRealtimeUpdates } from '@/lib/useRealtimeUpdates';
const STATUS_COLORS = {
    processed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
};
export default function ReturnsPage() {
    const [returnType, setReturnType] = useState('sale');
    // Auto-refresh on return events
    useRealtimeUpdates({
        'return.created': [['returns']],
    });
    const columns = [
        {
            accessorKey: 'returnNumber',
            header: 'Return #',
            cell: ({ row }) => _jsx("span", { className: "font-mono text-xs", children: row.original.returnNumber }),
        },
        {
            accessorKey: 'returnType',
            header: 'Type',
            cell: ({ row }) => _jsx("span", { className: "capitalize text-xs", children: row.original.returnType }),
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.reason }),
        },
        {
            accessorKey: 'refundAmount',
            header: 'Refund Amount',
            cell: ({ row }) => (_jsxs("span", { children: ["\u20B9", Number(row.original.refundAmount ?? 0).toLocaleString()] })),
        },
        {
            accessorKey: 'refundStatus',
            header: 'Status',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row.original.refundStatus] ?? 'bg-gray-100 text-gray-600'}`, children: row.original.refundStatus })),
        },
        {
            accessorKey: 'createdAt',
            header: 'Date',
            cell: ({ row }) => (_jsx("span", { className: "text-gray-500 text-xs", children: row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy') : '—' })),
        },
    ];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Returns" }), _jsx("p", { className: "text-sm text-surface-500", children: "Manage product returns" })] }) }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsx("button", { onClick: () => setReturnType('sale'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${returnType === 'sale' ? 'bg-primary text-primary-foreground' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`, children: "Sales Returns" }), _jsx("button", { onClick: () => setReturnType('purchase'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${returnType === 'purchase' ? 'bg-primary text-primary-foreground' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`, children: "Purchase Returns" })] }), _jsx(DataTable, { columns: columns, queryKey: ['returns', returnType], apiEndpoint: "/returns", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 })] }));
}
//# sourceMappingURL=page.js.map