'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { Button } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';
const STATUS_COLORS = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
};
export default function UsersPage() {
    const qc = useQueryClient();
    const columns = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (_jsxs("span", { className: "text-sm", children: [row.original.firstName, " ", row.original.lastName] })),
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.phone }),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.email ?? '—' }),
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.role?.name ?? '—' }),
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.isActive ? 'active' : 'inactive';
                return (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`, children: status }));
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                if (row.original.isActive) {
                    return (_jsx("button", { onClick: () => deactivateMutation.mutate(row.original.id), className: "text-xs text-red-600 hover:underline", children: "Deactivate" }));
                }
                return null;
            },
        },
    ];
    const deactivateMutation = useMutation({
        mutationFn: (id) => apiClient.patch(`/admin/users/${id}`, { isActive: false }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User deactivated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to deactivate user');
        },
    });
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Users & Employees" }), _jsx("p", { className: "text-sm text-surface-500", children: "Manage admin users" })] }), _jsxs(Button, { variant: "default", size: "md", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add User"] })] }), _jsx(DataTable, { columns: columns, queryKey: ['admin-users'], apiEndpoint: "/admin/users", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 })] }));
}
//# sourceMappingURL=page.js.map