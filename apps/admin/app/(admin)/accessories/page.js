'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Globe, EyeOff } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { toast } from 'react-hot-toast';
const CATEGORY_LABELS = {
    charger: 'Charger',
    case: 'Case',
    screen_guard: 'Screen Guard',
    earphones: 'Earphones',
    cable: 'Cable',
    power_bank: 'Power Bank',
    stand: 'Stand',
    cleaning_kit: 'Cleaning Kit',
    tempered_glass: 'Tempered Glass',
    adapter: 'Adapter',
};
const CATEGORY_COLORS = {
    charger: 'bg-blue-100 text-blue-700',
    case: 'bg-purple-100 text-purple-700',
    screen_guard: 'bg-emerald-100 text-emerald-700',
    earphones: 'bg-amber-100 text-amber-700',
    cable: 'bg-gray-100 text-gray-700',
    power_bank: 'bg-orange-100 text-orange-700',
    stand: 'bg-teal-100 text-teal-700',
    cleaning_kit: 'bg-pink-100 text-pink-700',
    tempered_glass: 'bg-cyan-100 text-cyan-700',
    adapter: 'bg-indigo-100 text-indigo-700',
};
export default function AccessoriesPage() {
    const qc = useQueryClient();
    const toggleOnline = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.patch(`/accessories/${id}/toggle-online`);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['accessories'] });
            toast.success('Accessory status updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });
    const columns = [
        {
            accessorKey: 'sku',
            header: 'SKU',
            cell: ({ row }) => _jsx("span", { className: "font-mono text-xs", children: row.original.sku }),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (_jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: row.original.name }), row.original.brand && (_jsx("p", { className: "text-xs text-surface-400", children: row.original.brand.name }))] })),
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[row.original.category] ?? 'bg-gray-100 text-gray-600'}`, children: CATEGORY_LABELS[row.original.category] ?? row.original.category })),
        },
        {
            accessorKey: 'stockQuantity',
            header: 'Stock',
            cell: ({ row }) => {
                const qty = row.original.stockQuantity;
                const reorder = row.original.reorderLevel;
                const isLow = qty < reorder;
                return (_jsxs("span", { className: `text-sm font-medium ${isLow ? 'text-red-600' : qty === 0 ? 'text-gray-400' : 'text-surface-700'}`, children: [qty, isLow && _jsx("span", { className: "ml-1 text-[10px] text-red-500", children: "(Low)" })] }));
            },
        },
        {
            accessorKey: 'purchasePrice',
            header: 'Cost',
            cell: ({ row }) => (_jsxs("span", { className: "text-sm", children: ["\u20B9", Number(row.original.purchasePrice).toLocaleString()] })),
        },
        {
            accessorKey: 'sellingPrice',
            header: 'Price',
            cell: ({ row }) => (_jsx("span", { className: "text-sm font-medium", children: row.original.sellingPrice
                    ? `₹${Number(row.original.sellingPrice).toLocaleString()}`
                    : '—' })),
        },
        {
            accessorKey: 'isOnline',
            header: 'Online',
            cell: ({ row }) => (_jsx("button", { onClick: () => toggleOnline.mutate(row.original.id), disabled: toggleOnline.isPending, title: row.original.isOnline ? 'Remove from website' : 'List on website', className: `p-1 rounded transition-colors ${row.original.isOnline
                    ? 'text-green-600 hover:text-red-500'
                    : 'text-gray-400 hover:text-green-600'}`, children: row.original.isOnline ? _jsx(Globe, { className: "w-4 h-4" }) : _jsx(EyeOff, { className: "w-4 h-4" }) })),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${row.original.status === 'available'
                    ? 'bg-green-100 text-green-700'
                    : row.original.status === 'out_of_stock'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'}`, children: row.original.status.replace('_', ' ') })),
        },
    ];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Accessories" }), _jsx("p", { className: "text-sm text-surface-500", children: "Manage non-IMEI inventory \u2014 cases, chargers, cables, and more" })] }), _jsxs(Link, { href: "/accessories/new", className: "btn-primary btn-md", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Accessory"] })] }), _jsx(DataTable, { columns: columns, queryKey: ['accessories'], apiEndpoint: "/accessories", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 })] }));
}
//# sourceMappingURL=page.js.map