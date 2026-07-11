'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Globe, EyeOff } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { toast } from 'react-hot-toast';
import { useRealtimeUpdates } from '@/lib/useRealtimeUpdates';
const CONDITIONS = ['sealed_pack', 'open_box', 'super_mint', 'mint', 'good'];
const STATUSES = ['available', 'sold', 'transferred', 'returned', 'booked', 'in_cart', 'scrapped'];
const CONDITION_COLORS = {
    sealed_pack: 'bg-blue-100 text-blue-700',
    open_box: 'bg-purple-100 text-purple-700',
    super_mint: 'bg-emerald-100 text-emerald-700',
    mint: 'bg-teal-100 text-teal-700',
    good: 'bg-gray-100 text-gray-700',
};
const STATUS_COLORS = {
    available: 'bg-green-100 text-green-700',
    sold: 'bg-gray-100 text-gray-500',
    transferred: 'bg-blue-100 text-blue-700',
    returned: 'bg-yellow-100 text-yellow-700',
    booked: 'bg-orange-100 text-orange-700',
    in_cart: 'bg-pink-100 text-pink-700',
    scrapped: 'bg-red-100 text-red-700',
};
export default function InventoryPage() {
    const qc = useQueryClient();
    // Auto-refresh on inventory events
    useRealtimeUpdates({
        'inventory.updated': [['inventory']],
        'sale.created': [['inventory']], // items become 'sold'
        'sale.voided': [['inventory']], // items restored
        'stock.transfer.created': [['inventory']],
        'stock.transfer.received': [['inventory']],
        'stock.transfer.updated': [['inventory']],
    });
    const columns = [
        {
            accessorKey: 'imei',
            header: 'IMEI',
            cell: ({ row }) => _jsx("span", { className: "font-mono text-xs", children: row.original.imei }),
        },
        {
            accessorKey: 'device',
            header: 'Device',
            cell: ({ row }) => (_jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: [row.original.brand?.name ?? row.original.brand, " ", row.original.model?.name ?? row.original.model] }), _jsxs("p", { className: "text-xs text-surface-400", children: [row.original.storage, " \u00B7 ", row.original.colour] })] })),
        },
        {
            accessorKey: 'condition',
            header: 'Condition',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${CONDITION_COLORS[row.original.condition] ?? 'bg-gray-100 text-gray-600'}`, children: row.original.condition?.replace('_', ' ') })),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row.original.status] ?? 'bg-gray-100 text-gray-600'}`, children: row.original.status })),
        },
        {
            accessorKey: 'purchasePrice',
            header: 'Purchase Price',
            cell: ({ row }) => (_jsxs("span", { children: ["\u20B9", Number(row.original.purchasePrice).toLocaleString()] })),
        },
        {
            accessorKey: 'sellingPrice',
            header: 'Selling Price',
            cell: ({ row }) => (_jsx("span", { children: row.original.sellingPrice ? `₹${Number(row.original.sellingPrice).toLocaleString()}` : '—' })),
        },
        {
            accessorKey: 'isOnline',
            header: 'Online',
            cell: ({ row }) => _jsx(OnlineToggle, { item: row.original }),
        },
        {
            accessorKey: 'branch',
            header: 'Branch',
            cell: ({ row }) => _jsx("span", { className: "text-xs text-surface-500", children: row.original.branch?.name }),
        },
    ];
    const toggleOnline = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.patch(`/inventory/${id}/toggle-online`);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Inventory status updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });
    const OnlineToggle = ({ item }) => {
        return (_jsx("button", { onClick: () => toggleOnline.mutate(item.id), disabled: toggleOnline.isPending, title: item.isOnline ? 'Remove from website' : 'List on website', className: `p-1 rounded transition-colors ${item.isOnline ? 'text-green-600 hover:text-red-500' : 'text-gray-400 hover:text-green-600'}`, children: item.isOnline ? _jsx(Globe, { className: "w-4 h-4" }) : _jsx(EyeOff, { className: "w-4 h-4" }) }));
    };
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Inventory" }), _jsx("p", { className: "text-sm text-surface-500", children: "All inventory items" })] }), _jsxs(Link, { href: "/purchases/new", className: "btn-primary btn-md", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Item"] })] }), _jsx(DataTable, { columns: columns, queryKey: ['inventory'], apiEndpoint: "/inventory", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 })] }));
}
//# sourceMappingURL=page.js.map