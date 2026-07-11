'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cart.store';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';
import { SearchSuggestions } from './SearchSuggestions';
import { useWebAuthStore } from '../../store/auth.store';
export function Header() {
    const count = useCartStore(s => s.items.reduce((sum, i) => sum + (i.quantity || 1), 0));
    const { user: authUser } = useWebAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    useEffect(() => { setMobileOpen(false); }, [pathname]);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const handleSearch = useCallback((e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
            router.push(`/products?search=${encodeURIComponent(q)}`);
            setSearchFocused(false);
            setMobileSearchOpen(false);
            document.activeElement?.blur();
        }
    }, [searchQuery, router]);
    useEffect(() => {
        function handleClickOutside(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchFocused(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'Store', href: '/products' },
        { label: 'My Orders', href: '/orders' },
        { label: 'Sell', href: '/sell' },
        { label: '🔥 Hot Deals', href: '/products?sort=discount' },
    ];
    return (_jsxs("header", { className: `sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-surface-100/80'
            : 'bg-white border-b border-surface-100/50'}`, children: [_jsx("div", { className: "hidden md:block bg-gradient-to-r from-primary via-accent to-primary", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-white text-xs font-medium", children: [_jsxs("span", { className: "inline-flex items-center gap-1.5", children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" }) }), "Free Doorstep Pickup Across India"] }), _jsx("span", { className: "w-1 h-1 rounded-full bg-white/40 mx-1" }), _jsx("span", { children: "Instant Payment Within 24 Hours" }), _jsx("span", { className: "w-1 h-1 rounded-full bg-white/40 mx-1" }), _jsx(Link, { href: "/stores", className: "underline underline-offset-2 hover:no-underline font-semibold", children: "Visit Our Store" })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4", children: [_jsx(Link, { href: "/", className: "flex items-center gap-2 shrink-0 group", children: _jsx("img", { src: "/Logo_Dream_Gadgets.png", alt: "Dream Gadgets", className: "h-9 md:h-11 w-auto transition-transform duration-300 group-hover:scale-105" }) }), _jsx("form", { ref: searchRef, onSubmit: handleSearch, className: "hidden md:flex flex-1 max-w-lg mx-4", children: _jsxs("div", { className: "relative w-full group", children: [_jsxs("div", { className: `flex items-center gap-2 rounded-xl border transition-all duration-200 px-3 py-2 ${searchFocused
                                        ? 'border-primary ring-2 ring-primary/15 bg-white'
                                        : 'border-surface-200 bg-surface-50 hover:border-surface-300'}`, children: [_jsx("svg", { className: "w-4 h-4 text-surface-400 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", value: searchQuery, onChange: e => setSearchQuery(e.target.value), onFocus: () => setSearchFocused(true), placeholder: "Search iPhone, Samsung, OnePlus...", className: "w-full bg-transparent border-none outline-none text-sm text-surface-900 placeholder-surface-400" }), _jsx("button", { type: "submit", className: "text-primary hover:opacity-80 transition-opacity", "aria-label": "Search", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }) })] }), searchFocused && searchQuery.length >= 2 && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-2 z-50", children: _jsx(SearchSuggestions, { query: searchQuery, onSelect: (q) => {
                                            router.push(`/products?search=${encodeURIComponent(q)}`);
                                            setSearchFocused(false);
                                        } }) }))] }) }), _jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsxs(Link, { href: "/cart", className: "relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-surface-50 transition-colors group", "aria-label": "Cart", children: [_jsx("svg", { className: "w-5 h-5 text-surface-600 group-hover:text-primary transition-colors", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" }) }), count > 0 && (_jsx("span", { className: "absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 shadow-sm border-2 border-white animate-scale-in", children: count > 99 ? '99+' : count }))] }), authUser && _jsx(NotificationBell, {}), _jsxs("div", { className: "logAccount", children: [authUser ? (_jsx(UserMenu, {})) : (_jsxs(Link, { href: "/login", className: "hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all shadow-sm shadow-primary/20", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }), "Login"] })), !authUser && (_jsx(Link, { href: "/login", className: "sm:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-50 transition-colors", "aria-label": "Login", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }))] }), _jsx("button", { onClick: () => setMobileSearchOpen(true), className: "md:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-50 transition-colors", "aria-label": "Search", children: _jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("path", { d: "M21 21l-4.35-4.35" })] }) }), _jsx("button", { onClick: () => setMobileOpen(o => !o), className: "md:hidden p-2 rounded-xl hover:bg-surface-50 transition-colors", "aria-label": "Toggle menu", children: _jsx("svg", { className: "w-5 h-5 text-surface-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16' }) }) })] })] }), _jsx("div", { className: "hidden md:block border-t border-surface-100/50", children: _jsx("div", { className: "max-w-7xl mx-auto px-4", children: _jsxs("nav", { className: "flex items-center justify-center gap-1", children: [navItems.map(item => (_jsx(Link, { href: item.href, className: `px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 relative ${pathname === item.href
                                    ? 'text-primary bg-primary/5'
                                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'}`, children: item.label }, item.label))), _jsx(Link, { href: "/sell", className: "ml-4 px-5 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97] transition-all animate-glow-pulse", children: "Sell Your Phone" })] }) }) }), mobileOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in", onClick: () => setMobileOpen(false) }), _jsxs("div", { className: "fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl md:hidden overflow-y-auto animate-slide-in-left", children: [_jsxs("div", { className: "p-4 border-b border-surface-100 flex items-center justify-between", children: [_jsx("img", { src: "/Logo_Dream_Gadgets.png", alt: "Dream Gadgets", className: "h-8 w-auto" }), _jsx("button", { onClick: () => setMobileOpen(false), className: "p-2 rounded-xl hover:bg-surface-50", "aria-label": "Close menu", children: _jsx("svg", { className: "w-5 h-5 text-surface-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "p-4 space-y-1", children: [
                                    { href: '/', label: 'Home', icon: '🏠' },
                                    { href: '/products', label: 'Store', icon: '📱' },
                                    { href: '/orders', label: 'My Orders', icon: '📦' },
                                    { href: '/sell', label: 'Sell Your Phone', icon: '💰' },
                                    { href: '/products?category=accessories', label: 'Accessories', icon: '🎧' },
                                    { href: '/products?sort=discount', label: '🔥 Hot Deals', icon: '' },
                                    { href: '/stores', label: 'Our Stores', icon: '📍' },
                                    { href: '/about', label: 'About Us', icon: 'ℹ️' },
                                    { href: '/contact', label: 'Contact', icon: '📞' },
                                ].map(item => (_jsxs(Link, { href: item.href, onClick: () => setMobileOpen(false), className: `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${pathname === item.href
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}`, children: [item.icon && _jsx("span", { className: "text-base", children: item.icon }), item.label] }, item.href))) }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4 border-t border-surface-100 bg-surface-50", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Need help?" }), _jsx("a", { href: "tel:+918017999888", className: "text-sm font-bold text-primary", children: "8017 999 888" })] })] }) })] })] })), mobileSearchOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-white md:hidden animate-fade-in", children: _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("button", { onClick: () => setMobileSearchOpen(false), className: "p-2 rounded-xl hover:bg-surface-50", "aria-label": "Close search", children: _jsx("svg", { className: "w-5 h-5 text-surface-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }), _jsx("form", { onSubmit: handleSearch, className: "flex-1 relative", children: _jsxs("div", { className: "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary bg-surface-50", children: [_jsx("svg", { className: "w-4 h-4 text-primary shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", value: searchQuery, onChange: e => setSearchQuery(e.target.value), placeholder: "Search products...", className: "w-full bg-transparent border-none outline-none text-sm text-surface-900", autoFocus: true })] }) })] }), _jsxs("div", { className: "space-y-2 px-2", children: [_jsx("p", { className: "text-xs text-surface-400 font-semibold uppercase tracking-wider", children: "Popular Searches" }), ['iPhone 16', 'Samsung S25', 'OnePlus 13', 'Nothing Phone 2'].map(s => (_jsxs("button", { onClick: () => {
                                        router.push(`/products?search=${encodeURIComponent(s)}`);
                                        setMobileSearchOpen(false);
                                    }, className: "flex items-center gap-3 w-full text-left px-3 py-3 text-sm text-surface-600 hover:bg-surface-50 rounded-xl transition-colors", children: [_jsx("svg", { className: "w-4 h-4 text-surface-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), s] }, s)))] })] }) }))] }));
}
//# sourceMappingURL=Header.js.map