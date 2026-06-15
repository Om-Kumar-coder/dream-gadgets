'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { RefreshCw, Search, RotateCcw, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

type RefundItem = {
  orderId: string;
  orderNumber: string;
  cancelledAt: string;
  clientName: string;
  clientEmail: string | null;
  branchName: string;
  totalAmount: number;
  payments: {
    paymentId: string;
    amount: number;
    razorpayPaymentId: string | null;
    razorpayRefundId: string | null;
    refundAmount: number | null;
    refundStatus: string | null;
    refundedAt: string | null;
  }[];
};

const REFUND_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function AdminRefundsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [refundFilter, setRefundFilter] = useState<'all' | 'pending' | 'failed' | 'processed'>('all');
  const [selectedPayment, setSelectedPayment] = useState<{
    paymentId: string;
    orderNumber: string;
    amount: number;
    clientName: string;
  } | null>(null);

  const { data: refunds, isLoading, isError } = useQuery({
    queryKey: ['admin-refunds'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/refunds');
      // TransformInterceptor wraps responses as { status: 'success', data: [...] }
      return (data?.data ?? data ?? []) as RefundItem[];
    },
    refetchInterval: 30_000, // Auto-refresh every 30s
  });

  const retryMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { data } = await apiClient.post(`/admin/refunds/${paymentId}/retry`);
      return data;
    },
    onSuccess: () => {
      toast.success('Refund initiated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
      setSelectedPayment(null);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Failed to process refund';
      toast.error(typeof msg === 'string' ? msg : 'Refund failed');
    },
  });

  // Filter logic — safe against null payments & missing fields
  const filteredRefunds = (refunds ?? []).filter((item) => {
    const payments = item.payments ?? [];
    const orderNumber = item.orderNumber ?? '';
    const clientName = item.clientName ?? '';

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        orderNumber.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q) ||
        payments.some((p) => p.razorpayPaymentId?.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Status filter — check across all payments
    if (refundFilter !== 'all') {
      const anyMatch = payments.some((p) => {
        const status = p.refundStatus ?? 'pending';
        if (refundFilter === 'pending') return status === 'pending' || (!p.razorpayRefundId && status === 'pending');
        if (refundFilter === 'failed') return status === 'failed';
        if (refundFilter === 'processed') return status === 'processed';
        return true;
      });
      if (!anyMatch) return false;
    }

    return true;
  });

  return (        <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="heading-sm text-surface-900">Refunds</h1>
        <p className="text-sm text-surface-500 mt-1">
          Monitor and manually trigger refunds for cancelled online orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search order #, customer, payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm input"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'failed', 'processed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRefundFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                refundFilter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && !isError && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-surface-400" />
          <span className="ml-2 text-sm text-surface-400">Loading refunds...</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16">
          <ShieldAlert className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-sm text-surface-500">
            Failed to load refund data. Check server connection or permissions.
          </p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-refunds'] })}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filteredRefunds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RotateCcw className="w-10 h-10 text-green-300 mb-3" />
          <h3 className="text-sm font-medium text-surface-700">All caught up</h3>
          <p className="text-xs text-surface-400 mt-1">
            {searchQuery || refundFilter !== 'all'
              ? 'No refunds match your filters'
              : 'No cancelled orders with completed payments need refund action'}
          </p>
        </div>
      )}

      {/* Refunds list */}
      {!isLoading && !isError && filteredRefunds.length > 0 && (
        <div className="space-y-4">
          {filteredRefunds.map((item) => (
            <div
            key={item.orderId}
            className="card p-5 hover:shadow-card-hover transition-all"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium">{item.orderNumber}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full badge-neutral">
                    Cancelled
                  </span>                      <span className="text-xs text-surface-400">
                        {(() => {
                          try {
                            const d = new Date(item.cancelledAt);
                            return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                          } catch { return '—'; }
                        })()}
                      </span>
                </div>
                <span className="font-semibold text-sm">
                  ₹{Number(item.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Customer & branch */}
              <div className="flex items-center gap-4 text-xs text-surface-500 mb-4">
                <span>{item.clientName}</span>
                {item.clientEmail && (
                  <span className="text-surface-400">{item.clientEmail}</span>
                )}
                <span className="text-surface-400">{item.branchName}</span>
              </div>

              {/* Payments needing refund */}
              <div className="space-y-2">
                {item.payments.map((payment) => {
                  const refundStatus = payment.refundStatus ?? 'pending';
                  const needsRefund = !payment.razorpayRefundId || refundStatus === 'failed' || refundStatus === 'pending';
                  return (
                    <div
                      key={payment.paymentId}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        needsRefund
                          ? 'bg-amber-50 border border-amber-200'
                          : 'bg-surface-50 border border-surface-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-xs font-medium">
                            ₹{Number(payment.amount).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-surface-400 font-mono mt-0.5">
                            {payment.razorpayPaymentId ?? 'No Razorpay ID'}
                          </p>
                        </div>
                        {payment.razorpayRefundId && (
                          <div className="pl-3 border-l border-surface-200">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                REFUND_STATUS_COLORS[refundStatus] ?? 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {refundStatus}
                            </span>
                            <p className="text-[10px] text-surface-400 font-mono mt-0.5">
                              {payment.razorpayRefundId}
                            </p>
                          </div>
                        )}
                      </div>
                      {needsRefund && (
                        <button
                          onClick={() =>
                            setSelectedPayment({
                              paymentId: payment.paymentId,
                              orderNumber: item.orderNumber,
                              amount: payment.amount,
                              clientName: item.clientName,
                            })
                          }
                          disabled={retryMutation.isPending && selectedPayment?.paymentId === payment.paymentId}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {retryMutation.isPending && selectedPayment?.paymentId === payment.paymentId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          Retry Refund
                        </button>
                      )}
                      {!needsRefund && refundStatus === 'processed' && (
                        <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Refunded
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Retry Confirmation Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-surface-900 mb-2">Confirm Refund</h3>
            <p className="text-sm text-surface-500 mb-4">
              This will initiate a full refund via Razorpay for the following payment:
            </p>
            <div className="bg-surface-50 rounded-lg p-3 mb-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Order</span>
                <span className="font-mono font-medium">{selectedPayment.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Customer</span>
                <span>{selectedPayment.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Amount</span>
                <span className="font-semibold">₹{Number(selectedPayment.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                disabled={retryMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => retryMutation.mutate(selectedPayment.paymentId)}
                disabled={retryMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {retryMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {retryMutation.isPending ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
