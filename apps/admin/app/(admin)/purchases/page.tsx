'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';
import { PermissionGate } from '@/components/auth/PermissionGate';

type Purchase = {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  branch?: {
    name?: string;
  } | string | null;
  items?: { id: string }[];
  totalAmount: number;
  purchaseDate: string;
};

export default function PurchasesPage() {
  // The purchase invoice endpoint is JWT-protected (Bearer token from
  // localStorage), so it must be fetched through apiClient and handled as
  // binary data — a plain <a href> navigation carries no Authorization header
  // and returns 401. Mirrors the sales list Download PDF action.
  const downloadInvoice = useMutation({
    mutationFn: async (purchase: Purchase) => {
      const res = await apiClient.get(`/purchases/${purchase.id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = `${purchase.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: async (error: any) => {
      // With responseType 'blob' an error body arrives as a Blob — read it back.
      let message = 'Failed to download invoice';
      const data = error?.response?.data;
      if (data instanceof Blob) {
        try {
          const parsed = JSON.parse(await data.text());
          message = parsed?.error?.message || parsed?.message || message;
        } catch {
          // keep default message
        }
      } else {
        message = data?.error?.message || data?.message || message;
      }
      toast.error(message);
    },
  });

  const columns: ColumnDef<Purchase, any>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }) => (
        <Link
          href={`/purchases/${row.original.id}`}
          className="font-mono text-xs text-blue-600 hover:underline"
        >
          {row.original.invoiceNumber}
        </Link>
      ),
    },
    {
      accessorKey: 'vendorName',
      header: 'Vendor',
      cell: ({ row }) => <span className="text-sm">{row.original.vendorName}</span>,
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => {
        const b = row.original.branch;
        const name = typeof b === 'string' ? b : b?.name;
        return <span className="text-sm">{String(name ?? '—')}</span>;
      },
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => <span>{Array.isArray(row.original.items) ? row.original.items.length : 0}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-medium">₹{Number(row.original.totalAmount).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'purchaseDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-surface-500 text-xs">
          {row.original.purchaseDate ? format(new Date(row.original.purchaseDate), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => downloadInvoice.mutate(row.original)}
          disabled={downloadInvoice.isPending}
          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-3 h-3" /> PDF
        </button>
      ),
    },
  ];

  return (
    <PermissionGate permission="purchases.view"><div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Purchases</h1>
          <p className="text-sm text-surface-500">All device acquisitions</p>
        </div>
        <PermissionGate permission="purchases.create" fallback={null}>
          <Link href="/purchases/new" className="btn-primary btn-md">
            <Plus className="w-4 h-4" />
            New Purchase
          </Link>
        </PermissionGate>
      </div>

      <DataTable<Purchase, any>
        columns={columns}
        queryKey={['purchases']}
        apiEndpoint="/purchases"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
      />
    </div></PermissionGate>
  );
}
