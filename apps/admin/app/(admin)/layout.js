import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
export default function AdminLayout({ children }) {
    return (_jsxs("div", { className: "flex min-h-screen bg-surface-50", children: [_jsx(Suspense, { fallback: _jsx("div", { className: "w-60 min-h-screen bg-surface-950 animate-pulse" }), children: _jsx(AdminSidebar, {}) }), _jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [_jsx(AdminHeader, {}), _jsx("main", { className: "flex-1 p-6 overflow-auto", children: children })] })] }));
}
//# sourceMappingURL=layout.js.map