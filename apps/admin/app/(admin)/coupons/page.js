'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { toast } from 'react-hot-toast';
const TYPE_LABELS = {
    percentage: 'Percentage',
    fixed_amount: 'Fixed Amount',
    free_shipping: 'Free Shipping',
    bogo: 'BOGO',
};
const TYPE_COLORS = {
    percentage: 'bg-blue-100 text-blue-700',
    fixed_amount: 'bg-emerald-100 text-emerald-700',
    free_shipping: 'bg-purple-100 text-purple-700',
    bogo: 'bg-amber-100 text-amber-700',
};
function formatDate(dateStr) {
    if (!dateStr)
        return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}
export default function CouponsPage() {
    const qc = useQueryClient();
    const toggleMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.patch(`/admin/coupons/${id}/toggle`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['coupons'] });
            toast.success('Coupon status updated');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update');
        },
    });
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.delete(`/admin/coupons/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['coupons'] });
            toast.success('Coupon deleted');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete');
        },
    });
    const columns = [
        {
            accessorKey: 'code',
            header: 'Code',
            cell: ({ row }) => (_jsx("span", { className: "font-mono text-sm font-bold text-surface-900", children: row.original.code })),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[row.original.type] ?? 'bg-gray-100 text-gray-600'}`, children: TYPE_LABELS[row.original.type] ?? row.original.type })),
        },
        {
            id: 'value',
            header: 'Value',
            cell: ({ row }) => {
                const c = row.original;
                if (c.type === 'percentage')
                    return _jsxs("span", { className: "text-sm font-medium", children: [Number(c.value), "%"] });
                if (c.type === 'fixed_amount')
                    return _jsxs("span", { className: "text-sm font-medium", children: ["\u20B9", Number(c.value).toLocaleString('en-IN')] });
                if (c.type === 'free_shipping')
                    return _jsx("span", { className: "text-sm text-surface-400", children: "Free Shipping" });
                if (c.type === 'bogo')
                    return _jsx("span", { className: "text-sm text-surface-400", children: "BOGO" });
                return _jsx("span", { className: "text-sm", children: Number(c.value) });
            },
        },
        {
            id: 'usage',
            header: 'Usage',
            cell: ({ row }) => {
                const c = row.original;
                const limit = c.usageLimit > 0 ? c.usageLimit : '∞';
                return (_jsxs("span", { className: "text-sm text-surface-600", children: [c.usedCount, " / ", limit] }));
            },
        },
        {
            id: 'dates',
            header: 'Validity',
            cell: ({ row }) => {
                const c = row.original;
                if (!c.startsAt && !c.expiresAt)
                    return _jsx("span", { className: "text-xs text-surface-400", children: "Always" });
                return (_jsxs("div", { className: "text-xs text-surface-500", children: [c.startsAt && _jsxs("span", { children: ["From ", formatDate(c.startsAt)] }), c.expiresAt && _jsxs("span", { children: [c.startsAt ? ' → ' : '', "Till ", formatDate(c.expiresAt)] })] }));
            },
        },
        {
            accessorKey: 'isActive',
            header: 'Active',
            cell: ({ row }) => (_jsx("button", { onClick: () => toggleMutation.mutate(row.original.id), disabled: toggleMutation.isPending, className: `p-1 rounded transition-colors ${row.original.isActive ? 'text-green-600 hover:text-amber-500' : 'text-gray-400 hover:text-green-600'}`, children: row.original.isActive ? _jsx(ToggleRight, { className: "w-4 h-4" }) : _jsx(ToggleLeft, { className: "w-4 h-4" }) })),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (_jsx("button", { onClick: () => {
                    if (window.confirm(`Delete coupon "${row.original.code}"?`)) {
                        deleteMutation.mutate(row.original.id);
                    }
                }, className: "p-1 rounded text-surface-400 hover:text-red-500 transition-colors", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })),
        },
    ];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Coupons" }), _jsx("p", { className: "text-sm text-surface-500", children: "Create and manage promo codes for discounts" })] }), _jsxs(Link, { href: "/coupons/new", className: "btn-primary btn-md", children: [_jsx(Plus, { className: "w-4 h-4" }), "Create Coupon"] })] }), _jsx(DataTable, { columns: columns, queryKey: ['coupons'], apiEndpoint: "/admin/coupons", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 })] }));
}
//# sourceMappingURL=page.js.map