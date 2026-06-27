'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Globe, EyeOff, ChevronDown, Package } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';

const CATEGORY_LABELS: Record<string, string> = {
  charger: 'Charger',
  case: 'Case',
  screen_guard: 'Screen Guard',
  earphones: 'Earphones',
  cable: 'Cable',
  power_bank: 'Power Bank',
  stand: 'Stand',
  cleaning_kit: 'Cleaning Kit',
  tempered_glass: 'Tempered Glass',
  adapter: 'Adapter',
};

const CATEGORY_COLORS: Record<string, string> = {
  charger: 'bg-blue-100 text-blue-700',
  case: 'bg-purple-100 text-purple-700',
  screen_guard: 'bg-emerald-100 text-emerald-700',
  earphones: 'bg-amber-100 text-amber-700',
  cable: 'bg-gray-100 text-gray-700',
  power_bank: 'bg-orange-100 text-orange-700',
  stand: 'bg-teal-100 text-teal-700',
  cleaning_kit: 'bg-pink-100 text-pink-700',
  tempered_glass: 'bg-cyan-100 text-cyan-700',
  adapter: 'bg-indigo-100 text-indigo-700',
};

type AccessoryItem = {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number | null;
  stockQuantity: number;
  reorderLevel: number;
  status: string;
  isOnline: boolean;
  brand: { name: string } | null;
  branch: { name: string } | null;
};

export default function AccessoriesPage() {
  const qc = useQueryClient();

  const toggleOnline = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/accessories/${id}/toggle-online`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Accessory status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const columns: ColumnDef<AccessoryItem, any>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          {row.original.brand && (
            <p className="text-xs text-surface-400">{row.original.brand.name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            CATEGORY_COLORS[row.original.category] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {CATEGORY_LABELS[row.original.category] ?? row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'stockQuantity',
      header: 'Stock',
      cell: ({ row }) => {
        const qty = row.original.stockQuantity;
        const reorder = row.original.reorderLevel;
        const isLow = qty < reorder;
        return (
          <span
            className={`text-sm font-medium ${
              isLow ? 'text-red-600' : qty === 0 ? 'text-gray-400' : 'text-surface-700'
            }`}
          >
            {qty}
            {isLow && <span className="ml-1 text-[10px] text-red-500">(Low)</span>}
          </span>
        );
      },
    },
    {
      accessorKey: 'purchasePrice',
      header: 'Cost',
      cell: ({ row }) => (
        <span className="text-sm">₹{Number(row.original.purchasePrice).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Price',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.sellingPrice
            ? `₹${Number(row.original.sellingPrice).toLocaleString()}`
            : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'isOnline',
      header: 'Online',
      cell: ({ row }) => (
        <button
          onClick={() => toggleOnline.mutate(row.original.id)}
          disabled={toggleOnline.isPending}
          title={row.original.isOnline ? 'Remove from website' : 'List on website'}
          className={`p-1 rounded transition-colors ${
            row.original.isOnline
              ? 'text-green-600 hover:text-red-500'
              : 'text-gray-400 hover:text-green-600'
          }`}
        >
          {row.original.isOnline ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            row.original.status === 'available'
              ? 'bg-green-100 text-green-700'
              : row.original.status === 'out_of_stock'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.status.replace('_', ' ')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Accessories</h1>
          <p className="text-sm text-surface-500">
            Manage non-IMEI inventory — cases, chargers, cables, and more
          </p>
        </div>
        <Link href="/accessories/new" className="btn-primary btn-md">
          <Plus className="w-4 h-4" />
          Add Accessory
        </Link>
      </div>

      <DataTable<AccessoryItem, any>
        columns={columns}
        queryKey={['accessories']}
        apiEndpoint="/accessories"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />
    </div>
  );
}
