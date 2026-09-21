'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';

import { PermissionMatrix } from '@/components/permissions/PermissionMatrix';

const TABS = ['Branches', 'Roles', 'Permissions', 'Content'];

type Branch = {
  id: string;
  name: string;
  code: string;
  city: string | null;
  gstin: string | null;
  isGstRegistered: boolean | null;
  isActive: boolean;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
};

type Banner = {
  id: string;
  title: string;
  link: string | null;
  isActive: boolean;
};

export function SettingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get('tab') || 'Branches';
  const [tab, setTab] = useState(tabFromUrl);

  // Sync tab state from URL params (handles sidebar clicks while on this page)
  useEffect(() => {
    setTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = useCallback(
    (newTab: string) => {
      setTab(newTab);
      router.replace(`/settings?tab=${newTab}`, { scroll: false });
    },
    [router],
  );

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

  const branchesColumns: ColumnDef<Branch, any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="text-sm">{row.original.name}</span>,
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => <span className="text-sm">{row.original.city ?? '—'}</span>,
    },
    {
      accessorKey: 'gstin',
      header: 'GSTIN',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.gstin ?? (
            row.original.isGstRegistered ? (
              <span className="text-red-600 font-medium">Missing</span>
            ) : (
              '—'
            )
          )}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const gstStatus = row.original.isGstRegistered === true && !row.original.gstin
          ? 'GST-registered but missing GSTIN'
          : row.original.isGstRegistered === true
            ? 'GST-registered'
            : 'Not GST-registered';

        return (
          <div className="flex gap-2">
            <span className={`badge ${
              row.original.isActive ? 'badge-success' : 'badge-danger'
            }`}>
              {row.original.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`text-xs ${
              row.original.isGstRegistered && !row.original.gstin
                ? 'text-red-600'
                : 'text-surface-500'
            }`}>
              {gstStatus}
            </span>
          </div>
        );
      },
    },
  ];

  const rolesColumns: ColumnDef<Role, any>[] = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.name}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span className="text-sm text-surface-500">{row.original.description ?? '—'}</span>,
    },
    {
      accessorKey: 'isSystem',
      header: 'System',
      cell: ({ row }) => <span className="text-sm">{row.original.isSystem ? '✓' : '—'}</span>,
    },
  ];

  const bannersColumns: ColumnDef<Banner, any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <span className="text-sm">{row.original.title}</span>,
    },
    {
      accessorKey: 'link',
      header: 'Link',
      cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.link ?? '—'}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }) => <span className="text-sm">{row.original.isActive ? '✓' : '—'}</span>,
    },
  ];

  const renderTable = () => {
    if (tab === 'Branches') {
      return (
        <DataTable<Branch, any>
          columns={branchesColumns}
          queryKey={['branches']}
          apiEndpoint="/admin/branches"
          enableSorting={true}
          enableFilters={true}
          enablePagination={true}
          pageSize={20}
        />
      );
    }
    if (tab === 'Roles') {
      return (
        <DataTable<Role, any>
          columns={rolesColumns}
          queryKey={['roles']}
          apiEndpoint="/admin/roles"
          enableSorting={true}
          enableFilters={true}
          enablePagination={true}
          pageSize={20}
        />
      );
    }
    if (tab === 'Permissions') {
      return <PermissionMatrix />;
    }
    if (tab === 'Content') {
      return (
        <DataTable<Banner, any>
          columns={bannersColumns}
          queryKey={['banners']}
          apiEndpoint="/admin/banners"
          enableSorting={true}
          enableFilters={true}
          enablePagination={true}
          pageSize={20}
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="heading-sm text-surface-900">Settings</h1>

      <div className="flex gap-2 border-b border-surface-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {renderTable()}
    </div>
  );
}
