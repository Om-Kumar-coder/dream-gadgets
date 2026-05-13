'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Globe, EyeOff } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';

const CONDITIONS = ['sealed_pack', 'open_box', 'super_mint', 'mint', 'good'];
const STATUSES = ['available', 'sold', 'transferred', 'returned', 'booked', 'in_cart', 'scrapped'];

const CONDITION_COLORS: Record<string, string> = {
  sealed_pack: 'bg-blue-100 text-blue-700',
  open_box: 'bg-purple-100 text-purple-700',
  super_mint: 'bg-emerald-100 text-emerald-700',
  mint: 'bg-teal-100 text-teal-700',
  good: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  sold: 'bg-gray-100 text-gray-500',
  transferred: 'bg-blue-100 text-blue-700',
  returned: 'bg-yellow-100 text-yellow-700',
  booked: 'bg-orange-100 text-orange-700',
  in_cart: 'bg-pink-100 text-pink-700',
  scrapped: 'bg-red-100 text-red-700',
};

type InventoryItem = {
  id: string;
  imei: string;
  brand: {
    name: string;
  };
  model: {
    name: string;
  };
  storage: string;
  colour: string;
  condition: string;
  status: string;
  purchasePrice: number;
  sellingPrice: number | null;
  isOnline: boolean;
  branch: {
    name: string;
  };
};

export default function InventoryPage() {
  const qc = useQueryClient();

  const columns: ColumnDef<InventoryItem, any>[] = [
    {
      accessorKey: 'imei',
      header: 'IMEI',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.imei}</span>,
    },
    {
      accessorKey: 'device',
      header: 'Device',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.brand?.name ?? row.original.brand} {row.original.model?.name ?? row.original.model}
          </p>
          <p className="text-xs text-gray-400">
            {row.original.storage} · {row.original.colour}
          </p>
        </div>
      ),
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
      accessorKey: 'purchasePrice',
      header: 'Purchase Price',
      cell: ({ row }) => (
        <span>₹{Number(row.original.purchasePrice).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Selling Price',
      cell: ({ row }) => (
        <span>
          {row.original.sellingPrice ? `₹${Number(row.original.sellingPrice).toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'isOnline',
      header: 'Online',
      cell: ({ row }) => <OnlineToggle item={row.original} />,
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.branch?.name}</span>,
    },
  ];

  const toggleOnline = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/inventory/${id}/toggle-online`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const OnlineToggle = ({ item }: { item: InventoryItem }) => {
    return (
      <button
        onClick={() => toggleOnline.mutate(item.id)}
        disabled={toggleOnline.isPending}
        title={item.isOnline ? 'Remove from website' : 'List on website'}
        className={`p-1 rounded transition-colors ${
          item.isOnline ? 'text-green-600 hover:text-red-500' : 'text-gray-400 hover:text-green-600'
        }`}
      >
        {item.isOnline ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">All inventory items</p>
        </div>
        <Button variant="default" size="md" asChild>
          <Link href="/purchases/new">
            <Plus className="w-4 h-4" />
            Add Item
          </Link>
        </Button>
      </div>

      <DataTable<InventoryItem, any>
        columns={columns}
        queryKey={['inventory']}
        apiEndpoint="/inventory"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />
    </div>
  );
}
