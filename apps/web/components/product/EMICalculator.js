'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
export function EMICalculator({ price }) {
    const [open, setOpen] = useState(false);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!open || plans.length > 0 || price <= 0)
            return;
        setLoading(true);
        setError('');
        fetch(`${API}/public/emi/plans?amount=${Math.round(price)}`)
            .then((res) => {
            if (!res.ok)
                throw new Error('Failed to load EMI plans');
            return res.json();
        })
            .then((json) => {
            setPlans(json.data ?? []);
        })
            .catch((err) => {
            setError(err?.message ?? 'Could not load EMI plans');
        })
            .finally(() => setLoading(false));
    }, [open, price, plans.length]);
    // Group plans by provider
    const groupedPlans = plans.reduce((acc, plan) => {
        const key = plan.providerName || plan.providerSlug;
        if (!acc[key])
            acc[key] = [];
        acc[key].push(plan);
        return acc;
    }, {});
    return (_jsxs("div", { className: "card overflow-hidden", children: [_jsxs("button", { onClick: () => setOpen(!open), className: "w-full flex items-center justify-between p-4 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors group", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-lg", children: "\uD83D\uDCB3" }), _jsx("span", { children: "EMI Calculator" }), plans.some(p => Number(p.minAmount) <= price) && (_jsxs("span", { className: "badge-success text-[10px] ml-1", children: [plans.length, " plans"] }))] }), _jsx("svg", { className: `w-4 h-4 text-surface-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), open && (_jsx("div", { className: "p-4 border-t border-surface-100 bg-surface-50/50", children: loading ? (_jsx("div", { className: "space-y-3 animate-pulse", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-10 bg-surface-100 rounded-lg" }, i))) })) : error ? (_jsxs("div", { className: "text-center py-4", children: [_jsx("p", { className: "text-sm text-surface-400", children: "EMI plans temporarily unavailable." }), _jsx("p", { className: "text-xs text-surface-300 mt-1", children: "Please check back later or visit our store." })] })) : plans.length === 0 ? (_jsx("div", { className: "text-center py-4", children: _jsx("p", { className: "text-sm text-surface-500", children: price < 3000
                            ? 'EMI is available on orders above ₹3,000.'
                            : 'No EMI plans available for this amount.' }) })) : (_jsxs("div", { className: "space-y-4", children: [Object.entries(groupedPlans).map(([providerName, providerPlans]) => (_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary/60" }), providerName] }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-surface-400 text-[10px] uppercase tracking-wider", children: [_jsx("th", { className: "text-left pb-2 font-medium", children: "Tenure" }), _jsx("th", { className: "text-left pb-2 font-medium", children: "Rate" }), _jsx("th", { className: "text-right pb-2 font-medium", children: "Monthly EMI" })] }) }), _jsx("tbody", { children: providerPlans.map((plan) => (_jsxs("tr", { className: "border-t border-surface-100/80", children: [_jsx("td", { className: "py-2 text-surface-700 font-medium", children: plan.label }), _jsx("td", { className: "py-2 text-surface-500", children: plan.annualRate === 0 ? (_jsx("span", { className: "text-emerald-600 font-semibold", children: "No Cost" })) : (_jsxs("span", { children: [plan.annualRate, "% p.a."] })) }), _jsxs("td", { className: "py-2 text-right font-bold text-surface-900", children: ["\u20B9", plan.emiAmount.toLocaleString('en-IN'), "/mo"] })] }, plan.id))) })] })] }, providerName))), _jsxs("div", { className: "space-y-1.5 pt-3 border-t border-surface-100", children: [plans.slice(0, 1).map((plan) => (plan.totalInterest > 0 && (_jsxs("p", { className: "text-[11px] text-surface-400 flex items-center gap-1.5", children: [_jsx("span", { children: "\uD83D\uDCA1" }), "Total interest: ", _jsxs("span", { className: "font-semibold text-surface-600", children: ["\u20B9", plan.totalInterest.toLocaleString('en-IN')] }), ' · ', "Total payment: ", _jsxs("span", { className: "font-semibold text-surface-600", children: ["\u20B9", plan.totalPayment.toLocaleString('en-IN')] })] }, `info-${plan.id}`)))), _jsx("p", { className: "text-[10px] text-surface-400 mt-1", children: "*EMI subject to bank approval. Available on orders \u20B93,000+." })] })] })) }))] }));
}
//# sourceMappingURL=EMICalculator.js.map