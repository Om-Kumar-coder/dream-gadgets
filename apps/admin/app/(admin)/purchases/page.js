'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
export default function PurchasesPage() {
    const columns = [
        {
            accessorKey: 'invoiceNumber',
            header: 'Invoice #',
            cell: ({ row }) => _jsx("span", { className: "font-mono text-xs", children: row.original.invoiceNumber }),
        },
        {
            accessorKey: 'vendorName',
            header: 'Vendor',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.vendorName }),
        },
        {
            accessorKey: 'branch',
            header: 'Branch',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.branch?.name }),
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
            accessorKey: 'purchaseDate',
            header: 'Date',
            cell: ({ row }) => (_jsx("span", { className: "text-surface-500 text-xs", children: row.original.purchaseDate ? format(new Date(row.original.purchaseDate), 'dd MMM yyyy') : '—' })),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (_jsxs("a", { href: `/api/v1/purchases/${row.original.id}/invoice`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-blue-600 hover:underline text-xs", children: [_jsx(FileText, { className: "w-3 h-3" }), " PDF"] })),
        },
    ];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Purchases" }), _jsx("p", { className: "text-sm text-surface-500", children: "All device acquisitions" })] }), _jsxs(Link, { href: "/purchases/new", className: "btn-primary btn-md", children: [_jsx(Plus, { className: "w-4 h-4" }), "New Purchase"] })] }), _jsx(DataTable, { columns: columns, queryKey: ['purchases'], apiEndpoint: "/purchases", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 })] }));
}
//# sourceMappingURL=page.js.map