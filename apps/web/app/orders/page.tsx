'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OnlineOrderStatus;
  paymentStatus: string;
  orderedAt: string;
  items: { id: string; quantity: number; unitPrice: number }[];
  shippingAddress?: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const STATUS_BADGES: Record<string, { label: string; class: string }> = {
  [OnlineOrderStatus.PENDING_PAYMENT]: { label: 'Pending Payment', class: 'bg-yellow-100 text-yellow-700' },
  [OnlineOrderStatus.PAYMENT_CONFIRMED]: { label: 'Confirmed', class: 'bg-blue-100 text-blue-700' },
  [OnlineOrderStatus.PROCESSING]: { label: 'Processing', class: 'bg-purple-100 text-purple-700' },
  [OnlineOrderStatus.PACKED]: { label: 'Packed', class: 'bg-indigo-100 text-indigo-700' },
  [OnlineOrderStatus.SHIPPED]: { label: 'Shipped', class: 'bg-indigo-100 text-indigo-700' },
  [OnlineOrderStatus.OUT_FOR_DELIVERY]: { label: 'Out for Delivery', class: 'bg-cyan-100 text-cyan-700' },
  [OnlineOrderStatus.DELIVERED]: { label: 'Delivered', class: 'bg-green-100 text-green-700' },
  [OnlineOrderStatus.CANCELLED]: { label: 'Cancelled', class: 'bg-red-100 text-red-700' },
  [OnlineOrderStatus.RETURN_REQUESTED]: { label: 'Return Requested', class: 'bg-orange-100 text-orange-700' },
  [OnlineOrderStatus.RETURNED]: { label: 'Returned', class: 'bg-gray-100 text-gray-600' },
};

interface FetchResult {
  orders: Order[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending Payment', value: OnlineOrderStatus.PENDING_PAYMENT },
  { label: 'Confirmed', value: OnlineOrderStatus.PAYMENT_CONFIRMED },
  { label: 'Processing', value: OnlineOrderStatus.PROCESSING },
  { label: 'Packed', value: OnlineOrderStatus.PACKED },
  { label: 'Shipped', value: OnlineOrderStatus.SHIPPED },
  { label: 'Out for Delivery', value: OnlineOrderStatus.OUT_FOR_DELIVERY },
  { label: 'Delivered', value: OnlineOrderStatus.DELIVERED },
  { label: 'Cancelled', value: OnlineOrderStatus.CANCELLED },
  { label: 'Return Requested', value: OnlineOrderStatus.RETURN_REQUESTED },
  { label: 'Returned', value: OnlineOrderStatus.RETURNED },
];

async function fetchOrders(page: number = 1, limit: number = 10, status?: string, search?: string): Promise<FetchResult> {
  try {
    const token = localStorage.getItem('auth-token');
    if (!token) return { orders: [], total: 0, totalPages: 0, currentPage: 1 };
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    const res = await fetch(`${API}/public/orders?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return { orders: [], total: 0, totalPages: 0, currentPage: 1 };
    const json = await res.json();
    const unwrapped = json.data ?? json;
    const orders = Array.isArray(unwrapped) ? unwrapped : Array.isArray(unwrapped?.data) ? unwrapped.data : [];
    const meta = json.meta ?? unwrapped?.meta ?? {};
    return {
      orders,
      total: meta.total ?? 0,
      totalPages: meta.totalPages ?? 0,
      currentPage: meta.page ?? page,
    };
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return { orders: [], total: 0, totalPages: 0, currentPage: 1 };
  }
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Build visible page range with ellipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    if (start > 2) pages.push('ellipsis');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Order pagination">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-2 text-gray-400 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
              p === currentPage
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

function OrderCard({ order }: { order: Order }) {
  const badge = STATUS_BADGES[order.status] ?? { label: order.status.replace(/_/g, ' '), class: 'bg-gray-100 text-gray-600' };
  const itemsCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400">Order #{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {order.orderedAt ? new Date(order.orderedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.class}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400">{itemsCount} item{itemsCount !== 1 ? 's' : ''}</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
        </div>
        <div className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View Details →
        </div>
      </div>

      {order.status === OnlineOrderStatus.SHIPPED && order.shippingAddress && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Shipping to {order.shippingAddress.city}, {order.shippingAddress.state}
          </p>
        </div>
      )}
    </Link>
  );
}

const PAGE_SIZE = 10;
const MAX_VISIBLE_PAGES = 5;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOrders = (page: number, filter?: string, search?: string) => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('auth-token');
    if (!token) {
      setError('Please log in to view your orders.');
      setLoading(false);
      return;
    }
    const status = filter ?? activeFilter;
    const q = search ?? searchQuery;
    fetchOrders(page, PAGE_SIZE, status, q)
      .then((result) => {
        setOrders(result.orders);
        setCurrentPage(result.currentPage);
        setTotalPages(result.totalPages);
        setTotalOrders(result.total);
      })
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders(1);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (value: string) => {
    if (value === activeFilter) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setActiveFilter(value);
    setSearchInput('');
    setSearchQuery('');
    loadOrders(1, value, '');
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchQuery(value);
      setActiveFilter('');
      loadOrders(1, '', value);
    }, 350);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    loadOrders(1, activeFilter, '');
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your orders...</p>
        </div>
      </main>
    );
  }

  if (error && !error.includes('log in')) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Couldn&apos;t Load Orders</h1>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (error && error.includes('log in')) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h1>
          <p className="text-sm text-gray-500 mb-6">Please log in to view your order history.</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Hero */}
      <section className="text-white py-14 px-4 text-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)',
      }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold mb-2">My Orders</h1>
          <p className="text-white/60 text-sm">
            {totalOrders > 0
              ? `${totalOrders} order${totalOrders !== 1 ? 's' : ''}${totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}`
              : 'Your order history'
            }
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search by order number…"
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-100 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <button
                key={tab.value || '__all__'}
                onClick={() => handleFilterChange(tab.value)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            {searchQuery ? (
              <>
                <div className="text-5xl mb-4">🔎</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Results for &ldquo;{searchQuery}&rdquo;</h2>
                <p className="text-sm text-gray-500 mb-6">We couldn&apos;t find any orders matching your search. Try a different order number.</p>
                <button
                  onClick={clearSearch}
                  className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all"
                >
                  Clear Search
                </button>
              </>
            ) : activeFilter ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No {STATUS_BADGES[activeFilter]?.label ?? 'Matching'} Orders</h2>
                <p className="text-sm text-gray-500 mb-6">You don&apos;t have any orders with this status yet.</p>
                <button
                  onClick={() => handleFilterChange('')}
                  className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all"
                >
                  Show All Orders
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
                <p className="text-sm text-gray-500 mb-6">You haven&apos;t placed any orders yet. Start shopping and find your next device!</p>
                <Link
                  href="/products"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                >
                  Browse Products
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => loadOrders(p)}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
