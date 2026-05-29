'use client';
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';
import { CancelOrderButton } from '../../components/order/CancelOrderButton';
import {
  IconUser,
  IconPackage,
  IconSettings,
  IconLogout,
  IconMapPin,
  IconArrowRight,
  IconChevronRight,
  IconSearch,
  IconAlertCircle,
  IconCheckCircle,
  IconTruck,
  IconCreditCard,
  IconClock,
  IconHeart,
  IconMessageCircle,
  IconStore,
  IconShieldCheck,
  IconAward,
  IconRefreshCw,
  IconPlus,
} from '../../components/icons';

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
              <IconMapPin size={12} className="text-gray-300" />
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
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
        {/* Track Order button for active orders */}
        {(order.status === 'shipped' || order.status === 'out_for_delivery') && order.trackingNumber && (
          <span className="flex items-center gap-1 text-xs font-medium text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-lg">
            <IconTruck size={12} />
            Track Order
          </span>
        )}
        {cancellable && (
          <CancelOrderButton
            orderId={order.id}
            status={order.status}
            amount={order.totalAmount}
          />
        )}
      </div>
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
  const [activeSection, setActiveSection] = useState<'overview' | 'orders' | 'addresses' | 'settings'>('overview');

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

  const filteredOrders = useMemo(() => {
    switch (tab) {
      case 'active': return allOrders.filter(o => ACTIVE_STATUSES.includes(o.status));
      case 'completed': return allOrders.filter(o => COMPLETED_STATUSES.includes(o.status));
      case 'cancelled': return allOrders.filter(o => CANCELLED_STATUSES.includes(o.status));
      default: return allOrders;
    }
  }, [allOrders, tab]);

  const counts = useMemo(() => ({
    all: allOrders.length,
    active: allOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).length,
    completed: allOrders.filter(o => COMPLETED_STATUSES.includes(o.status)).length,
    cancelled: allOrders.filter(o => CANCELLED_STATUSES.includes(o.status)).length,
  }), [allOrders]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
            <IconUser size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-500 mb-6">Sign in to view your orders and manage your account.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          >
            Sign In
            <IconArrowRight size={16} />
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
          <p className="text-sm text-gray-400 mt-0.5">Manage your profile, orders, and settings</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <IconLogout size={16} />
          Logout
        </button>
      </div>

      {/* ── Section Navigation ── */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { key: 'overview' as const, label: 'Overview', icon: <IconAward size={16} /> },
          { key: 'orders' as const, label: 'Orders', icon: <IconPackage size={16} /> },
          { key: 'addresses' as const, label: 'Addresses', icon: <IconMapPin size={16} /> },
          { key: 'settings' as const, label: 'Settings', icon: <IconSettings size={16} /> },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === s.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <span className={activeSection === s.key ? 'text-white' : 'text-gray-400'}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ OVERVIEW ══════════════════ */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* ── Profile Card ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
            {profileQuery.isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : profile ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {(profile.firstName?.[0] ?? 'U').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 truncate">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-sm text-gray-400">{profile.email || profile.phone}</p>
                  <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
                    <IconClock size={12} />
                    Member since {new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('settings')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-[0.97] border border-primary/20"
                >
                  <IconSettings size={14} />
                  Edit Profile
                </button>
              </div>
            ) : null}
          </div>

          {/* ── Stats Grid ── */}
          {!profileQuery.isLoading && profile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Orders', value: profile.stats.totalOrders, icon: <IconPackage size={20} />, color: 'text-blue-600 bg-blue-50' },
                { label: 'Total Spent', value: `₹${Number(profile.stats.totalSpent).toLocaleString('en-IN')}`, icon: <IconCreditCard size={20} />, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Delivered', value: profile.stats.deliveredCount, icon: <IconCheckCircle size={20} />, color: 'text-green-600 bg-green-50' },
                { label: 'Pending', value: profile.stats.pendingCount, icon: <IconClock size={20} />, color: 'text-amber-600 bg-amber-50' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="text-lg font-extrabold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Recent Orders ── */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <button onClick={() => setActiveSection('orders')} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                View All <IconChevronRight size={14} />
              </button>
            </div>
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="border border-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <div className="text-right space-y-2">
                          <Skeleton className="h-5 w-20 ml-auto" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : allOrders.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <IconPackage size={28} className="text-gray-300" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No orders yet</h3>
                  <p className="text-sm text-gray-400 mb-4">Start shopping to see your orders here.</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                  >
                    Browse Products
                    <IconArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {allOrders.slice(0, 3).map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/products', label: 'Browse Products', icon: <IconSearch size={18} />, desc: 'Find your next device' },
              { href: '/cart', label: 'View Cart', icon: <IconHeart size={18} />, desc: 'Items in your cart' },
              { href: '/sell', label: 'Sell Device', icon: <IconPlus size={18} />, desc: 'Get instant quote' },
              { href: '/contact', label: 'Support', icon: <IconMessageCircle size={18} />, desc: 'We are here to help' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-start gap-1.5 p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
              >
                <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 text-primary">
                  {link.icon}
                </div>
                <span className="text-sm font-medium text-gray-900">{link.label}</span>
                <span className="text-xs text-gray-400">{link.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ ORDERS ══════════════════ */}
      {activeSection === 'orders' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-0">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <IconPackage size={20} className="text-primary" />
              Order History
            </h2>

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
            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <IconAlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Could not load orders</p>
                  <p className="text-xs text-red-600 mt-0.5">Please try refreshing the page</p>
                </div>
                <button
                  onClick={() => { profileQuery.refetch(); ordersQuery.refetch(); }}
                  className="text-xs text-red-600 hover:text-red-800 font-medium shrink-0 flex items-center gap-1"
                >
                  <IconRefreshCw size={12} />
                  Retry
                </button>
              </div>
            )}

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
                  <IconPackage size={32} className="text-gray-300" />
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
                  <IconArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ ADDRESSES ══════════════════ */}
      {activeSection === 'addresses' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IconMapPin size={20} className="text-primary" />
            Saved Addresses
          </h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <IconMapPin size={32} className="text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No addresses saved</h3>
            <p className="text-sm text-gray-400 mb-6">Add an address for faster checkout.</p>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all">
              <IconPlus size={14} />
              Add Address
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ SETTINGS ══════════════════ */}
      {activeSection === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <IconSettings size={20} className="text-primary" />
              Account Settings
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Personal Information', desc: 'Update your name, email, and phone number', icon: <IconUser size={18} /> },
                { label: 'Change Password', desc: 'Update your account password', icon: <IconShieldCheck size={18} /> },
                { label: 'Notification Preferences', desc: 'Manage email and SMS notifications', icon: <IconMessageCircle size={18} /> },
              ].map(item => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <IconChevronRight size={16} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/returns', label: 'Returns & Refunds', icon: <IconRefreshCw size={18} /> },
              { href: '/orders', label: 'My Orders', icon: <IconPackage size={18} /> },
              { href: '/faq', label: 'FAQ', icon: <IconMessageCircle size={18} /> },
              { href: '/contact', label: 'Contact Support', icon: <IconMessageCircle size={18} /> },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
              >
                <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 text-primary">
                  {link.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
