'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';

type Purchase = {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  branch: {
    name: string;
  };
  items: { id: string }[];
  totalAmount: number;
  purchaseDate: string;
};

export default function PurchasesPage() {
  const columns: ColumnDef<Purchase, any>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoiceNumber}</span>,
    },
    {
      accessorKey: 'vendorName',
      header: 'Vendor',
      cell: ({ row }) => <span className="text-sm">{row.original.vendorName}</span>,
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => <span className="text-sm">{row.original.branch?.name}</span>,
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
      accessorKey: 'purchaseDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">
          {row.original.purchaseDate ? format(new Date(row.original.purchaseDate), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <a
          href={`/api/v1/purchases/${row.original.id}/invoice`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
        >
          <FileText className="w-3 h-3" /> PDF
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Purchases</h1>
          <p className="text-sm text-gray-500">All device acquisitions</p>
        </div>
        <Button variant="default" size="md" asChild>
          <Link href="/purchases/new">
            <Plus className="w-4 h-4" />
            New Purchase
          </Link>
        </Button>
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
    </div>
  );
}
