'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
const TABS = ['Branches', 'Roles', 'Content'];
export function SettingsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabFromUrl = searchParams.get('tab') || 'Branches';
    const [tab, setTab] = useState(tabFromUrl);
    // Sync tab state from URL params (handles sidebar clicks while on this page)
    useEffect(() => {
        setTab(tabFromUrl);
    }, [tabFromUrl]);
    const handleTabChange = useCallback((newTab) => {
        setTab(newTab);
        router.replace(`/settings?tab=${newTab}`, { scroll: false });
    }, [router]);
    const { data: branchesData, isLoading: branchesLoading } = useQuery({
        queryKey: ['branches'],
        queryFn: () => apiClient.get('/admin/branches').then(r => r.data),
        enabled: tab === 'Branches',
    });
    const { data: rolesData, isLoading: rolesLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: () => apiClient.get('/admin/roles').then(r => r.data),
        enabled: tab === 'Roles',
    });
    const { data: bannersData, isLoading: bannersLoading } = useQuery({
        queryKey: ['banners'],
        queryFn: () => apiClient.get('/admin/banners').then(r => r.data),
        enabled: tab === 'Content',
    });
    const branchesColumns = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.name }),
        },
        {
            accessorKey: 'code',
            header: 'Code',
            cell: ({ row }) => _jsx("span", { className: "font-mono text-xs", children: row.original.code }),
        },
        {
            accessorKey: 'city',
            header: 'City',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.city ?? '—' }),
        },
        {
            accessorKey: 'gstin',
            header: 'GSTIN',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.gstin ?? '—' }),
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.isActive ? 'active' : 'inactive';
                return (_jsx("span", { className: `badge ${status === 'active' ? 'badge-success' : 'badge-danger'}`, children: status }));
            },
        },
    ];
    const rolesColumns = [
        {
            accessorKey: 'name',
            header: 'Role Name',
            cell: ({ row }) => _jsx("span", { className: "font-medium text-sm", children: row.original.name }),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => _jsx("span", { className: "text-sm text-surface-500", children: row.original.description ?? '—' }),
        },
        {
            accessorKey: 'isSystem',
            header: 'System',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.isSystem ? '✓' : '—' }),
        },
    ];
    const bannersColumns = [
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.title }),
        },
        {
            accessorKey: 'link',
            header: 'Link',
            cell: ({ row }) => _jsx("span", { className: "text-sm text-gray-500", children: row.original.link ?? '—' }),
        },
        {
            accessorKey: 'isActive',
            header: 'Active',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.isActive ? '✓' : '—' }),
        },
    ];
    const renderTable = () => {
        if (tab === 'Branches') {
            return (_jsx(DataTable, { columns: branchesColumns, queryKey: ['branches'], apiEndpoint: "/admin/branches", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 }));
        }
        if (tab === 'Roles') {
            return (_jsx(DataTable, { columns: rolesColumns, queryKey: ['roles'], apiEndpoint: "/admin/roles", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 }));
        }
        if (tab === 'Content') {
            return (_jsx(DataTable, { columns: bannersColumns, queryKey: ['banners'], apiEndpoint: "/admin/banners", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 }));
        }
        return null;
    };
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Settings" }), _jsx("div", { className: "flex gap-2 border-b border-surface-200", children: TABS.map((t) => (_jsx("button", { onClick: () => handleTabChange(t), className: `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-surface-500 hover:text-surface-700'}`, children: t }, t))) }), renderTable()] }));
}
//# sourceMappingURL=settings-content.js.map