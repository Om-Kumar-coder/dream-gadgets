'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';
import { CancelOrderButton } from '../../components/order/CancelOrderButton';
import { IconUser, IconPackage, IconSettings, IconLogout, IconMapPin, IconArrowRight, IconChevronRight, IconSearch, IconAlertCircle, IconCheckCircle, IconTruck, IconCreditCard, IconClock, IconHeart, IconMessageCircle, IconShieldCheck, IconAward, IconRefreshCw, IconPlus, } from '../../components/icons';
const ACTIVE_STATUSES = ['pending_payment', 'payment_confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'];
const COMPLETED_STATUSES = ['delivered', 'return_requested', 'returned'];
const CANCELLED_STATUSES = ['cancelled'];
const CANCELLABLE_STATUSES = ['pending_payment', 'payment_confirmed'];
function StatusBadge({ status }) {
    const styles = {
        pending_payment: 'bg-amber-50 text-amber-700 border-amber-200',
        payment_confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
        processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        packed: 'bg-purple-50 text-purple-700 border-purple-200',
        shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
        delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        cancelled: 'bg-red-50 text-red-700 border-red-200',
        return_requested: 'bg-rose-50 text-rose-700 border-rose-200',
        returned: 'bg-surface-50 text-surface-700 border-surface-200',
    };
    return (_jsxs("span", { className: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] ?? 'bg-surface-50 text-surface-600 border-surface-200'}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${status === 'delivered' ? 'bg-emerald-500' :
                    status === 'cancelled' ? 'bg-red-500' :
                        status === 'pending_payment' ? 'bg-amber-500' :
                            status === 'shipped' || status === 'out_for_delivery' ? 'bg-orange-500' :
                                'bg-blue-500'}` }), status.replace(/_/g, ' ')] }));
}
function OrderCard({ order }) {
    const cancellable = CANCELLABLE_STATUSES.includes(order.status);
    return (_jsxs("div", { className: "card p-4 sm:p-5 hover:shadow-card-hover hover:border-primary/30 transition-all duration-200", children: [_jsxs(Link, { href: `/orders/${order.id}`, className: "flex items-start justify-between gap-3 group", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [_jsxs("span", { className: "text-sm font-bold text-surface-900 group-hover:text-primary transition-colors", children: ["#", order.orderNumber] }), _jsx(StatusBadge, { status: order.status })] }), _jsx("p", { className: "text-xs text-surface-400", children: new Date(order.orderedAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                }) }), order.shippingAddress?.city && (_jsxs("p", { className: "text-xs text-surface-400 mt-1 flex items-center gap-1", children: [_jsx(IconMapPin, { size: 12, className: "text-surface-300" }), order.shippingAddress.city, ", ", order.shippingAddress.state] }))] }), _jsxs("div", { className: "text-right shrink-0", children: [_jsxs("p", { className: "text-base font-extrabold text-surface-900", children: ["\u20B9", Number(order.totalAmount).toLocaleString('en-IN')] }), order.payments?.length > 0 && (_jsxs("p", { className: "text-[10px] text-surface-400 mt-0.5", children: ["via ", order.payments[0].method] }))] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-surface-50 flex items-center gap-2", children: [(order.status === 'shipped' || order.status === 'out_for_delivery') && order.trackingNumber && (_jsxs("span", { className: "flex items-center gap-1 text-xs font-medium text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-lg", children: [_jsx(IconTruck, { size: 12 }), "Track Order"] })), cancellable && (_jsx(CancelOrderButton, { orderId: order.id, status: order.status, amount: order.totalAmount }))] })] }));
}
function Skeleton({ className = '' }) {
    return _jsx("div", { className: `bg-surface-100 animate-pulse rounded-lg ${className}` });
}
export default function AccountPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, logout } = useWebAuthStore();
    const [tab, setTab] = useState('all');
    const [activeSection, setActiveSection] = useState('overview');
    const profileQuery = useQuery({
        queryKey: ['account-profile'],
        queryFn: () => apiClient.get('/public/account/profile').then(r => {
            const raw = r.data;
            return raw?.data?.data ?? raw?.data ?? raw;
        }),
        enabled: !!user,
        retry: 1,
        staleTime: 30000,
    });
    const ordersQuery = useQuery({
        queryKey: ['my-orders'],
        queryFn: () => apiClient.get('/public/orders?limit=50').then(r => {
            const raw = r.data;
            const unwrapped = raw?.data?.data ?? raw?.data ?? raw;
            return unwrapped?.data ?? unwrapped ?? [];
        }),
        enabled: !!user,
        retry: 1,
        staleTime: 15000,
    });
    const profile = profileQuery.data;
    const allOrders = ordersQuery.data ?? [];
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
        return (_jsx("div", { className: "min-h-[70vh] flex items-center justify-center px-4", children: _jsxs("div", { className: "text-center max-w-sm", children: [_jsx("div", { className: "w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6", children: _jsx(IconUser, { size: 40, className: "text-primary" }) }), _jsx("h1", { className: "heading-md text-surface-900 mb-2", children: "My Account" }), _jsx("p", { className: "text-surface-500 mb-6", children: "Sign in to view your orders and manage your account." }), _jsxs(Link, { href: "/login", className: "btn-primary btn-lg", children: ["Sign In", _jsx(IconArrowRight, { size: 16 })] })] }) }));
    }
    return (_jsxs("div", { className: "max-w-5xl mx-auto px-4 py-6 sm:py-10 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-md text-surface-900", children: "My Account" }), _jsx("p", { className: "text-sm text-surface-400 mt-0.5", children: "Manage your profile, orders, and settings" })] }), _jsxs("button", { onClick: handleLogout, className: "text-sm text-surface-400 hover:text-red-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50", children: [_jsx(IconLogout, { size: 16 }), "Logout"] })] }), _jsx("div", { className: "flex gap-1 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0", children: ([
                    { key: 'overview', label: 'Overview', icon: _jsx(IconAward, { size: 16 }) },
                    { key: 'orders', label: 'Orders', icon: _jsx(IconPackage, { size: 16 }) },
                    { key: 'addresses', label: 'Addresses', icon: _jsx(IconMapPin, { size: 16 }) },
                    { key: 'settings', label: 'Settings', icon: _jsx(IconSettings, { size: 16 }) },
                ]).map(s => (_jsxs("button", { onClick: () => setActiveSection(s.key), className: `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeSection === s.key
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-surface-500 hover:bg-surface-100'}`, children: [_jsx("span", { className: activeSection === s.key ? 'text-white' : 'text-surface-400', children: s.icon }), s.label] }, s.key))) }), activeSection === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "card p-5 sm:p-6", children: profileQuery.isLoading ? (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Skeleton, { className: "w-14 h-14 rounded-full" }), _jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Skeleton, { className: "h-5 w-48" }), _jsx(Skeleton, { className: "h-3 w-32" })] })] })) : profile ? (_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4", children: [_jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0", children: (profile.firstName?.[0] ?? 'U').toUpperCase() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("h2", { className: "text-lg font-bold text-surface-900 truncate", children: [profile.firstName, " ", profile.lastName] }), _jsx("p", { className: "text-sm text-surface-400", children: profile.email || profile.phone }), _jsxs("p", { className: "text-xs text-surface-300 mt-0.5 flex items-center gap-1", children: [_jsx(IconClock, { size: 12 }), "Member since ", new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })] })] }), _jsxs("button", { onClick: () => setActiveSection('settings'), className: "flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-[0.97] border border-primary/20", children: [_jsx(IconSettings, { size: 14 }), "Edit Profile"] })] })) : null }), !profileQuery.isLoading && profile && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
                            { label: 'Total Orders', value: profile.stats.totalOrders, icon: _jsx(IconPackage, { size: 20 }), color: 'text-blue-600 bg-blue-50' },
                            { label: 'Total Spent', value: `₹${Number(profile.stats.totalSpent).toLocaleString('en-IN')}`, icon: _jsx(IconCreditCard, { size: 20 }), color: 'text-emerald-600 bg-emerald-50' },
                            { label: 'Delivered', value: profile.stats.deliveredCount, icon: _jsx(IconCheckCircle, { size: 20 }), color: 'text-green-600 bg-green-50' },
                            { label: 'Pending', value: profile.stats.pendingCount, icon: _jsx(IconClock, { size: 20 }), color: 'text-amber-600 bg-amber-50' },
                        ].map(stat => (_jsxs("div", { className: "card p-4", children: [_jsx("div", { className: `w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`, children: stat.icon }), _jsx("p", { className: "text-lg font-extrabold text-surface-900", children: stat.value }), _jsx("p", { className: "text-xs text-surface-400", children: stat.label })] }, stat.label))) })), _jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4", children: [_jsx("h2", { className: "text-lg font-bold text-surface-900", children: "Recent Orders" }), _jsxs("button", { onClick: () => setActiveSection('orders'), className: "text-sm font-medium text-primary hover:underline flex items-center gap-1", children: ["View All ", _jsx(IconChevronRight, { size: 14 })] })] }), _jsx("div", { className: "px-5 sm:px-6 pb-5 sm:pb-6", children: loading ? (_jsx("div", { className: "space-y-3", children: [1, 2].map(i => (_jsx("div", { className: "border border-surface-50 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Skeleton, { className: "h-5 w-40" }), _jsx(Skeleton, { className: "h-3 w-32" })] }), _jsx("div", { className: "text-right space-y-2", children: _jsx(Skeleton, { className: "h-5 w-20 ml-auto" }) })] }) }, i))) })) : allOrders.length === 0 ? (_jsxs("div", { className: "text-center py-10", children: [_jsx("div", { className: "w-14 h-14 mx-auto bg-surface-50 rounded-full flex items-center justify-center mb-3", children: _jsx(IconPackage, { size: 28, className: "text-surface-300" }) }), _jsx("h3", { className: "text-base font-semibold text-surface-900 mb-1", children: "No orders yet" }), _jsx("p", { className: "text-sm text-surface-400 mb-4", children: "Start shopping to see your orders here." }), _jsxs(Link, { href: "/products", className: "btn-primary btn-md", children: ["Browse Products", _jsx(IconArrowRight, { size: 14 })] })] })) : (_jsx("div", { className: "space-y-3", children: allOrders.slice(0, 3).map(order => (_jsx(OrderCard, { order: order }, order.id))) })) })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
                            { href: '/products', label: 'Browse Products', icon: _jsx(IconSearch, { size: 18 }), desc: 'Find your next device' },
                            { href: '/cart', label: 'View Cart', icon: _jsx(IconHeart, { size: 18 }), desc: 'Items in your cart' },
                            { href: '/sell', label: 'Sell Device', icon: _jsx(IconPlus, { size: 18 }), desc: 'Get instant quote' },
                            { href: '/contact', label: 'Support', icon: _jsx(IconMessageCircle, { size: 18 }), desc: 'We are here to help' },
                        ].map(link => (_jsxs(Link, { href: link.href, className: "flex flex-col items-start gap-1.5 p-4 card hover:shadow-card-hover hover:border-primary/30 transition-all active:scale-[0.98]", children: [_jsx("div", { className: "w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 text-primary", children: link.icon }), _jsx("span", { className: "text-sm font-medium text-surface-900", children: link.label }), _jsx("span", { className: "text-xs text-surface-400", children: link.desc })] }, link.href))) })] })), activeSection === 'orders' && (_jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "px-5 sm:px-6 pt-5 sm:pt-6 pb-0", children: [_jsxs("h2", { className: "text-lg font-bold text-surface-900 mb-4 flex items-center gap-2", children: [_jsx(IconPackage, { size: 20, className: "text-primary" }), "Order History"] }), _jsx("div", { className: "flex gap-1 border-b border-surface-100 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6", children: ([{ key: 'all', label: 'All', count: counts.all },
                                    { key: 'active', label: 'Active', count: counts.active },
                                    { key: 'completed', label: 'Completed', count: counts.completed },
                                    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
                                ]).map(t => (_jsxs("button", { onClick: () => setTab(t.key), className: `relative pb-3 px-3 text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'text-primary' : 'text-surface-400 hover:text-surface-600'}`, children: [t.label, t.count > 0 && (_jsx("span", { className: `ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === t.key ? 'bg-primary/10 text-primary' : 'bg-surface-100 text-surface-400'}`, children: t.count })), tab === t.key && _jsx("span", { className: "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" })] }, t.key))) })] }), _jsxs("div", { className: "p-5 sm:p-6", children: [error && (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3", children: [_jsx(IconAlertCircle, { size: 20, className: "text-red-500 shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-red-800", children: "Could not load orders" }), _jsx("p", { className: "text-xs text-red-600 mt-0.5", children: "Please try refreshing the page" })] }), _jsxs("button", { onClick: () => { profileQuery.refetch(); ordersQuery.refetch(); }, className: "text-xs text-red-600 hover:text-red-800 font-medium shrink-0 flex items-center gap-1", children: [_jsx(IconRefreshCw, { size: 12 }), " Retry"] })] })), loading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => (_jsx("div", { className: "border border-surface-50 rounded-xl p-4 sm:p-5", children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Skeleton, { className: "h-5 w-40" }), _jsx(Skeleton, { className: "h-3 w-32" }), _jsx(Skeleton, { className: "h-3 w-24" })] }), _jsxs("div", { className: "text-right space-y-2", children: [_jsx(Skeleton, { className: "h-5 w-20 ml-auto" }), _jsx(Skeleton, { className: "h-3 w-16 ml-auto" })] })] }) }, i))) })) : filteredOrders.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-surface-50 rounded-full flex items-center justify-center mb-4", children: _jsx(IconPackage, { size: 32, className: "text-surface-300" }) }), _jsx("h3", { className: "text-base font-semibold text-surface-900 mb-1", children: tab === 'all' ? 'No orders yet' : `No ${tab} orders` }), _jsx("p", { className: "text-sm text-surface-400 mb-6", children: tab === 'all' ? 'Start shopping to see your orders here.' : `You don't have any ${tab} orders at the moment.` }), _jsxs(Link, { href: "/products", className: "btn-primary btn-md", children: ["Browse Products", _jsx(IconArrowRight, { size: 14 })] })] })) : (_jsx("div", { className: "space-y-3", children: filteredOrders.map(order => (_jsx(OrderCard, { order: order }, order.id))) }))] })] })), activeSection === 'addresses' && (_jsxs("div", { className: "card p-5 sm:p-6", children: [_jsxs("h2", { className: "text-lg font-bold text-surface-900 mb-4 flex items-center gap-2", children: [_jsx(IconMapPin, { size: 20, className: "text-primary" }), "Saved Addresses"] }), _jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-surface-50 rounded-full flex items-center justify-center mb-4", children: _jsx(IconMapPin, { size: 32, className: "text-surface-300" }) }), _jsx("h3", { className: "text-base font-semibold text-surface-900 mb-1", children: "No addresses saved" }), _jsx("p", { className: "text-sm text-surface-400 mb-6", children: "Add an address for faster checkout." }), _jsxs("button", { className: "btn-secondary btn-md", children: [_jsx(IconPlus, { size: 14 }), "Add Address"] })] })] })), activeSection === 'settings' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "card p-5 sm:p-6", children: [_jsxs("h2", { className: "text-lg font-bold text-surface-900 mb-4 flex items-center gap-2", children: [_jsx(IconSettings, { size: 20, className: "text-primary" }), "Account Settings"] }), _jsx("div", { className: "space-y-2", children: [
                                    { label: 'Personal Information', desc: 'Update your name, email, and phone number', icon: _jsx(IconUser, { size: 18 }) },
                                    { label: 'Change Password', desc: 'Update your account password', icon: _jsx(IconShieldCheck, { size: 18 }) },
                                    { label: 'Notification Preferences', desc: 'Manage email and SMS notifications', icon: _jsx(IconMessageCircle, { size: 18 }) },
                                ].map(item => (_jsxs("button", { className: "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors text-left", children: [_jsx("div", { className: "w-9 h-9 bg-surface-50 rounded-lg flex items-center justify-center text-surface-500 shrink-0", children: item.icon }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-surface-900", children: item.label }), _jsx("p", { className: "text-xs text-surface-400", children: item.desc })] }), _jsx(IconChevronRight, { size: 16, className: "text-surface-300 shrink-0" })] }, item.label))) })] }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: [
                            { href: '/returns', label: 'Returns & Refunds', icon: _jsx(IconRefreshCw, { size: 18 }) },
                            { href: '/orders', label: 'My Orders', icon: _jsx(IconPackage, { size: 18 }) },
                            { href: '/faq', label: 'FAQ', icon: _jsx(IconMessageCircle, { size: 18 }) },
                            { href: '/contact', label: 'Contact Support', icon: _jsx(IconMessageCircle, { size: 18 }) },
                        ].map(link => (_jsxs(Link, { href: link.href, className: "flex items-center gap-3 p-3 card hover:shadow-card-hover hover:border-primary/30 transition-all active:scale-[0.98]", children: [_jsx("div", { className: "w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 text-primary", children: link.icon }), _jsx("span", { className: "text-sm font-medium text-surface-700", children: link.label })] }, link.href))) })] }))] }));
}
//# sourceMappingURL=page.js.map