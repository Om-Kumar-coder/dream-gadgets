'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, FileText, Mail, MessageCircle, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from '@dream-gadgets/ui';

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  voided: 'bg-red-100 text-red-700',
};

type Sale = {
  id: string;
  invoiceNumber: string;
  clientId: string | null;
  client: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  } | null;
  branch: {
    name: string;
    address?: string;
  };
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  saleType: string;
  saleDate: string;
  isVoided: boolean;
  voidedAt?: string;
  items: {
    id: string;
    itemId: string;
    imei: string;
    description: string;
    unitPrice: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    hsnCode: string | null;
  }[];
  payments: {
    id: string;
    method: string;
    amount: number;
    reference?: string | null;
    note?: string | null;
    status: string;
  }[];
  createdAt: string;
};

export default function SaleDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['sales', params.id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/sales/${params.id}`);
      return data.data;
    },
  });

  const sale = data as Sale;

  const voidSale = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/sales/${id}/void`);
      return data;
    },
    onSuccess: () => {
      toast.success('Sale voided successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to void sale');
    },
  });

  const emailInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/sales/${id}/invoice/email`);
      return data;
    },
    onSuccess: () => {
      toast.success('Invoice queued for email delivery');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send email');
    },
  });

  const whatsappInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/sales/${id}/invoice/whatsapp`);
      return data;
    },
    onSuccess: () => {
      toast.success('Invoice queued for WhatsApp delivery');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send WhatsApp');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (isError || !sale) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-2">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900">Failed to load sale</h3>
        <p className="text-gray-500 text-sm mt-1">
          {error instanceof Error ? error.message : 'Please try again'}
        </p>
        <Link
          href="/sales"
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Back to Sales
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/sales"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {sale.invoiceNumber}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/v1/sales/${sale.id}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" /> Download PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500">
                  {sale.saleDate ? format(new Date(sale.saleDate), 'dd MMM yyyy, h:mm a') : '—'}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    STATUS_COLORS[sale.paymentStatus] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {sale.paymentStatus}
                </span>
                {sale.isVoided && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-700 ml-2">
                    Voided
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500">Invoice #</p>
                <p className="font-mono text-sm">{sale.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Branch</p>
                <p className="text-sm">{sale.branch?.name ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sale Type</p>
                <p className="text-sm capitalize">{sale.saleType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Client</p>
                <p className="text-sm">
                  {sale.client ? (
                    <span>
                      {sale.client.firstName} {sale.client.lastName}
                      {sale.client.email && (
                        <span className="text-gray-400 ml-1">({sale.client.email})</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400">Walk-in</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {sale.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs text-gray-400">IMEI: {item.imei}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">₹{Number(item.total).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      ₹{Number(item.unitPrice).toLocaleString()} × {item.discount > 0 ? '1' : '1'}
                      {item.discount > 0 && <span className="text-red-500"> -₹{item.discount}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">₹{Number(sale.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-red-500">- ₹{Number(sale.discountAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium">₹{Number(sale.taxAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{Number(sale.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
            <div className="space-y-3">
              {sale.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{payment.method}</span>
                    {payment.reference && (
                      <span className="text-xs text-gray-400">Ref: {payment.reference}</span>
                    )}
                  </div>
                  <span className="font-medium">₹{Number(payment.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => emailInvoice.mutate(sale.id)}
                disabled={sale.isVoided || emailInvoice.isPending}
                className="flex items-center gap-2 w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4" /> Email Invoice
              </button>
              <button
                onClick={() => whatsappInvoice.mutate(sale.id)}
                disabled={sale.isVoided || whatsappInvoice.isPending}
                className="flex items-center gap-2 w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Invoice
              </button>
              {!sale.isVoided && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to void this sale?')) {
                      voidSale.mutate(sale.id);
                    }
                  }}
                  disabled={voidSale.isPending}
                  className="flex items-center gap-2 w-full px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" /> Void Sale
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p className="text-gray-900">
                  {sale.createdAt ? format(new Date(sale.createdAt), 'dd MMM yyyy, h:mm a') : '—'}
                </p>
              </div>
              {sale.isVoided && sale.voidedAt && (
                <div>
                  <p className="text-gray-500">Voided</p>
                  <p className="text-gray-900">
                    {format(new Date(sale.voidedAt), 'dd MMM yyyy, h:mm a')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
