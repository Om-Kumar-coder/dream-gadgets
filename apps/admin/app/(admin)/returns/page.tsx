'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useRealtimeUpdates } from '@/lib/useRealtimeUpdates';

const STATUS_COLORS: Record<string, string> = {
  processed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

type Return = {
  id: string;
  returnNumber: string;
  returnType: string;
  reason: string;
  refundAmount: number;
  refundStatus: string;
  createdAt: string;
};

export default function ReturnsPage() {
  const [returnType, setReturnType] = useState<'sale' | 'purchase'>('sale');

  // Auto-refresh on return events
  useRealtimeUpdates({
    'return.created': [['returns']],
  });

  const columns: ColumnDef<Return, any>[] = [
    {
      accessorKey: 'returnNumber',
      header: 'Return #',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.returnNumber}</span>,
    },
    {
      accessorKey: 'returnType',
      header: 'Type',
      cell: ({ row }) => <span className="capitalize text-xs">{row.original.returnType}</span>,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <span className="text-sm">{row.original.reason}</span>,
    },
    {
      accessorKey: 'refundAmount',
      header: 'Refund Amount',
      cell: ({ row }) => (
        <span>₹{Number(row.original.refundAmount ?? 0).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'refundStatus',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            STATUS_COLORS[row.original.refundStatus] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.refundStatus}
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
          <h1 className="text-xl font-semibold text-gray-900">Returns</h1>
          <p className="text-sm text-gray-500">Manage product returns</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setReturnType('sale')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            returnType === 'sale' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Sales Returns
        </button>
        <button
          onClick={() => setReturnType('purchase')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            returnType === 'purchase' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Purchase Returns
        </button>
      </div>

      <DataTable<Return, any>
        columns={columns}
        queryKey={['returns', returnType]}
        apiEndpoint="/returns"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />
    </div>
  );
}
