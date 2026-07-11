'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { useRealtimeUpdates } from '../../lib/useRealtimeUpdates';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const STATUS_BADGES = {
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
const FILTER_TABS = [
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
function unwrapResponse(json) {
    // Handle TransformInterceptor wrapping: { status, data, meta }
    if (json?.status === 'success' && json?.data !== undefined) {
        return {
            data: Array.isArray(json.data) ? json.data : json.data?.data ?? [],
            meta: json.meta ?? json.data?.meta ?? {},
        };
    }
    // Handle direct response: { data: [...], total, page, limit }
    if (json?.data && Array.isArray(json.data)) {
        return { data: json.data, meta: json };
    }
    // Handle double-wrapped: { data: { data: [...] } }
    if (json?.data?.data && Array.isArray(json.data.data)) {
        return { data: json.data.data, meta: json.data };
    }
    // Fallback
    return { data: Array.isArray(json) ? json : [], meta: {} };
}
function getToken() {
    if (typeof window === 'undefined')
        return null;
    return localStorage.getItem('access_token');
}
async function fetchOrders(page = 1, limit = 10, status, search) {
    try {
        const token = getToken();
        if (!token)
            return { orders: [], total: 0, totalPages: 0, currentPage: 1 };
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status)
            params.set('status', status);
        if (search)
            params.set('search', search);
        const res = await fetch(`${API}/public/orders?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });
        if (!res.ok)
            return { orders: [], total: 0, totalPages: 0, currentPage: 1 };
        const json = await res.json();
        const { data, meta } = unwrapResponse(json);
        return {
            orders: Array.isArray(data) ? data : [],
            total: meta?.total ?? 0,
            totalPages: meta?.totalPages ?? Math.ceil((meta?.total ?? 0) / limit),
            currentPage: meta?.page ?? page,
        };
    }
    catch {
        return { orders: [], total: 0, totalPages: 0, currentPage: 1 };
    }
}
function Pagination({ currentPage, totalPages, onPageChange, }) {
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++)
                pages.push(i);
            return pages;
        }
        pages.push(1);
        const start = Math.max(2, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);
        if (start > 2)
            pages.push('ellipsis');
        for (let i = start; i <= end; i++)
            pages.push(i);
        if (end < totalPages - 1)
            pages.push('ellipsis');
        pages.push(totalPages);
        return pages;
    };
    const pageNumbers = getPageNumbers();
    return (_jsxs("nav", { className: "mt-8 flex items-center justify-center gap-1.5", "aria-label": "Order pagination", children: [_jsxs("button", { onClick: () => onPageChange(currentPage - 1), disabled: currentPage <= 1, className: "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 disabled:opacity-30 disabled:pointer-events-none transition-all", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Prev"] }), pageNumbers.map((p, i) => p === 'ellipsis' ? (_jsx("span", { className: "px-2 text-surface-400 select-none", children: "\u2026" }, `e-${i}`)) : (_jsx("button", { onClick: () => onPageChange(p), className: `min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${p === currentPage
                    ? 'bg-surface-950 text-white shadow-sm'
                    : 'text-surface-600 hover:bg-surface-100'}`, children: p }, p))), _jsxs("button", { onClick: () => onPageChange(currentPage + 1), disabled: currentPage >= totalPages, className: "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 disabled:opacity-30 disabled:pointer-events-none transition-all", children: ["Next", _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] }));
}
function OrderCard({ order }) {
    const badge = STATUS_BADGES[order.status] ?? { label: order.status.replace(/_/g, ' '), class: 'bg-gray-100 text-gray-600' };
    const itemsCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    return (_jsxs(Link, { href: `/orders/${order.id}`, className: "block card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-xs text-surface-400", children: ["Order #", order.orderNumber] }), _jsx("p", { className: "text-xs text-surface-400 mt-0.5", children: order.orderedAt ? new Date(order.orderedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' })] }), _jsx("span", { className: `text-xs px-2.5 py-1 rounded-full font-medium ${badge.class}`, children: badge.label })] }), _jsxs("div", { className: "flex items-end justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-xs text-surface-400", children: [itemsCount, " item", itemsCount !== 1 ? 's' : ''] }), _jsxs("p", { className: "text-lg font-bold text-surface-900 mt-0.5", children: ["\u20B9", Number(order.totalAmount).toLocaleString('en-IN')] })] }), _jsx("div", { className: "text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity", children: "View Details \u2192" })] })] }));
}
const PAGE_SIZE = 10;
export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [activeFilter, setActiveFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const searchTimerRef = useRef(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const doFetch = useCallback((page, filter, search) => {
        setLoading(true);
        setError('');
        const token = getToken();
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
    }, [activeFilter, searchQuery]);
    useEffect(() => {
        doFetch(1);
        return () => {
            if (searchTimerRef.current)
                clearTimeout(searchTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleFilterChange = (value) => {
        if (value === activeFilter)
            return;
        if (searchTimerRef.current)
            clearTimeout(searchTimerRef.current);
        setActiveFilter(value);
        setSearchInput('');
        setSearchQuery('');
        doFetch(1, value, '');
    };
    const handleSearchInput = (value) => {
        setSearchInput(value);
        if (searchTimerRef.current)
            clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setSearchQuery(value);
            setActiveFilter('');
            doFetch(1, '', value);
        }, 350);
    };
    const clearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        if (searchTimerRef.current)
            clearTimeout(searchTimerRef.current);
        doFetch(1, activeFilter, '');
    };
    // Auth check
    useEffect(() => {
        const token = getToken();
        if (!token) {
            setError('Please log in to view your orders.');
            setLoading(false);
        }
        else {
            setIsAuthenticated(true);
        }
    }, []);
    // Realtime auto-refresh on order status changes or returns
    useRealtimeUpdates({
        enabled: isAuthenticated,
        onOrderStatusChanged: () => doFetch(currentPage),
        onReturnCreated: () => doFetch(currentPage),
    });
    if (loading) {
        return (_jsx("main", { className: "max-w-3xl mx-auto px-4 py-12", children: _jsxs("div", { className: "text-center py-20", children: [_jsx("div", { className: "w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-surface-500 text-sm", children: "Loading your orders..." })] }) }));
    }
    if (error && error.includes('log in')) {
        return (_jsx("main", { className: "max-w-3xl mx-auto px-4 py-12", children: _jsxs("div", { className: "text-center py-20", children: [_jsx("div", { className: "text-5xl mb-4", children: "\uD83D\uDD12" }), _jsx("h1", { className: "text-2xl font-bold text-surface-900 mb-2", children: "Sign in Required" }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: "Please log in to view your order history." }), _jsx(Link, { href: "/login", className: "inline-block px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all", children: "Sign In" })] }) }));
    }
    if (error && !error.includes('log in')) {
        return (_jsx("main", { className: "max-w-3xl mx-auto px-4 py-12", children: _jsxs("div", { className: "text-center py-20", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDE15" }), _jsx("h1", { className: "text-xl font-bold text-surface-900 mb-2", children: "Couldn't Load Orders" }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: error }), _jsx("button", { onClick: () => doFetch(1, activeFilter, searchQuery), className: "btn-primary px-5 py-2.5", children: "Try Again" })] }) }));
    }
    return (_jsxs("main", { children: [_jsxs("section", { className: "text-white py-14 px-4 text-center relative overflow-hidden", style: {
                    background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)',
                }, children: [_jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative", children: [_jsx("h1", { className: "text-3xl font-extrabold mb-2", children: "My Orders" }), _jsx("p", { className: "text-white/60 text-sm", children: totalOrders > 0
                                    ? `${totalOrders} order${totalOrders !== 1 ? 's' : ''}${totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}`
                                    : 'Your order history' })] })] }), _jsxs("section", { className: "max-w-3xl mx-auto px-4 py-10", children: [_jsxs("div", { className: "relative mb-4", children: [_jsx("svg", { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", value: searchInput, onChange: (e) => handleSearchInput(e.target.value), placeholder: "Search by order number\u2026", className: "input pl-10 pr-10" }), searchInput && (_jsx("button", { onClick: clearSearch, className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }), "          ", _jsx("div", { className: "flex flex-wrap gap-2 mb-6 pb-4 border-b border-surface-100 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0", children: FILTER_TABS.map((tab) => {
                            const isActive = activeFilter === tab.value;
                            return (_jsx("button", { onClick: () => handleFilterChange(tab.value), className: `whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive
                                    ? 'bg-surface-950 text-white shadow-sm'
                                    : 'bg-surface-50 text-surface-600 hover:bg-surface-100'}`, children: tab.label }, tab.value || '__all__'));
                        }) }), orders.length === 0 ? (_jsx("div", { className: "text-center py-16", children: searchQuery ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-5xl mb-4", children: "\uD83D\uDD0E" }), _jsxs("h2", { className: "text-xl font-bold text-surface-900 mb-2", children: ["No Results for \u201C", searchQuery, "\u201D"] }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: "We couldn't find any orders matching your search. Try a different order number." }), _jsx("button", { onClick: clearSearch, className: "inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all", children: "Clear Search" })] })) : activeFilter ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDD0D" }), _jsxs("h2", { className: "text-xl font-bold text-surface-900 mb-2", children: ["No ", STATUS_BADGES[activeFilter]?.label ?? 'Matching', " Orders"] }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: "You don't have any orders with this status yet." }), _jsx("button", { onClick: () => handleFilterChange(''), className: "inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all", children: "Show All Orders" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDCE6" }), _jsx("h2", { className: "text-xl font-bold text-surface-900 mb-2", children: "No Orders Yet" }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: "You haven't placed any orders yet. Start shopping and find your next device!" }), _jsx(Link, { href: "/products", className: "btn-primary px-6 py-3", children: "Browse Products" })] })) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-4", children: orders.map((order) => (_jsx(OrderCard, { order: order }, order.id))) }), totalPages > 1 && (_jsx(Pagination, { currentPage: currentPage, totalPages: totalPages, onPageChange: (p) => doFetch(p) }))] }))] })] }));
}
//# sourceMappingURL=page.js.map