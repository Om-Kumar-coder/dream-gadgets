'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function UrgencyBadge({ stockLevel = 'high', salesVelocity = 'normal', customMessage }) {
    if (stockLevel === 'out') {
        return (_jsxs("div", { className: "urgency-pulse bg-red-50 text-red-600 border border-red-200", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" }), "Out of Stock"] }));
    }
    if (stockLevel === 'low') {
        return (_jsxs("div", { className: "urgency-pulse bg-red-50 text-red-600 border border-red-200", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" }), "Only 2 left in stock"] }));
    }
    if (salesVelocity === 'fast') {
        return (_jsxs("div", { className: "urgency-pulse bg-amber-50 text-amber-600 border border-amber-200", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" }), "Selling fast"] }));
    }
    if (customMessage) {
        return (_jsxs("div", { className: "urgency-pulse bg-blue-50 text-blue-600 border border-blue-200", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" }), customMessage] }));
    }
    return (_jsxs("div", { className: "flex items-center gap-1.5 text-xs text-emerald-600 font-medium", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.4)]" }), "In Stock"] }));
}
export function StockCounter({ count = 0 }) {
    if (count <= 0)
        return null;
    return (_jsxs("div", { className: "flex items-center gap-1.5 text-xs text-surface-500", children: [_jsx("div", { className: "flex -space-x-1", children: Array.from({ length: Math.min(count, 5) }).map((_, i) => (_jsx("div", { className: "w-5 h-5 rounded-full border-2 border-white bg-surface-200", style: { background: i < 3 ? '#10B981' : i < 4 ? '#F59E0B' : '#EF4444' } }, i))) }), _jsxs("span", { children: [count, "+ people viewing"] })] }));
}
//# sourceMappingURL=UrgencyBadge.js.map