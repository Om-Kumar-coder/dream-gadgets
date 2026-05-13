'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';

const TABS = ['Branches', 'Roles', 'Content'];

type Branch = {
  id: string;
  name: string;
  code: string;
  city: string | null;
  gstin: string | null;
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

export default function SettingsPage() {
  const [tab, setTab] = useState('Branches');

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
    queryFn: () => apiClient.get('/admin/content/banners').then(r => r.data),
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
      cell: ({ row }) => <span className="text-sm">{row.original.gstin ?? '—'}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.isActive ? 'active' : 'inactive';
        return (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {status}
          </span>
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
      cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.description ?? '—'}</span>,
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
    if (tab === 'Content') {
      return (
        <DataTable<Banner, any>
          columns={bannersColumns}
          queryKey={['banners']}
          apiEndpoint="/admin/content/banners"
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
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Settings</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
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
