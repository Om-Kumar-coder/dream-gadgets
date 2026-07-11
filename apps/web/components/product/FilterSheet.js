'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { ItemCondition } from '@dream-gadgets/shared-types';
const CONDITIONS = [
    { value: ItemCondition.SEALED_PACK, label: 'Sealed Pack' },
    { value: ItemCondition.OPEN_BOX, label: 'Open Box' },
    { value: ItemCondition.SUPER_MINT, label: 'Super Mint' },
    { value: ItemCondition.MINT, label: 'Mint' },
    { value: ItemCondition.GOOD, label: 'Good' },
];
const PRICE_RANGES = [
    { label: 'Under ₹10,000', min: '', max: '10000' },
    { label: '₹10,000 – ₹25,000', min: '10000', max: '25000' },
    { label: '₹25,000 – ₹50,000', min: '25000', max: '50000' },
    { label: '₹50,000 – ₹1,00,000', min: '50000', max: '100000' },
    { label: 'Above ₹1,00,000', min: '100000', max: '' },
];
export function FilterSheet({ open, onClose, activeBrand, activeCondition, activeMinPrice, activeMaxPrice, brands, onApply }) {
    const [selectedBrand, setSelectedBrand] = useState(activeBrand || '');
    const [selectedCondition, setSelectedCondition] = useState(activeCondition || '');
    const [selectedPriceMin, setSelectedPriceMin] = useState(activeMinPrice || '');
    const [selectedPriceMax, setSelectedPriceMax] = useState(activeMaxPrice || '');
    if (!open)
        return null;
    const handleApply = () => {
        onApply({
            brand: selectedBrand,
            condition: selectedCondition,
            minPrice: selectedPriceMin,
            maxPrice: selectedPriceMax,
        });
        onClose();
    };
    const handleClear = () => {
        setSelectedBrand('');
        setSelectedCondition('');
        setSelectedPriceMin('');
        setSelectedPriceMax('');
        onApply({});
        onClose();
    };
    const hasActiveFilters = !!(activeBrand || activeCondition || activeMinPrice);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "filter-sheet-overlay", onClick: onClose }), _jsxs("div", { className: "filter-sheet", children: [_jsx("div", { className: "filter-sheet-handle" }), _jsxs("div", { className: "px-5 pb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h2", { className: "heading-sm text-surface-900", children: "Filters" }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-lg hover:bg-surface-100 transition-colors", children: _jsx("svg", { className: "w-5 h-5 text-surface-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "space-y-6 overflow-y-auto max-h-[60vh]", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-surface-900 mb-3", children: "Brand" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { onClick: () => setSelectedBrand(''), className: `text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${!selectedBrand ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`, children: "All" }), brands.map(b => (_jsx("button", { onClick: () => setSelectedBrand(b), className: `text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${selectedBrand === b ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`, children: b }, b)))] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-surface-900 mb-3", children: "Condition" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { onClick: () => setSelectedCondition(''), className: `text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${!selectedCondition ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`, children: "All" }), CONDITIONS.map(c => (_jsx("button", { onClick: () => setSelectedCondition(c.value), className: `text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${selectedCondition === c.value ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`, children: c.label }, c.value)))] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-surface-900 mb-3", children: "Price Range" }), _jsx("div", { className: "flex flex-wrap gap-2", children: PRICE_RANGES.map(r => {
                                                    const isActive = selectedPriceMin === r.min && selectedPriceMax === r.max;
                                                    return (_jsx("button", { onClick: () => {
                                                            setSelectedPriceMin(r.min);
                                                            setSelectedPriceMax(r.max);
                                                        }, className: `text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${isActive ? 'bg-primary text-white border-primary' : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'}`, children: r.label }, r.label));
                                                }) })] })] }), _jsxs("div", { className: "flex gap-3 mt-6 pt-4 border-t border-gray-100", children: [hasActiveFilters && (_jsx("button", { onClick: handleClear, className: "flex-1 py-3 text-sm font-medium text-surface-600 border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors", children: "Clear All" })), _jsx("button", { onClick: handleApply, className: `py-3 text-sm font-bold text-white rounded-xl transition-colors ${hasActiveFilters ? 'flex-1 bg-primary hover:opacity-90' : 'w-full bg-primary hover:opacity-90'}`, children: "Apply Filters" })] })] })] })] }));
}
//# sourceMappingURL=FilterSheet.js.map