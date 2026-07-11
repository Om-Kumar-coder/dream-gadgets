'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';
import { IconUser, IconPackage, IconRefreshCw, IconHeart, IconSettings, IconShield, IconLogout, IconWallet, IconChevronDown, } from '../icons';
// ─── Helpers ────────────────────────────────────────────────────────────────────
function getInitials(firstName, lastName) {
    const first = firstName?.[0] ?? '';
    const last = lastName?.[0] ?? '';
    return (first + last).toUpperCase() || '?';
}
function getAvatarColor(name) {
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
        'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
        'bg-violet-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
    ];
    if (!name)
        return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
// ─── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
    if (!visible)
        return null;
    return (_jsx("div", { className: "fixed top-4 right-4 z-[100] animate-fade-in-down", children: _jsxs("div", { className: "flex items-center gap-2.5 bg-surface-950 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium", children: [_jsx("svg", { className: "w-4 h-4 text-emerald-400 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), message] }) }));
}
// ─── UserMenu Component ─────────────────────────────────────────────────────────
export function UserMenu() {
    const router = useRouter();
    const { user, logout } = useWebAuthStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const dropdownRef = useRef(null);
    // Fetch full profile when user is logged in
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: () => apiClient.get('/auth/me').then(r => {
            const raw = r.data;
            return (raw?.data ?? raw);
        }),
        enabled: !!user,
        retry: 1,
        staleTime: 60000,
    });
    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [dropdownOpen]);
    // Close on Escape
    useEffect(() => {
        function handleEscape(event) {
            if (event.key === 'Escape')
                setDropdownOpen(false);
        }
        if (dropdownOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [dropdownOpen]);
    // Handle logout — store.logout() now syncs localStorage automatically
    const handleLogout = useCallback(() => {
        logout();
        setDropdownOpen(false);
        setToastVisible(true);
        setTimeout(() => {
            setToastVisible(false);
            router.push('/');
        }, 1200);
    }, [logout, router]);
    // If user is not authenticated, show Login button
    if (!user) {
        return (_jsxs(_Fragment, { children: [_jsx(Link, { href: "/login", className: "hidden sm:block text-sm font-medium text-surface-500 hover:text-surface-700 hover:bg-surface-50 px-3 py-1.5 rounded-lg transition-colors", children: "Login" }), _jsx(Link, { href: "/login", className: "sm:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-50 transition-colors", "aria-label": "Login", children: _jsx(IconUser, { size: 20 }) })] }));
    }
    // ── Derived data ──
    const displayName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
        : (user.email || 'User');
    const initials = profile
        ? getInitials(profile.firstName, profile.lastName)
        : getInitials(user.email);
    const avatarColor = getAvatarColor(displayName);
    const avatarUrl = profile?.avatarUrl;
    const isAdmin = profile?.role?.name === 'admin' || user.role === 'admin';
    return (_jsxs(_Fragment, { children: [_jsx(Toast, { message: "Logged out successfully", visible: toastVisible }), _jsxs("div", { ref: dropdownRef, className: "relative", children: [_jsxs("button", { onClick: () => setDropdownOpen(o => !o), className: "relative flex items-center gap-2 p-1 rounded-full hover:bg-surface-50 transition-colors focus:outline-none focus:ring-2 focus:ring-surface-200 focus:ring-offset-1", "aria-label": "User menu", "aria-expanded": dropdownOpen, "aria-haspopup": "true", children: [_jsx("span", { className: "absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full z-10" }), avatarUrl ? (_jsx("img", { src: avatarUrl, alt: displayName, className: "w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-gray-200 transition-all" })) : (_jsx("div", { className: `w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent hover:ring-white/50 transition-all`, children: initials })), _jsx(IconChevronDown, { size: 14, className: `text-surface-400 transition-transform duration-200 hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}` })] }), dropdownOpen && (_jsx("div", { className: "absolute right-0 top-full mt-2 w-64 origin-top-right animate-dropdown", role: "menu", children: _jsxs("div", { className: "bg-white border border-surface-100 rounded-2xl shadow-xl shadow-black/5 overflow-hidden", children: [_jsx("div", { className: "px-4 py-3.5 border-b border-surface-50", children: _jsxs("div", { className: "flex items-center gap-3", children: [avatarUrl ? (_jsx("img", { src: avatarUrl, alt: "", className: "w-10 h-10 rounded-full object-cover" })) : (_jsx("div", { className: `w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0`, children: initials })), _jsx("div", { className: "min-w-0 flex-1", children: profileLoading ? (_jsxs("div", { className: "space-y-1.5", children: [_jsx("div", { className: "h-3.5 bg-surface-100 rounded animate-pulse w-24" }), _jsx("div", { className: "h-2.5 bg-surface-50 rounded animate-pulse w-32" })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-sm font-semibold text-surface-900 truncate", children: displayName }), _jsx("p", { className: "text-xs text-surface-400 truncate", children: profile?.email || user.email })] })) })] }) }), profile && !profileLoading && (_jsx("div", { className: "px-4 py-2.5 border-b border-surface-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(IconWallet, { size: 16, className: "text-amber-500" }), _jsx("span", { className: "text-sm font-medium text-surface-700", children: "Wallet Balance" })] }), _jsxs("span", { className: "text-sm font-extrabold text-surface-900", children: ["\u20B9", Number(profile.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })] })] }) })), _jsxs("div", { className: "py-1.5", role: "none", children: [_jsx(DropdownItem, { href: "/account", icon: _jsx(IconUser, { size: 16 }), label: "My Profile", onClick: () => setDropdownOpen(false) }), _jsx(DropdownItem, { href: "/orders", icon: _jsx(IconPackage, { size: 16 }), label: "My Orders", onClick: () => setDropdownOpen(false) }), _jsx(DropdownItem, { href: "/buyback", icon: _jsx(IconRefreshCw, { size: 16 }), label: "Buyback Orders", onClick: () => setDropdownOpen(false), disabled: true }), _jsx(DropdownItem, { href: "/wishlist", icon: _jsx(IconHeart, { size: 16 }), label: "Wishlist", onClick: () => setDropdownOpen(false), disabled: true }), _jsx(DropdownItem, { href: "/account/edit", icon: _jsx(IconSettings, { size: 16 }), label: "Settings", onClick: () => setDropdownOpen(false) })] }), _jsxs("div", { className: "border-t border-surface-50 py-1.5", children: [isAdmin && (_jsx(DropdownItem, { href: "/admin", icon: _jsx(IconShield, { size: 16 }), label: "Admin Panel", onClick: () => setDropdownOpen(false), badge: "Admin" })), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors", role: "menuitem", children: [_jsx(IconLogout, { size: 16, className: "shrink-0" }), _jsx("span", { className: "font-medium", children: "Logout" })] })] })] }) }))] })] }));
}
function DropdownItem({ href, icon, label, onClick, badge, disabled, }) {
    if (disabled) {
        return (_jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 cursor-not-allowed select-none", children: [_jsx("span", { className: "shrink-0 text-gray-200", children: icon }), _jsx("span", { children: label }), _jsx("span", { className: "ml-auto text-[10px] text-surface-300 font-medium bg-surface-50 px-1.5 py-0.5 rounded-full", children: "Coming soon" })] }));
    }
    return (_jsxs(Link, { href: href, onClick: onClick, className: "flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors", role: "menuitem", children: [_jsx("span", { className: "shrink-0 text-gray-400", children: icon }), _jsx("span", { className: "font-medium", children: label }), badge && (_jsx("span", { className: "ml-auto text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-full", children: badge }))] }));
}
//# sourceMappingURL=UserMenu.js.map