'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

const CANCELLABLE_STATUSES = ['pending_payment', 'payment_confirmed'];

export function CancelOrderButton({
  orderId,
  status,
  amount,
}: {
  orderId: string;
  status: string;
  amount: number;
}) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const cancellable = CANCELLABLE_STATUSES.includes(status);
  const isPaid = status === 'payment_confirmed';

  const handleCancel = async () => {
    setCancelling(true);
    setError('');
    try {
      await apiClient.post(`/public/orders/${orderId}/cancel`);
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to cancel order';
      setError(typeof msg === 'string' ? msg : 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!cancellable) return null;

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Order Cancelled</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              {isPaid
                ? 'Your refund has been initiated. It may take 2–5 business days to reflect in your account.'
                : 'Your order has been cancelled.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (confirming && isPaid) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Cancel & Refund Order?</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Your refund of <strong>₹{Number(amount).toLocaleString('en-IN')}</strong> will be initiated
              automatically via Razorpay. Refunds typically take <strong>2–5 business days</strong>
              to reflect in your account depending on your bank.
            </p>
            <p className="text-xs text-amber-600 mt-1">This action cannot be undone.</p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all active:scale-[0.97]"
              >
                {cancelling ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Yes, Cancel & Refund'
                )}
              </button>
              <button
                onClick={() => { setConfirming(false); setError(''); }}
                className="px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 rounded-lg transition-all"
              >
                Keep Order
              </button>
            </div>
            {error && <p className="text-[10px] text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (confirming && !isPaid) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all active:scale-[0.97]"
        >
          {cancelling ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cancelling...
            </span>
          ) : (
            'Yes, Cancel Order'
          )}
        </button>
        <button
          onClick={() => { setConfirming(false); setError(''); }}
          className="px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 rounded-lg hover:bg-surface-50 transition-all"
        >
          No
        </button>
        {error && <p className="text-[10px] text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setConfirming(true)}
        className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all active:scale-[0.97] ${
          isPaid
            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancel Order
      </button>
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
