'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  role: {
    name: string;
  };
  isActive: boolean;
};

export default function UsersPage() {
  const qc = useQueryClient();

  const columns: ColumnDef<User, any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.firstName} {row.original.lastName}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => <span className="text-sm">{row.original.phone}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-sm">{row.original.email ?? '—'}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <span className="text-sm">{row.original.role?.name ?? '—'}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.isActive ? 'active' : 'inactive';
        return (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (row.original.isActive) {
          return (
            <button
              onClick={() => deactivateMutation.mutate(row.original.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Deactivate
            </button>
          );
        }
        return null;
      },
    },
  ];

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/users/${id}`, { isActive: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deactivated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    },
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Users & Employees</h1>
          <p className="text-sm text-surface-500">Manage admin users</p>
        </div>
        <Button variant="default" size="md">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <DataTable<User, any>
        columns={columns}
        queryKey={['admin-users']}
        apiEndpoint="/admin/users"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />
    </div>
  );
}
