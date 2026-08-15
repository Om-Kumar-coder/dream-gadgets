'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

const STATUS_STEPS = [
  OnlineOrderStatus.PENDING_PAYMENT,
  OnlineOrderStatus.PAYMENT_CONFIRMED,
  OnlineOrderStatus.PROCESSING,
  OnlineOrderStatus.PACKED,
  OnlineOrderStatus.SHIPPED,
  OnlineOrderStatus.OUT_FOR_DELIVERY,
  OnlineOrderStatus.DELIVERED,
];

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Payment Pending',
  payment_confirmed: 'Payment Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatPrice(n: number): string {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function formatDate(d: string | Date | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: any;
  trackingNumber: string | null;
  courier: string | null;
  orderedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  payments: Array<{ method: string; amount: number; status: string }>;
}

function StatusTimeline({ status }: { status: string }) {
  if (status === OnlineOrderStatus.CANCELLED) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold">
        This order was cancelled.
      </div>
    );
  }
  const currentStep = STATUS_STEPS.indexOf(status as OnlineOrderStatus);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.slice(0, -1).map((step, i) => {
          const isActive = i <= currentStep - 1;
          const isCurrent = i === currentStep - 1;
          return (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : isCurrent
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-surface-200 text-surface-300 bg-white'
                }`}
              >
                {isActive ? '✓' : i + 2}
              </div>
              <span className={`text-[10px] mt-1.5 text-center capitalize leading-tight max-w-[64px] ${isActive ? 'text-surface-900 font-medium' : 'text-surface-400'}`}>
                {step.replace(/_/g, ' ')}
              </span>
              {i < STATUS_STEPS.length - 2 && (
                <div className={`absolute top-3.5 left-[calc(50%+14px)] w-[calc(100%-28px)] h-px ${isActive ? 'bg-primary' : 'bg-surface-100'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);

  const lookup = async (value: string) => {
    const raw = value.trim();
    if (!raw) return;
    // Accept a bare ID or a pasted /orders/:id URL
    const id = raw.includes('/') ? raw.split('/').filter(Boolean).pop()! : raw;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(`${API}/public/orders/${encodeURIComponent(id)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.message || json?.data?.message || 'Order not found. Please check the order number.');
        return;
      }
      const data = json?.data?.data ?? json?.data ?? json;
      if (!data?.id) {
        setError('Order not found. Please check the order number.');
        return;
      }
      setOrder(data);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="animate-fade-in">
      <section className="text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-3">Track Your Order</h1>
          <p className="text-white/70 mb-8">
            Enter your order ID (from your order confirmation email or receipt) to see live status.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              lookup(query);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. a1b2c3d4-…-order-id"
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-primary/60 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/30 disabled:opacity-60"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              Track Order
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        {error && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {order && (
          <div className="card p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold">Order</p>
                <p className="text-lg font-extrabold text-surface-900">{order.orderNumber}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                order.status === 'cancelled'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : order.status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-primary/10 text-primary border border-primary/10'
              }`}>
                {STATUS_LABEL[order.status] ?? order.status.replace(/_/g, ' ')}
              </span>
            </div>

            <StatusTimeline status={order.status} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-surface-400 mb-0.5">Ordered On</p>
                <p className="font-semibold text-surface-900">{formatDate(order.orderedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 mb-0.5">Total</p>
                <p className="font-semibold text-surface-900">{formatPrice(order.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 mb-0.5">Courier</p>
                <p className="font-semibold text-surface-900 capitalize">{order.courier || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 mb-0.5">Tracking No.</p>
                <p className="font-semibold text-surface-900">{order.trackingNumber || '—'}</p>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="mt-5 p-4 rounded-xl bg-surface-50 border border-surface-100">
                <p className="text-xs text-surface-400 mb-1">Shipping Address</p>
                <p className="text-sm text-surface-700">
                  {[
                    order.shippingAddress.name,
                    order.shippingAddress.phone,
                    order.shippingAddress.address,
                    order.shippingAddress.city,
                    order.shippingAddress.state,
                    order.shippingAddress.pincode,
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all"
              >
                My Orders
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-surface-700 rounded-xl text-sm font-bold border border-surface-200 hover:bg-surface-50 transition-all"
              >
                Need Help? Contact Us
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
