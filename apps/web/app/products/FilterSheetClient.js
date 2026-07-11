'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterSheet } from '../../components/product/FilterSheet';
export function FilterSheetClient({ brands, activeBrand, activeCondition, activeMinPrice, activeMaxPrice }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const handleApply = (filters) => {
        const params = new URLSearchParams();
        if (filters.brand)
            params.set('brand', filters.brand);
        if (filters.condition)
            params.set('condition', filters.condition);
        if (filters.minPrice)
            params.set('minPrice', filters.minPrice);
        if (filters.maxPrice)
            params.set('maxPrice', filters.maxPrice);
        const qs = params.toString();
        router.push(qs ? `/products?${qs}` : '/products');
    };
    return (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setOpen(true), className: "shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-colors flex items-center gap-1.5", children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" }) }), "Filters", (activeBrand || activeCondition || activeMinPrice) && (_jsx("span", { className: "w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center", children: "!" }))] }), _jsx(FilterSheet, { open: open, onClose: () => setOpen(false), activeBrand: activeBrand, activeCondition: activeCondition, activeMinPrice: activeMinPrice, activeMaxPrice: activeMaxPrice, brands: brands, onApply: handleApply })] }));
}
//# sourceMappingURL=FilterSheetClient.js.map