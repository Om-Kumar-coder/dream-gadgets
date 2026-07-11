'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
export default function AdminErrorBoundary({ error, reset, }) {
    useEffect(() => {
        console.error('Admin page error:', error);
    }, [error]);
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4", children: _jsx(AlertTriangle, { className: "w-7 h-7 text-red-500" }) }), _jsx("h2", { className: "text-lg font-semibold text-surface-900 mb-1", children: "Something went wrong" }), _jsx("p", { className: "text-sm text-surface-500 max-w-md mb-6", children: error.message || 'An unexpected error occurred while loading this page.' }), _jsxs("button", { onClick: reset, className: "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors", children: [_jsx(RotateCcw, { className: "w-4 h-4" }), "Try again"] })] }));
}
//# sourceMappingURL=error.js.map