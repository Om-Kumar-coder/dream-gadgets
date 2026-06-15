'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { User } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@dream-gadgets/ui';

const EKYC_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerType: string;
  ekycStatus: string;
  branch: {
    name: string;
  };
};

export default function ClientsPage() {
  const columns: ColumnDef<Client, any>[] = [
    {
      accessorKey: 'client',
      header: 'Client',
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium">{client.firstName} {client.lastName}</p>
              <p className="text-xs text-surface-400">{client.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.phone}</span>,
    },
    {
      accessorKey: 'customerType',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize text-xs">{row.original.customerType ?? 'walk_in'}</span>
      ),
    },
    {
      accessorKey: 'ekycStatus',
      header: 'EKYC',
      cell: ({ row }) => {
        const status = row.original.ekycStatus;
        if (!status) return <span className="text-xs text-gray-400">—</span>;
        return (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              EKYC_COLORS[status] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) =>        <span className="text-xs text-surface-500">{row.original.branch?.name}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link
          href={`/clients/${row.original.id}`}
          className="text-blue-600 hover:underline text-xs"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Clients</h1>
          <p className="text-sm text-surface-500">All registered clients</p>
        </div>
        <Button variant="default" size="md">
          <span className="text-lg leading-none mr-1">+</span> New Client
        </Button>
      </div>

      <DataTable<Client, any>
        columns={columns}
        queryKey={['clients']}
        apiEndpoint="/clients"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />
    </div>
  );
}
