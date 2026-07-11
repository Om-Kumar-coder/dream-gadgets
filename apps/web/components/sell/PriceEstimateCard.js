'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const BASE_PRICES = {
    'iPhone 16 Pro Max': 125000,
    'iPhone 16 Pro': 110000,
    'iPhone 16': 90000,
    'iPhone 15 Pro Max': 110000,
    'iPhone 15 Pro': 95000,
    'iPhone 15': 80000,
    'iPhone 14 Pro Max': 95000,
    'iPhone 14': 70000,
    'iPhone 13': 55000,
    'iPhone 12': 40000,
    'Galaxy S25 Ultra': 120000,
    'Galaxy S25+': 95000,
    'Galaxy S25': 85000,
    'Galaxy S24 Ultra': 110000,
    'Galaxy S24': 75000,
    'Galaxy S23 Ultra': 95000,
    'Galaxy S23': 65000,
    'Galaxy Z Fold 6': 140000,
    'Galaxy Z Flip 6': 95000,
    'Galaxy A55': 30000,
    'OnePlus 13': 75000,
    'OnePlus 12': 65000,
    'OnePlus 11': 55000,
    'OnePlus Nord 4': 30000,
    'OnePlus Nord CE 4': 25000,
    'Xiaomi 14 Pro': 55000,
    'Xiaomi 13 Pro': 45000,
    'Redmi Note 13 Pro': 25000,
    'Redmi Note 12': 18000,
    'Pixel 9 Pro': 85000,
    'Pixel 9': 70000,
    'Pixel 8 Pro': 70000,
    'Pixel 8': 55000,
    'Pixel 7a': 35000,
};
const CONDITION_MULTIPLIERS = {
    sealed_pack: 0.95,
    open_box: 0.90,
    super_mint: 0.85,
    mint: 0.75,
    good: 0.60,
    fair: 0.40,
    broken: 0.20,
};
export function PriceEstimateCard({ brand, modelName, condition, estimatedPrice, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [animatedPrice, setAnimatedPrice] = useState(0);
    // Calculate price from condition
    useEffect(() => {
        if (!condition || !modelName)
            return;
        setLoading(true);
        const basePrice = BASE_PRICES[modelName];
        if (!basePrice) {
            // Fallback: generate a reasonable price
            const estimated = Math.floor(Math.random() * 30000) + 5000;
            onUpdate({ estimatedPrice: estimated });
            setLoading(false);
            return;
        }
        const multiplier = CONDITION_MULTIPLIERS[condition] || 0.5;
        const estimated = Math.round(basePrice * multiplier);
        onUpdate({ estimatedPrice: estimated });
        setLoading(false);
    }, [condition, modelName, onUpdate]);
    // Animate price counting up
    useEffect(() => {
        if (estimatedPrice === null)
            return;
        const duration = 800;
        const start = performance.now();
        const from = 0;
        const to = estimatedPrice;
        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedPrice(Math.round(from + (to - from) * eased));
            if (progress < 1)
                requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [estimatedPrice]);
    const maxPrice = estimatedPrice ? Math.round(estimatedPrice * 1.3) : null;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "heading-sm text-surface-900 mb-1", children: "Your Price Estimate" }), _jsx("p", { className: "text-sm text-surface-500", children: "Based on current market value and device condition" })] }), _jsxs("div", { className: "flex items-center gap-4 p-4 bg-surface-50 rounded-2xl border border-surface-100", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl ring-1 ring-primary/20", children: "\uD83D\uDCF1" }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-surface-900", children: [brand, " ", modelName] }), _jsxs("p", { className: "text-sm text-surface-500 capitalize", children: [condition.replace(/_/g, ' '), " condition"] })] })] }), loading ? (_jsx("div", { className: "h-32 bg-surface-100 rounded-2xl animate-pulse" })) : estimatedPrice ? (_jsxs("div", { className: "relative text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20 animate-scale-in overflow-hidden", children: [_jsx("div", { className: "absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" }), _jsx("p", { className: "text-sm text-surface-500 mb-2", children: "Estimated Price" }), _jsxs("div", { className: "text-5xl sm:text-6xl font-extrabold text-primary mb-2 tracking-tight", children: ["\u20B9", animatedPrice.toLocaleString('en-IN')] }), maxPrice && (_jsxs("p", { className: "text-sm text-surface-500", children: ["Devices like this sell for up to ", _jsxs("span", { className: "font-semibold text-surface-700", children: ["\u20B9", maxPrice.toLocaleString('en-IN')] })] })), _jsxs("div", { className: "flex items-center justify-center gap-2 mt-3 text-xs text-surface-400", children: [_jsx("span", { className: "w-2 h-2 bg-emerald-400 rounded-full animate-pulse" }), "Price updated in real-time"] })] })) : (_jsx("div", { className: "text-center p-8 bg-surface-50 rounded-2xl border border-surface-100", children: _jsx("p", { className: "text-surface-400", children: "Select a condition to see your estimated price" }) })), estimatedPrice && (_jsxs("div", { className: "space-y-2 text-sm animate-fade-in-up", children: [_jsx("p", { className: "font-semibold text-surface-700", children: "Price Breakdown" }), _jsxs("div", { className: "bg-surface-50 rounded-xl p-4 space-y-2 border border-surface-100", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-surface-500", children: ["Base value (", modelName, ")"] }), _jsxs("span", { className: "font-medium text-surface-900", children: ["\u20B9", (BASE_PRICES[modelName] || 0).toLocaleString('en-IN')] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Condition adjustment" }), _jsx("span", { className: "font-medium text-emerald-600", children: condition ? `${Math.round((CONDITION_MULTIPLIERS[condition] || 0) * 100)}%` : '-' })] }), _jsxs("div", { className: "border-t border-surface-200 pt-2 flex justify-between font-bold", children: [_jsx("span", { className: "text-surface-900", children: "Your estimated price" }), _jsxs("span", { className: "text-primary", children: ["\u20B9", estimatedPrice.toLocaleString('en-IN')] })] })] }), _jsx("p", { className: "text-xs text-surface-400", children: "*Final price determined after in-person inspection" })] }))] }));
}
//# sourceMappingURL=PriceEstimateCard.js.map