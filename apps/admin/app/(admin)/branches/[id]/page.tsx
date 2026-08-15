'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Clock, Building2, Loader2, Store } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';

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

interface BranchItem {
  id: string;
  imei: string;
  brand: { name: string } | string;
  model: { name: string } | string;
  storage: string;
  colour: string;
  condition: string;
  status: string;
  purchasePrice: number;
  sellingPrice: number | null;
  isOnline: boolean;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  whatsapp?: string;
  workingHours?: string;
}

export default function BranchDetailPage() {
  const params = useParams<{ id: string }>();
  const branchId = params.id;

  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ['admin-branch', branchId],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/branches');
      const branches = (data?.data ?? []) as Branch[];
      return branches.find((b: Branch) => b.id === branchId) ?? null;
    },
    enabled: !!branchId,
  });

  const columns: ColumnDef<BranchItem, any>[] = [
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
            {(row.original.brand as any)?.name ?? row.original.brand}{' '}
            {(row.original.model as any)?.name ?? row.original.model}
          </p>
          <p className="text-xs text-surface-400">
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
      cell: ({ row }) => <span>₹{Number(row.original.purchasePrice).toLocaleString()}</span>,
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
      cell: ({ row }) => (
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            row.original.isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-100 text-surface-400'
          }`}
        >
          {row.original.isOnline ? 'Live' : 'Offline'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <Link
        href="/branches"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Stores
      </Link>

      {branchLoading ? (
        <div className="card p-10 flex flex-col items-center gap-3 text-surface-400">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm">Loading store...</span>
        </div>
      ) : branch ? (
        <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="heading-sm text-surface-900">{branch.name}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                  {branch.code}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-surface-500 mt-1.5">
                {branch.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-surface-300" />
                    {branch.address}
                    {branch.city ? `, ${branch.city}` : ''}
                    {branch.pincode ? ` — ${branch.pincode}` : ''}
                  </span>
                )}
                {branch.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-surface-300" />
                    +91 {branch.phone}
                  </span>
                )}
                {branch.workingHours && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-surface-300" />
                    {branch.workingHours}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-3">
            <Store className="w-6 h-6 text-surface-400" />
          </div>
          <p className="text-surface-500 font-medium">Store not found</p>
        </div>
      )}

      <DataTable<BranchItem, any>
        columns={columns}
        queryKey={['inventory', 'branch', branchId]}
        apiEndpoint="/inventory"
        queryParams={{ branchId }}
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />
    </div>
  );
}
