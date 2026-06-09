'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FileText, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';
import { useRealtimeUpdates } from '@/lib/useRealtimeUpdates';

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  voided: 'bg-red-100 text-red-700',
};

type Sale = {
  id: string;
  invoiceNumber: string;
  client: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  } | null;
  items: { id: string; quantity: number }[];
  totalAmount: number;
  paymentStatus: string;
  saleDate: string;
  isVoided: boolean;
  voidedAt?: string;
  voidedById?: string;
  branch: {
    name: string;
  };
};

export default function SalesPage() {
  const qc = useQueryClient();

  // Auto-refresh on sale events
  useRealtimeUpdates({
    'sale.created': [['sales']],
    'sale.voided': [['sales']],
  });

  const columns: ColumnDef<Sale, any>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.invoiceNumber}</span>
      ),
    },
    {
      accessorKey: 'client',
      header: 'Client',
      cell: ({ row }) => {
        const client = row.original.client;
        if (!client) return <span className="text-gray-400">Walk-in</span>;
        return (
          <div>
            <div className="font-medium">
              {client.firstName ?? ''} {client.lastName ?? ''}
            </div>
            {client.email && (
              <div className="text-xs text-gray-400">{client.email}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => <span className="text-sm">{row.original.branch?.name ?? 'N/A'}</span>,
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => <span>{row.original.items?.length ?? 0}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-medium">₹{Number(row.original.totalAmount).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Status',
      cell: ({ row }) => {
        const isVoided = row.original.isVoided;
        const status = isVoided ? 'voided' : row.original.paymentStatus;
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
      accessorKey: 'saleDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-gray-500">
          {row.original.saleDate ? format(new Date(row.original.saleDate), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <SaleActions sale={row.original} />,
    },
  ];

  const voidSale = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/sales/${id}/void`);
      return data;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Sale voided successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to void sale');
    },
  });

  const SaleActions = ({ sale }: { sale: Sale }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-6 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <Link
                href={`/api/v1/sales/${sale.id}/invoice`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-3.5 h-3.5" /> View PDF
              </Link>
              <Link
                href={`/sales/${sale.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </Link>
              {!sale.isVoided && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to void this sale?')) {
                      voidSale.mutate(sale.id);
                    }
                  }}
                  disabled={voidSale.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Void Sale
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500">All completed transactions</p>
        </div>
        <Link
          href="/sales/pos"
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Sale (POS)
        </Link>
      </div>

      <DataTable<Sale, any>
        columns={columns}
        queryKey={['sales']}
        apiEndpoint="/sales"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
        renderNoResults={() => (
          <div className="py-12 text-center">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-500">No sales found</p>
          </div>
        )}
      />
    </div>
  );
}
