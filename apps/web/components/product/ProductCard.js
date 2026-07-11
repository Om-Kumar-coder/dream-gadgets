import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
function computeDiscount(price, original) {
    if (!original || original <= price)
        return null;
    return Math.round((1 - price / original) * 100);
}
function formatPrice(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
}
function getQualityClass(q) {
    const map = {
        super_mint: 'Super Mint',
        sealed_pack: 'Sealed Pack',
        open_box: 'Open Box',
        mint: 'Mint',
        good: 'Good',
    };
    return map[q?.toLowerCase()] || q || 'Mint';
}
function getProductImage(p) {
    if (p.images?.[0])
        return p.images[0];
    if (p.thumbnail)
        return p.thumbnail;
    return null;
}
/** Render star rating (stars only, numeric rating shown separately) */
function StarRating({ rating }) {
    return (_jsx("div", { className: "flex items-center gap-0.5", "aria-label": `${rating} out of 5 stars`, children: [1, 2, 3, 4, 5].map((star) => (_jsx("svg", { className: `w-3 h-3 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-surface-200'}`, fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }, star))) }));
}
/**
 * Named-export version that accepts individual props (used by brands/[slug] and products pages).
 */
export function ProductCard({ id, name, condition, price, originalPrice, imageUrl, storage, brand, rating, reviewCount, inStock, quickAdd, variant = 'square', }) {
    return (_jsx(ProductCardDefault, { product: {
            id,
            item_name: name, // name already includes storage from caller
            condition,
            online_price: price,
            original_price: originalPrice,
            images: imageUrl ? [imageUrl] : [],
            storage,
            brand,
            rating,
            reviewCount,
            inStock,
            quickAdd,
        }, variant: variant, index: 0 }));
}
/**
 * Default export — accepts raw product API data.
 * Used by the homepage (page.tsx).
 */
export default function ProductCardDefault({ product: p, variant = 'grid', index = 0 }) {
    const price = Number(p.online_price ?? p.price ?? p.selling_price ?? 0);
    const origPrice = p.original_price ? Number(p.original_price) : undefined;
    const discount = computeDiscount(price, origPrice);
    const img = getProductImage(p);
    const name = p.item_name ?? `${p.model ?? ''} ${p.storage ?? ''}`.trim();
    const quality = getQualityClass(p.condition);
    const isSquare = variant === 'square';
    const padding = isSquare ? 'p-5' : 'p-6';
    const isInStock = p.inStock !== false;
    const hasQuickAdd = !!p.quickAdd;
    const hasRating = typeof p.rating === 'number' && p.rating > 0;
    return (_jsxs(Link, { href: `/products/${p.id}`, className: "group relative bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-300 flex flex-col", children: [_jsxs("div", { className: `relative ${isSquare ? 'aspect-square' : 'aspect-[4/3]'} bg-gradient-to-br from-surface-50 to-surface-100 overflow-hidden`, children: [discount && (_jsxs("span", { className: "absolute top-3 right-3 z-10 inline-flex items-center gap-0.5 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg", children: ["-", discount, "%"] })), !isInStock && (_jsx("span", { className: "absolute top-3 left-3 z-10 bg-surface-800/80 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg", children: "Out of Stock" })), img ? (_jsx("img", { src: img, alt: name, className: `w-full h-full object-contain ${padding} transition-transform duration-500 ease-out group-hover:scale-110`, loading: "lazy" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsxs("svg", { className: "w-14 h-14 text-surface-200", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", ry: "2" }), _jsx("line", { x1: "12", y1: "18", x2: "12.01", y2: "18" })] }) })), !isSquare && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }))] }), _jsxs("div", { className: "p-4 md:p-5 flex-1 flex flex-col", children: [_jsx("span", { className: "inline-block text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-full mb-2 capitalize w-fit", children: quality }), _jsx("h3", { className: "text-sm md:text-base font-semibold text-surface-900 line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors", children: name }), hasRating && (_jsxs("div", { className: "mb-1.5 flex items-center gap-1.5", children: [_jsx(StarRating, { rating: Number(p.rating) }), _jsx("span", { className: "text-[10px] text-surface-400", children: Number(p.rating).toFixed(1) }), p.reviewCount && Number(p.reviewCount) > 0 && (_jsxs("span", { className: "text-[10px] text-surface-300", children: ["(", Number(p.reviewCount), ")"] }))] })), p.branch_name && (_jsx("p", { className: "text-xs text-surface-400 mb-1", children: p.branch_name })), _jsxs("div", { className: "mt-auto flex items-baseline gap-2", children: [_jsx("span", { className: `font-extrabold text-surface-900 ${isSquare ? 'text-base' : 'text-lg'}`, children: formatPrice(price) }), origPrice && (_jsx("span", { className: `text-surface-400 line-through ${isSquare ? 'text-xs' : 'text-sm'}`, children: formatPrice(origPrice) }))] }), hasQuickAdd && isInStock && (_jsx("button", { type: "button", onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Quick add logic handled by parent (cart integration)
                        }, className: "mt-2 w-full py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-[0.97]", children: "Quick Add" }))] })] }, p.id || index));
}
//# sourceMappingURL=ProductCard.js.map