'use client';
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';
import { CancelOrderButton } from '../../components/order/CancelOrderButton';

type OrderStatus = string;
type StatusTab = 'all' | 'active' | 'completed' | 'cancelled';

const ACTIVE_STATUSES = ['pending_payment', 'payment_confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'];
const COMPLETED_STATUSES = ['delivered', 'return_requested', 'returned'];
const CANCELLED_STATUSES = ['cancelled'];

const CANCELLABLE_STATUSES = ['pending_payment', 'payment_confirmed'];

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  stats: {
    totalOrders: number;
    totalSpent: number;
    deliveredCount: number;
    pendingCount: number;
  };
}

interface OrderItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: { name: string; phone: string; street: string; city: string; state: string; pincode: string };
  trackingNumber: string | null;
  courier: string | null;
  orderedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  payments: Array<{ id: string; method: string; amount: number; status: string }>;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<string, string> = {
    pending_payment: 'bg-amber-50 text-amber-700 border-amber-200',
    payment_confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    packed: 'bg-purple-50 text-purple-700 border-purple-200',
    shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    return_requested: 'bg-rose-50 text-rose-700 border-rose-200',
    returned: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        styles[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'delivered' ? 'bg-emerald-500' :
        status === 'cancelled' ? 'bg-red-500' :
        status === 'pending_payment' ? 'bg-amber-500' :
        status === 'shipped' || status === 'out_for_delivery' ? 'bg-orange-500' :
        'bg-blue-500'
      }`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function OrderCard({ order }: { order: OrderItem }) {
  const cancellable = CANCELLABLE_STATUSES.includes(order.status);
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200">
      <Link href={`/orders/${order.id}`} className="flex items-start justify-between gap-3 group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">#{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-400">
            {new Date(order.orderedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {order.shippingAddress?.city && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-extrabold text-gray-900">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
          {order.payments?.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-0.5">via {order.payments[0].method}</p>
          )}
        </div>
      </Link>
      {cancellable && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <CancelOrderButton
            orderId={order.id}
            status={order.status}
            amount={order.totalAmount}
          />
        </div>
      )}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`} />;
}

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useWebAuthStore();
  const [tab, setTab] = useState<StatusTab>('all');

  // Fetch profile + orders
  const profileQuery = useQuery({
    queryKey: ['account-profile'],
    queryFn: () =>
      apiClient.get('/public/account/profile').then(r => {
        const raw = r.data;
        return raw?.data?.data ?? raw?.data ?? raw;
      }),
    enabled: !!user,
    retry: 1,
    staleTime: 30_000,
  });

  const ordersQuery = useQuery({
    queryKey: ['my-orders'],
    queryFn: () =>
      apiClient.get('/public/orders?limit=50').then(r => {
        const raw = r.data;
        const unwrapped = raw?.data?.data ?? raw?.data ?? raw;
        return unwrapped?.data ?? unwrapped ?? [];
      }),
    enabled: !!user,
    retry: 1,
    staleTime: 15_000,
  });

  const profile: ProfileData | undefined = profileQuery.data;
  const allOrders: OrderItem[] = ordersQuery.data ?? [];
  const loading = profileQuery.isLoading || ordersQuery.isLoading;
  const error = profileQuery.error || ordersQuery.error;

  // Filter orders by tab
  const filteredOrders = useMemo(() => {
    switch (tab) {
      case 'active': return allOrders.filter(o => ACTIVE_STATUSES.includes(o.status));
      case 'completed': return allOrders.filter(o => COMPLETED_STATUSES.includes(o.status));
      case 'cancelled': return allOrders.filter(o => CANCELLED_STATUSES.includes(o.status));
      default: return allOrders;
    }
  }, [allOrders, tab]);

  // Counts for tab badges
  const counts = useMemo(() => ({
    all: allOrders.length,
    active: allOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).length,
    completed: allOrders.filter(o => COMPLETED_STATUSES.includes(o.status)).length,
    cancelled: allOrders.filter(o => CANCELLED_STATUSES.includes(o.status)).length,
  }), [allOrders]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-500 mb-6">Sign in to view your orders and manage your account.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          >
            Sign In
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your orders and profile</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-red-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* ── Profile Card ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
        {profileQuery.isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : profile ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
              {(profile.firstName?.[0] ?? 'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-gray-400">{profile.email || profile.phone}</p>
              <p className="text-xs text-gray-300 mt-0.5">
                Member since {new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => router.push('/account/edit')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-[0.97]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
            {/* Quick Stats */}
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-center">
                <p className="text-xl font-extrabold text-gray-900">{profile.stats.totalOrders}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Orders</p>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="text-center">
                <p className="text-xl font-extrabold text-gray-900">₹{Number(profile.stats.totalSpent).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Spent</p>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="text-center">
                <p className="text-xl font-extrabold text-emerald-600">{profile.stats.deliveredCount}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Delivered</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load orders</p>
            <p className="text-xs text-red-600 mt-0.5">Please try refreshing the page</p>
          </div>
          <button
            onClick={() => { profileQuery.refetch(); ordersQuery.refetch(); }}
            className="text-xs text-red-600 hover:text-red-800 font-medium shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Orders Section ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-0">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order History</h2>

          {/* Status Tabs */}
          <div className="flex gap-1 border-b border-gray-100 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            {([
              { key: 'all' as const, label: 'All', count: counts.all },
              { key: 'active' as const, label: 'Active', count: counts.active },
              { key: 'completed' as const, label: 'Completed', count: counts.completed },
              { key: 'cancelled' as const, label: 'Cancelled', count: counts.cancelled },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative pb-3 px-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab === t.key ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {t.count}
                  </span>
                )}
                {tab === t.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="border border-gray-50 rounded-xl p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-5 w-20 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {tab === 'all' ? 'No orders yet' : `No ${tab} orders`}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {tab === 'all'
                  ? 'Start shopping to see your orders here.'
                  : `You don't have any ${tab} orders at the moment.`
                }
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
              >
                Browse Products
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/products', label: 'Browse Products', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { href: '/cart', label: 'View Cart', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
          { href: '/contact', label: 'Contact Support', icon: 'M18.364 5.636a9 9 0 11-12.728 0 9 9 0 0112.728 0zm-4.95 3.536a2.5 2.5 0 11-3.536 0 2.5 2.5 0 013.536 0zM12 13c-1.5 0-3 .5-3 1.5V16h6v-1.5c0-1-1.5-1.5-3-1.5z' },
          { href: '/faq', label: 'FAQ', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2.5 p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
