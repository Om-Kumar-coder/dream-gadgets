'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

type PurchaseItem = {
  id: string;
  imei: string;
  condition?: string | null;
  status?: string | null;
  totalCost?: number | string | null;
};

type Purchase = {
  id: string;
  invoiceNumber: string;
  vendorName: string | null;
  vendorId: string | null;
  vendorGstin: string | null;
  supplyType: 'intra' | 'inter';
  cgstAmount: number | string;
  sgstAmount: number | string;
  igstAmount: number | string;
  branch: {
    name?: string;
  } | null;
  subtotal?: number | string;
  totalAmount: number | string;
  taxAmount: number | string;
  status: string;
  notes: string | null;
  purchaseDate: string;
  createdAt: string;
  items?: PurchaseItem[];
};

const money = (v: number | string | null | undefined) =>
  `₹${Number(v ?? 0).toLocaleString('en-IN')}`;

export default function PurchaseDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['purchases', params.id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/purchases/${params.id}`);
      return data.data;
    },
  });

  const purchase = data as Purchase;

  // The invoice endpoint is JWT-protected (Bearer token from localStorage), so it
  // must be fetched through apiClient and handled as binary data — a plain
  // <a href> navigation carries no Authorization header and returns 401.
  const downloadInvoice = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.get(`/purchases/${id}/invoice`, { responseType: 'blob' });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-surface-400">Loading...</div>
      </div>
    );
  }

  if (isError || !purchase) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-2">⚠️</div>
        <h3 className="text-lg font-medium text-surface-900">Failed to load purchase</h3>
        <p className="text-surface-500 text-sm mt-1">
          {error instanceof Error ? error.message : 'Please try again'}
        </p>
        <Link href="/purchases" className="mt-4 text-blue-600 hover:underline text-sm">
          Back to Purchases
        </Link>
      </div>
    );
  }

  const gstSplit = purchase.supplyType === 'inter'
    ? [{ label: 'IGST', value: purchase.igstAmount }]
    : [
        { label: 'CGST', value: purchase.cgstAmount },
        { label: 'SGST', value: purchase.sgstAmount },
      ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/purchases"
            className="flex items-center gap-1 text-surface-600 hover:text-surface-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="heading-sm text-surface-900">{purchase.invoiceNumber}</h1>
        </div>
        <button
          type="button"
          onClick={() => downloadInvoice.mutate(purchase.id)}
          disabled={downloadInvoice.isPending}
          className="btn-primary btn-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-surface-900">Purchase Details</h2>
                <p className="text-sm text-surface-500">
                  {purchase.purchaseDate ? format(new Date(purchase.purchaseDate), 'dd MMM yyyy') : '—'}
                </p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  STATUS_COLORS[purchase.status] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {purchase.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-surface-500">Invoice #</p>
                <p className="font-mono text-sm">{purchase.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500">Vendor</p>
                <p className="text-sm">{purchase.vendorName ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500">Branch</p>
                <p className="text-sm">{purchase.branch?.name ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500">GSTIN</p>
                <p className="text-sm font-mono">{purchase.vendorGstin ?? '—'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-surface-900">
                Items ({purchase.items?.length ?? 0})
              </p>
              {(purchase.items?.length ?? 0) === 0 ? (
                <p className="text-sm text-surface-400">No inventory items linked to this purchase.</p>
              ) : (
                purchase.items!.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-surface-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm font-mono">{item.imei}</p>
                      <p className="text-xs text-surface-400">
                        Condition: {item.condition ?? '—'} · Status: {item.status ?? '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{money(item.totalCost)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 space-y-2 border-t border-surface-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Tax</span>
                <span className="font-medium">{money(purchase.taxAmount)}</span>
              </div>
              {gstSplit.map((g) => (
                <div key={g.label} className="flex justify-between text-sm">
                  <span className="text-surface-500">{g.label}</span>
                  <span className="font-medium">{money(g.value)}</span>
                </div>
              ))}
              <div className="flex justify-between text-base pt-2 border-t border-surface-100">
                <span className="font-semibold text-surface-900">Total</span>
                <span className="font-semibold text-surface-900">{money(purchase.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-surface-500">Created</p>
                <p className="text-surface-900">
                  {purchase.createdAt
                    ? format(new Date(purchase.createdAt), 'dd MMM yyyy, h:mm a')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-surface-500">Supply Type</p>
                <p className="text-surface-900 capitalize">{purchase.supplyType}</p>
              </div>
              {purchase.notes && (
                <div>
                  <p className="text-surface-500">Notes</p>
                  <p className="text-surface-900">{purchase.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
