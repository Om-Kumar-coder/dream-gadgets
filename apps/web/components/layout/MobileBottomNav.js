'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '../../store/cart.store';
import { useWebAuthStore } from '../../store/auth.store';
export function MobileBottomNav() {
    const pathname = usePathname();
    const count = useCartStore(s => s.items.reduce((sum, i) => sum + (i.quantity || 1), 0));
    const { user } = useWebAuthStore();
    const tabs = [
        {
            href: '/',
            label: 'Home',
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) })),
        },
        {
            href: '/products',
            label: 'Shop',
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" }) })),
            badge: count > 0 ? count : undefined,
        },
        {
            href: '/sell',
            label: 'Sell',
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) })),
        },
        {
            href: user ? '/account' : '/login',
            label: 'Account',
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) })),
        },
        {
            href: '/stores',
            label: 'Stores',
            icon: (_jsxs("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" }), _jsx("circle", { cx: "12", cy: "10", r: "3" })] })),
        },
    ];
    const isActive = (href) => {
        if (href === '/')
            return pathname === '/';
        return pathname.startsWith(href);
    };
    return (_jsx("div", { className: "fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom", children: _jsx("div", { className: "bg-white/95 backdrop-blur-lg border-t border-surface-200 shadow-elevation-4", children: _jsx("nav", { className: "flex items-center justify-around", children: tabs.map(tab => {
                    const active = isActive(tab.href);
                    return (_jsxs(Link, { href: tab.href, className: `flex flex-col items-center gap-0.5 py-2.5 px-3 transition-all duration-200 relative ${active ? 'text-primary' : 'text-surface-400 hover:text-surface-600'}`, children: [_jsxs("div", { className: "relative", children: [tab.icon, tab.badge !== undefined && tab.badge > 0 && (_jsx("span", { className: "absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 border-[1.5px] border-white shadow-sm", children: tab.badge > 99 ? '99+' : tab.badge })), active && (_jsx("span", { className: "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" }))] }), _jsx("span", { className: `text-[10px] font-semibold leading-none ${active ? 'text-primary' : ''}`, children: tab.label })] }, tab.href));
                }) }) }) }));
}
//# sourceMappingURL=MobileBottomNav.js.map