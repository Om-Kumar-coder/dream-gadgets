'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, FileText, BarChart3, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
const tabs = [
    { href: '/whatsapp', label: 'Inbox', icon: Inbox, exact: true },
    { href: '/whatsapp/templates', label: 'Templates', icon: FileText },
    { href: '/whatsapp/campaigns', label: 'Campaigns', icon: BarChart3 },
];
export default function WhatsappLayout({ children }) {
    const pathname = usePathname();
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-xl bg-emerald-100", children: _jsx(MessageSquare, { className: "w-5 h-5 text-emerald-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "WhatsApp" }), _jsx("p", { className: "text-sm text-surface-500", children: "Customer communication platform" })] })] }) }), _jsx("div", { className: "flex gap-1 border-b border-surface-100", children: tabs.map((tab) => {
                    const isActive = tab.exact
                        ? pathname === tab.href
                        : pathname.startsWith(tab.href);
                    return (_jsxs(Link, { href: tab.href, className: cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px', isActive
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'), children: [_jsx(tab.icon, { className: "w-4 h-4" }), tab.label] }, tab.href));
                }) }), children] }));
}
//# sourceMappingURL=layout.js.map