import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function TrustElements({ warrantyStatus, warrantyExpiry, condition }) {
    const trustItems = [
        {
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) })),
            title: warrantyStatus || '30-Day Warranty',
            desc: warrantyExpiry
                ? `Valid until ${new Date(warrantyExpiry).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}`
                : 'All products come with warranty coverage',
        },
        {
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" }) })),
            title: '7-Day Return Policy',
            desc: 'Not satisfied? Return within 7 days for a full refund. T&C apply.',
        },
        {
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" }) })),
            title: 'Free Delivery',
            desc: 'Free shipping on all orders. Estimated delivery: 3-7 business days.',
        },
        {
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12l2 2 4-5m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) })),
            title: '100% Authentic',
            desc: 'Every product is verified and certified. Genuine products guaranteed.',
        },
    ];
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "heading-sm text-surface-900", children: "Why Buy From Us" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: trustItems.map((item, i) => (_jsxs("div", { className: "flex gap-3 p-4 bg-surface-50 rounded-xl border border-surface-100 hover:bg-surface-100 hover:border-surface-200 transition-all duration-200", children: [_jsx("div", { className: "text-primary shrink-0 mt-0.5", children: item.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-surface-900", children: item.title }), _jsx("p", { className: "text-xs text-surface-500 mt-0.5", children: item.desc })] })] }, i))) })] }));
}
//# sourceMappingURL=TrustElements.js.map