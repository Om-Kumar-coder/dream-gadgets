'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, ToggleLeft, ToggleRight, Trash2, Calendar, Tag } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';

type CouponItem = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  description: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  percentage: 'Percentage',
  fixed_amount: 'Fixed Amount',
  free_shipping: 'Free Shipping',
  bogo: 'BOGO',
};

const TYPE_COLORS: Record<string, string> = {
  percentage: 'bg-blue-100 text-blue-700',
  fixed_amount: 'bg-emerald-100 text-emerald-700',
  free_shipping: 'bg-purple-100 text-purple-700',
  bogo: 'bg-amber-100 text-amber-700',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function CouponsPage() {
  const qc = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/admin/coupons/${id}/toggle`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon status updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/coupons/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete');
    },
  });

  const columns: ColumnDef<CouponItem, any>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-bold text-surface-900">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[row.original.type] ?? 'bg-gray-100 text-gray-600'}`}>
          {TYPE_LABELS[row.original.type] ?? row.original.type}
        </span>
      ),
    },
    {
      id: 'value',
      header: 'Value',
      cell: ({ row }) => {
        const c = row.original;
        if (c.type === 'percentage') return <span className="text-sm font-medium">{Number(c.value)}%</span>;
        if (c.type === 'fixed_amount') return <span className="text-sm font-medium">₹{Number(c.value).toLocaleString('en-IN')}</span>;
        if (c.type === 'free_shipping') return <span className="text-sm text-surface-400">Free Shipping</span>;
        if (c.type === 'bogo') return <span className="text-sm text-surface-400">BOGO</span>;
        return <span className="text-sm">{Number(c.value)}</span>;
      },
    },
    {
      id: 'usage',
      header: 'Usage',
      cell: ({ row }) => {
        const c = row.original;
        const limit = c.usageLimit > 0 ? c.usageLimit : '∞';
        return (
          <span className="text-sm text-surface-600">
            {c.usedCount} / {limit}
          </span>
        );
      },
    },
    {
      id: 'dates',
      header: 'Validity',
      cell: ({ row }) => {
        const c = row.original;
        if (!c.startsAt && !c.expiresAt) return <span className="text-xs text-surface-400">Always</span>;
        return (
          <div className="text-xs text-surface-500">
            {c.startsAt && <span>From {formatDate(c.startsAt)}</span>}
            {c.expiresAt && <span>{c.startsAt ? ' → ' : ''}Till {formatDate(c.expiresAt)}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }) => (
        <button
          onClick={() => toggleMutation.mutate(row.original.id)}
          disabled={toggleMutation.isPending}
          className={`p-1 rounded transition-colors ${
            row.original.isActive ? 'text-green-600 hover:text-amber-500' : 'text-gray-400 hover:text-green-600'
          }`}
        >
          {row.original.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
        </button>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => {
            if (window.confirm(`Delete coupon "${row.original.code}"?`)) {
              deleteMutation.mutate(row.original.id);
            }
          }}
          className="p-1 rounded text-surface-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Coupons</h1>
          <p className="text-sm text-surface-500">
            Create and manage promo codes for discounts
          </p>
        </div>
        <Link href="/coupons/new" className="btn-primary btn-md">
          <Plus className="w-4 h-4" />
          Create Coupon
        </Link>
      </div>

      <DataTable<CouponItem, any>
        columns={columns}
        queryKey={['coupons']}
        apiEndpoint="/admin/coupons"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />
    </div>
  );
}
