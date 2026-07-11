'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { User } from 'lucide-react';
import { DataTable } from '@/components/table';
import { Button } from '@dream-gadgets/ui';
const EKYC_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};
export default function ClientsPage() {
    const columns = [
        {
            accessorKey: 'client',
            header: 'Client',
            cell: ({ row }) => {
                const client = row.original;
                return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center", children: _jsx(User, { className: "w-3.5 h-3.5 text-gray-500" }) }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: [client.firstName, " ", client.lastName] }), _jsx("p", { className: "text-xs text-surface-400", children: client.email })] })] }));
            },
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) => _jsx("span", { className: "font-mono text-xs", children: row.original.phone }),
        },
        {
            accessorKey: 'customerType',
            header: 'Type',
            cell: ({ row }) => (_jsx("span", { className: "capitalize text-xs", children: row.original.customerType ?? 'walk_in' })),
        },
        {
            accessorKey: 'ekycStatus',
            header: 'EKYC',
            cell: ({ row }) => {
                const status = row.original.ekycStatus;
                if (!status)
                    return _jsx("span", { className: "text-xs text-gray-400", children: "\u2014" });
                return (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${EKYC_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`, children: status }));
            },
        },
        {
            accessorKey: 'branch',
            header: 'Branch',
            cell: ({ row }) => _jsx("span", { className: "text-xs text-surface-500", children: row.original.branch?.name }),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (_jsx(Link, { href: `/clients/${row.original.id}`, className: "text-blue-600 hover:underline text-xs", children: "View" })),
        },
    ];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Clients" }), _jsx("p", { className: "text-sm text-surface-500", children: "All registered clients" })] }), _jsxs(Button, { variant: "default", size: "md", children: [_jsx("span", { className: "text-lg leading-none mr-1", children: "+" }), " New Client"] })] }), _jsx(DataTable, { columns: columns, queryKey: ['clients'], apiEndpoint: "/clients", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 })] }));
}
//# sourceMappingURL=page.js.map