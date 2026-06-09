'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Eye, XCircle, Package } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import { useRealtimeUpdates } from '@/lib/useRealtimeUpdates';

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  payment_confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  return_requested: 'bg-orange-100 text-orange-700',
  returned: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

type OnlineOrder = {
  id: string;
  orderNumber: string;
  clientId: string | null;
  client: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  } | null;
  items: { id: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  orderedAt: string;
  branch: {
    name: string;
  } | null;
};

export default function OnlineOrdersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Auto-refresh on order events
  useRealtimeUpdates({
    'order.created': [['orders']],
    'order.status_changed': [['orders']],
    'payment.confirmed': [['orders']],
  });

  const cancelOrder = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/orders/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    },
  });

  const columns: ColumnDef<OnlineOrder, any>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-mono text-xs font-medium">{row.original.orderNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: 'client',
      header: 'Customer',
      cell: ({ row }) => {
        const client = row.original.client;
        if (!client) return <span className="text-gray-400 text-sm">Guest</span>;
        return (
          <div>
            <p className="text-sm font-medium">
              {client.firstName ?? ''} {client.lastName ?? ''}
            </p>
            {client.email && (
              <p className="text-xs text-gray-400">{client.email}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.items?.length ?? 0}</span>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-medium">₹{Number(row.original.totalAmount).toLocaleString('en-IN')}</span>
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
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            PAYMENT_STATUS_COLORS[row.original.paymentStatus] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.paymentStatus}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => (
        <span className="text-sm capitalize text-gray-600">
          {row.original.paymentMethod ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">{row.original.branch?.name ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'orderedAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">
          {row.original.orderedAt
            ? format(new Date(row.original.orderedAt), 'dd MMM yyyy')
            : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-1">
            <Link
              href={`/orders/${order.id}`}
              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
              title="View details"
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button
                onClick={() => {
                  if (confirm(`Cancel order ${order.orderNumber}?`)) {
                    cancelOrder.mutate(order.id);
                  }
                }}
                disabled={cancelOrder.isPending}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                title="Cancel order"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Online Orders</h1>
          <p className="text-sm text-gray-500">
            Customer orders placed through the website
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          '',
          'pending_payment',
          'payment_confirmed',
          'processing',
          'packed',
          'shipped',
          'out_for_delivery',
          'delivered',
          'return_requested',
          'returned',
          'cancelled',
        ].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status ? status.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      <DataTable<OnlineOrder, any>
        columns={columns}
        queryKey={['orders', statusFilter]}
        apiEndpoint="/orders"
        queryParams={{ status: statusFilter || undefined }}
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
        renderNoResults={() => (
          <div className="py-12 text-center">
            <div className="text-gray-400 text-4xl mb-2">📦</div>
            <p className="text-gray-500">No orders found</p>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="text-blue-600 hover:underline text-sm mt-2"
              >
                Clear status filter
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
