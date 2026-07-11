'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter, useSearchParams } from 'next/navigation';
const SORT_OPTIONS = [
    { value: 'popular', label: 'Popularity' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'discount', label: 'Biggest Discount' },
];
export function SortSelect({ defaultValue, basePath = '/products' }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const handleChange = (e) => {
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        params.set('sort', e.target.value);
        router.push(`${basePath}?${params}`);
    };
    return (_jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [_jsx("label", { htmlFor: "sort-select", className: "text-xs text-surface-400 hidden sm:block", children: "Sort by:" }), _jsx("select", { id: "sort-select", name: "sort", className: "text-xs border border-surface-200 rounded-lg px-3 py-1.5 bg-white text-surface-700 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20", defaultValue: defaultValue, onChange: handleChange, children: SORT_OPTIONS.map(s => (_jsx("option", { value: s.value, children: s.label }, s.value))) })] }));
}
//# sourceMappingURL=SortSelect.js.map