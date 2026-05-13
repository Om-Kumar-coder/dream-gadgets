'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import { Button } from '@dream-gadgets/ui';

const CONDITION_COLORS: Record<string, string> = {
  sealed_pack: 'bg-blue-100 text-blue-700',
  open_box: 'bg-purple-100 text-purple-700',
  super_mint: 'bg-emerald-100 text-emerald-700',
  mint: 'bg-teal-100 text-teal-700',
  good: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  assessed: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
};

type Exchange = {
  id: string;
  brand: string;
  model: string;
  imei: string | null;
  colour: string | null;
  storage: string | null;
  condition: string;
  batteryHealth: number | null;
  exchangePrice: number;
  status: string;
  createdAt: string;
};

export default function ExchangePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const columns: ColumnDef<Exchange, any>[] = [
    {
      accessorKey: 'device',
      header: 'Device',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.brand} {row.original.model}</p>
          <p className="text-xs text-gray-400">
            {row.original.storage ?? '—'} · {row.original.colour ?? '—'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'imei',
      header: 'IMEI',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.imei ?? '—'}</span>,
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            CONDITION_COLORS[row.original.condition] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.condition?.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'batteryHealth',
      header: 'Battery',
      cell: ({ row }) => (
        <span className="text-xs">{row.original.batteryHealth ? `${row.original.batteryHealth}%` : '—'}</span>
      ),
    },
    {
      accessorKey: 'exchangePrice',
      header: 'Exchange Price',
      cell: ({ row }) => (
        <span className="font-medium">₹{Number(row.original.exchangePrice).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            STATUS_COLORS[row.original.status] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">
          {row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Exchange Devices</h1>
          <p className="text-sm text-gray-500">Manage exchange devices</p>
        </div>
        <Button variant="default" size="md">
          <Plus className="w-4 h-4" />
          New Exchange
        </Button>
      </div>

      <DataTable<Exchange, any>
        columns={columns}
        queryKey={['exchanges', search]}
        apiEndpoint="/exchange"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
        renderNoResults={() => (
          <div className="py-12 text-center">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-500">No exchange records found</p>
            <button
              onClick={() => setSearch('')}
              className="text-blue-600 hover:underline text-sm mt-2"
            >
              Clear search
            </button>
          </div>
        )}
      />
    </div>
  );
}
