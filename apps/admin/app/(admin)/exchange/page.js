'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { Button } from '@dream-gadgets/ui';
const CONDITION_COLORS = {
    sealed_pack: 'bg-blue-100 text-blue-700',
    open_box: 'bg-purple-100 text-purple-700',
    super_mint: 'bg-emerald-100 text-emerald-700',
    mint: 'bg-teal-100 text-teal-700',
    good: 'bg-gray-100 text-gray-700',
};
const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    assessed: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
};
export default function ExchangePage() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const columns = [
        {
            accessorKey: 'device',
            header: 'Device',
            cell: ({ row }) => (_jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: [row.original.brand, " ", row.original.model] }), _jsxs("p", { className: "text-xs text-surface-400", children: [row.original.storage ?? '—', " \u00B7 ", row.original.colour ?? '—'] })] })),
        },
        {
            accessorKey: 'imei',
            header: 'IMEI',
            cell: ({ row }) => _jsx("span", { className: "font-mono text-xs", children: row.original.imei ?? '—' }),
        },
        {
            accessorKey: 'condition',
            header: 'Condition',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${CONDITION_COLORS[row.original.condition] ?? 'bg-gray-100 text-gray-600'}`, children: row.original.condition?.replace('_', ' ') })),
        },
        {
            accessorKey: 'batteryHealth',
            header: 'Battery',
            cell: ({ row }) => (_jsx("span", { className: "text-xs", children: row.original.batteryHealth ? `${row.original.batteryHealth}%` : '—' })),
        },
        {
            accessorKey: 'exchangePrice',
            header: 'Exchange Price',
            cell: ({ row }) => (_jsxs("span", { className: "font-medium", children: ["\u20B9", Number(row.original.exchangePrice).toLocaleString()] })),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row.original.status] ?? 'bg-gray-100 text-gray-600'}`, children: row.original.status })),
        },
        {
            accessorKey: 'createdAt',
            header: 'Date',
            cell: ({ row }) => (_jsx("span", { className: "text-surface-500 text-xs", children: row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy') : '—' })),
        },
    ];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Exchange Devices" }), _jsx("p", { className: "text-sm text-surface-500", children: "Manage exchange devices" })] }), _jsxs(Button, { variant: "default", size: "md", children: [_jsx(Plus, { className: "w-4 h-4" }), "New Exchange"] })] }), _jsx(DataTable, { columns: columns, queryKey: ['exchanges', search], apiEndpoint: "/exchanges", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20, renderNoResults: () => (_jsxs("div", { className: "py-12 text-center", children: [_jsx("div", { className: "text-gray-400 text-4xl mb-2", children: "\uD83D\uDD0D" }), _jsx("p", { className: "text-gray-500", children: "No exchange records found" }), _jsx("button", { onClick: () => setSearch(''), className: "text-blue-600 hover:underline text-sm mt-2", children: "Clear search" })] })) })] }));
}
//# sourceMappingURL=page.js.map