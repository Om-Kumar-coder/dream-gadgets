'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const FALLBACK = '/images/placeholders/no-image.svg';
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
export function RelatedProducts({ itemId }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        fetch(`${API}/public/products/related/${itemId}`)
            .then(res => res.json())
            .then(json => {
            const items = json.data ?? [];
            setProducts(shuffleArray(items));
        })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [itemId]);
    if (loading) {
        return (_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "heading-sm text-surface-900", children: "You May Also Like" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: Array.from({ length: 4 }).map((_, i) => (_jsx("div", { className: "rounded-2xl bg-surface-100 animate-pulse aspect-[3/4]" }, i))) })] }));
    }
    if (products.length === 0)
        return null;
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "heading-sm text-surface-900", children: "You May Also Like" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: products.slice(0, 8).map((p) => {
                    const name = `${p.brand} ${p.model} ${p.storage ?? ''}`.trim();
                    return (_jsxs(Link, { href: `/products/${p.id}`, className: "group card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200", children: [_jsx("div", { className: "relative aspect-square bg-surface-100", children: _jsx(Image, { src: p.thumbnail || FALLBACK, alt: name, fill: true, className: "object-cover transition-transform duration-500 group-hover:scale-110", sizes: "(max-width: 640px) 50vw, 25vw", onError: (e) => { e.currentTarget.src = FALLBACK; } }) }), _jsxs("div", { className: "p-3", children: [_jsx("p", { className: "text-xs text-surface-400", children: p.brand }), _jsx("h3", { className: "text-sm font-semibold text-surface-900 line-clamp-1", children: name }), _jsxs("p", { className: "text-base font-extrabold text-surface-900 mt-1", children: ["\u20B9", p.price.toLocaleString('en-IN')] })] })] }, p.id));
                }) })] }));
}
//# sourceMappingURL=RelatedProducts.js.map