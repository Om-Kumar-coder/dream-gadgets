'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
export default function ProductsError({ error, reset, }) {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.error('Products error:', error);
        }
    }, [error]);
    return (_jsx("div", { className: "min-h-[60vh] flex items-center justify-center px-4", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("div", { className: "w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100", children: _jsx("svg", { className: "w-10 h-10 text-red-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }), _jsx("h1", { className: "text-xl font-bold text-surface-900 mb-2", children: "Couldn't load products" }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: "There was a problem fetching our product catalog. Please try again." }), _jsxs("button", { onClick: reset, className: "inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), "Try Again"] })] }) }));
}
//# sourceMappingURL=error.js.map