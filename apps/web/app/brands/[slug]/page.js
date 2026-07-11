import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { notFound } from 'next/navigation';
import { ProductCard } from '../../../components/product/ProductCard';
import { SortSelect } from '../../../components/product/SortSelect';
import { findBrand, BRANDS } from '../../../lib/brands';
import { BrandPromoBanner, BrandOfferBanner } from '../../../components/banner/BrandBanners';
import { DynamicBrandHero } from '../../../components/banner/BrandHero';
import { BreadcrumbJsonLd } from '../../../components/seo/BreadcrumbJsonLd';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const CONDITIONS = [
    { value: 'SEALED_PACK', label: 'Sealed Pack', short: 'Sealed' },
    { value: 'OPEN_BOX', label: 'Open Box', short: 'Open Box' },
    { value: 'SUPER_MINT', label: 'Super Mint', short: 'Super Mint' },
    { value: 'MINT', label: 'Mint', short: 'Mint' },
    { value: 'GOOD', label: 'Good', short: 'Good' },
];
const PRICE_RANGES = [
    { label: 'Under ₹10,000', min: '', max: '10000' },
    { label: '₹10,000 – ₹25,000', min: '10000', max: '25000' },
    { label: '₹25,000 – ₹50,000', min: '25000', max: '50000' },
    { label: '₹50,000 – ₹1,00,000', min: '50000', max: '100000' },
    { label: 'Above ₹1,00,000', min: '100000', max: '' },
];
async function getProducts(brand, searchParams) {
    const params = new URLSearchParams({
        page: searchParams.page ?? '1',
        limit: '24',
        brand,
        ...(searchParams.condition && { condition: searchParams.condition }),
        ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
        ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
        ...(searchParams.sort && { sort: searchParams.sort }),
    });
    try {
        const res = await fetch(`${API}/public/products?${params}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok)
            return { data: [], total: 0, meta: {} };
        const json = await res.json();
        return {
            data: json.data ?? json.items ?? [],
            total: json.meta?.total ?? json.total ?? 0,
            meta: json.meta ?? {},
        };
    }
    catch {
        return { data: [], total: 0, meta: {} };
    }
}
export async function generateMetadata({ params }) {
    const brand = findBrand(params.slug);
    if (!brand)
        return { title: 'Brand Not Found' };
    return {
        title: `${brand.name} Phones — Dream Gadgets`,
        description: `Shop certified pre-owned ${brand.name} phones at the best prices. 20-point quality checked, 6-month warranty, free delivery, and 7-day returns.`,
        openGraph: {
            title: `${brand.name} Phones — Dream Gadgets`,
            description: `Shop certified pre-owned ${brand.name} smartphones at the best prices. Quality checked with warranty.`,
            images: brand.image ? [brand.image] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${brand.name} Phones — Dream Gadgets`,
            description: `Shop certified pre-owned ${brand.name} phones with warranty.`,
        },
    };
}
function FilterLink({ href, active, children }) {
    return (_jsx("a", { href: href, className: `block text-sm px-3 py-2 rounded-lg transition-all duration-200 ${active
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'}`, children: children }));
}
export default async function BrandPage({ params: { slug }, searchParams }) {
    const brand = findBrand(slug);
    if (!brand)
        notFound();
    const { data: products, total } = await getProducts(brand.name, searchParams);
    const activeCondition = searchParams.condition;
    const activeSort = searchParams.sort || 'popular';
    const hasFilters = !!(activeCondition || searchParams.minPrice);
    const currentPage = Number(searchParams.page ?? '1');
    const limit = 24;
    const totalPages = Math.ceil(total / limit);
    const brandName = brand.name;
    const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'Brands', url: '/products' },
        { name: `${brandName} Phones`, url: `/brands/${slug}` },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-surface-50/50", children: [_jsx(BreadcrumbJsonLd, { items: breadcrumbItems }), _jsx(DynamicBrandHero, { slug: slug, brandName: brand.name, brandLogo: brand.image, totalProducts: total }), _jsx(BrandPromoBanner, {}), _jsx("div", { className: "bg-white border-b border-surface-100/80 sticky top-0 z-20 shadow-xs", children: _jsx("div", { className: "max-w-7xl mx-auto px-4", children: _jsx("div", { className: "flex items-center gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 py-2.5", children: BRANDS.map(b => {
                            const isActive = b.name.toLowerCase() === slug.toLowerCase();
                            return (_jsxs("a", { href: isActive ? '#' : `/brands/${b.name.toLowerCase()}`, className: `snap-start shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-sm shadow-primary/20 ring-1 ring-primary/30'
                                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 active:scale-[0.97]'}`, "aria-current": isActive ? 'page' : undefined, children: [_jsx("div", { className: `w-7 h-7 rounded-lg flex items-center justify-center p-1 ${isActive ? 'bg-white/20' : 'bg-surface-100'}`, children: _jsx("img", { src: b.image, alt: b.name, className: "w-full h-full object-contain", loading: "lazy" }) }), _jsx("span", { className: "whitespace-nowrap", children: b.name })] }, b.name));
                        }) }) }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8 flex gap-8", children: [_jsx("aside", { className: "hidden md:block w-64 shrink-0", children: _jsxs("div", { className: "sticky top-28 space-y-6", children: [_jsx("div", { className: "p-4 bg-white rounded-2xl border border-surface-100", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center p-1.5", children: _jsx("img", { src: brand.image, alt: brand.name, className: "w-full h-full object-contain" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-surface-900", children: brand.name }), _jsxs("p", { className: "text-xs text-surface-400", children: [total, " product", total !== 1 ? 's' : ''] })] })] }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3", children: "Condition" }), _jsxs("div", { className: "space-y-0.5", children: [_jsx(FilterLink, { href: `/brands/${slug}`, active: !activeCondition, children: "All Conditions" }), CONDITIONS.map(c => {
                                                    const url = activeCondition === c.value
                                                        ? `/brands/${slug}`
                                                        : `/brands/${slug}?condition=${c.value}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`;
                                                    return (_jsx(FilterLink, { href: url, active: activeCondition === c.value, children: _jsx("span", { className: "flex items-center gap-2", children: _jsx("span", { className: `text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.value === 'SEALED_PACK' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                                                                    c.value === 'OPEN_BOX' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                        c.value === 'SUPER_MINT' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                            c.value === 'MINT' ? 'bg-teal-50 text-teal-600 border-teal-200' :
                                                                                'bg-amber-50 text-amber-600 border-amber-200'}`, children: c.short }) }) }, c.value));
                                                })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3", children: "Price Range" }), _jsx("div", { className: "space-y-0.5", children: PRICE_RANGES.map(r => {
                                                const isActive = searchParams.minPrice === r.min && searchParams.maxPrice === r.max;
                                                const qp = new URLSearchParams(r);
                                                if (activeCondition)
                                                    qp.set('condition', activeCondition);
                                                if (searchParams.sort)
                                                    qp.set('sort', searchParams.sort);
                                                const href = `/brands/${slug}?${qp}`;
                                                return (_jsx(FilterLink, { href: href, active: isActive, children: r.label }, r.label));
                                            }) })] }), hasFilters && (_jsxs("a", { href: `/brands/${slug}`, className: "flex items-center gap-2 px-3 py-2.5 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }), "Clear All Filters"] })), _jsxs("div", { children: [_jsx("h3", { className: "text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3", children: "Other Brands" }), _jsx("div", { className: "space-y-0.5", children: BRANDS.filter(b => b.name !== brand.name).slice(0, 8).map(b => (_jsxs("a", { href: `/brands/${b.name.toLowerCase()}`, className: "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-all", children: [_jsx("div", { className: "w-6 h-6 rounded bg-surface-100 p-0.5 flex items-center justify-center", children: _jsx("img", { src: b.image, alt: b.name, className: "w-full h-full object-contain" }) }), _jsx("span", { children: b.name })] }, b.name))) }), _jsx("a", { href: "/products", className: "block mt-2 text-xs text-primary font-semibold px-3 py-1.5 hover:bg-primary/5 rounded-lg transition-colors", children: "View All Brands \u2192" })] })] }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-3 mb-6", children: [_jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:hidden flex-1", children: CONDITIONS.map(c => (_jsx("a", { href: activeCondition === c.value
                                                ? `/brands/${slug}`
                                                : `/brands/${slug}?condition=${c.value}`, className: `shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${activeCondition === c.value
                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'}`, children: c.short }, c.value))) }), _jsx(SortSelect, { defaultValue: activeSort, basePath: `/brands/${slug}` })] }), products.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-center", children: [_jsx("div", { className: "w-28 h-28 bg-surface-100 rounded-full flex items-center justify-center mb-5", children: _jsx("div", { className: "w-16 h-16 rounded-full bg-surface-200 flex items-center justify-center", children: _jsx("img", { src: brand.image, alt: brand.name, className: "w-10 h-10 object-contain opacity-40" }) }) }), _jsxs("p", { className: "text-lg font-bold text-surface-700", children: ["No ", brand.name, " phones found"] }), _jsx("p", { className: "text-sm text-surface-400 mt-1.5 max-w-xs", children: "Try adjusting your filters or browse other brands." }), _jsxs("div", { className: "flex gap-3 mt-6", children: [_jsx("a", { href: `/brands/${slug}`, className: "px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-md shadow-primary/25", children: "Clear Filters" }), _jsx("a", { href: "/products", className: "px-6 py-2.5 bg-white text-surface-700 rounded-xl text-sm font-bold border border-surface-200 hover:bg-surface-50 active:scale-[0.97] transition-all", children: "Browse All Brands" })] })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5", children: products.map((p) => {
                                            const price = Number(p.price ?? p.onlinePrice ?? p.sellingPrice ?? 0);
                                            const originalPrice = p.originalPrice ? Number(p.originalPrice) : undefined;
                                            return (_jsx(ProductCard, { id: p.id, slug: p.id, name: p.itemName ?? `${p.model ?? ''} ${p.storage ?? ''}`.trim(), condition: p.condition, price: price, originalPrice: originalPrice, imageUrl: p.images?.[0], storage: p.storage, brand: p.brand, rating: p.rating ?? 0, reviewCount: p.reviewCount ?? 0, inStock: p.inStock ?? true, quickAdd: true }, p.id));
                                        }) }), totalPages > 1 && (() => {
                                        const buildPageUrl = (page) => {
                                            const qp = new URLSearchParams();
                                            if (page > 1)
                                                qp.set('page', String(page));
                                            if (searchParams.condition)
                                                qp.set('condition', searchParams.condition);
                                            if (searchParams.sort)
                                                qp.set('sort', searchParams.sort);
                                            if (searchParams.minPrice)
                                                qp.set('minPrice', searchParams.minPrice);
                                            if (searchParams.maxPrice)
                                                qp.set('maxPrice', searchParams.maxPrice);
                                            const qs = qp.toString();
                                            return `/brands/${slug}${qs ? `?${qs}` : ''}`;
                                        };
                                        // Generate visible page numbers with ellipsis
                                        const getPageNumbers = () => {
                                            const pages = [];
                                            if (totalPages <= 7) {
                                                for (let i = 1; i <= totalPages; i++)
                                                    pages.push(i);
                                            }
                                            else {
                                                pages.push(1);
                                                if (currentPage > 3)
                                                    pages.push('...');
                                                const start = Math.max(2, currentPage - 1);
                                                const end = Math.min(totalPages - 1, currentPage + 1);
                                                for (let i = start; i <= end; i++)
                                                    pages.push(i);
                                                if (currentPage < totalPages - 2)
                                                    pages.push('...');
                                                pages.push(totalPages);
                                            }
                                            return pages;
                                        };
                                        const from = (currentPage - 1) * limit + 1;
                                        const to = Math.min(currentPage * limit, total);
                                        return (_jsxs("div", { className: "mt-10 flex flex-col items-center gap-4", children: [_jsxs("p", { className: "text-xs text-surface-400", children: ["Showing ", from, "\u2013", to, " of ", total, " products"] }), _jsxs("nav", { className: "inline-flex items-center gap-1.5", "aria-label": "Pagination", children: [_jsxs("a", { href: currentPage > 1 ? buildPageUrl(currentPage - 1) : '#', className: `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${currentPage > 1
                                                                ? 'bg-white text-surface-700 border border-surface-200 hover:border-primary/40 hover:text-primary hover:shadow-sm active:scale-[0.97]'
                                                                : 'bg-surface-50 text-surface-300 border border-surface-100 cursor-not-allowed'}`, "aria-disabled": currentPage <= 1, tabIndex: currentPage <= 1 ? -1 : undefined, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Prev"] }), _jsx("div", { className: "hidden sm:flex items-center gap-1", children: getPageNumbers().map((page, i) => page === '...' ? (_jsx("span", { className: "px-2 py-2 text-sm text-surface-400 select-none", children: "\u2026" }, `ellipsis-${i}`)) : (_jsx("a", { href: buildPageUrl(page), className: `inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-semibold transition-all ${page === currentPage
                                                                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                                                                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 active:scale-[0.97]'}`, "aria-current": page === currentPage ? 'page' : undefined, children: page }, page))) }), _jsxs("span", { className: "sm:hidden text-sm text-surface-500 font-medium px-2", children: ["Page ", currentPage, " of ", totalPages] }), _jsxs("a", { href: currentPage < totalPages ? buildPageUrl(currentPage + 1) : '#', className: `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${currentPage < totalPages
                                                                ? 'bg-white text-surface-700 border border-surface-200 hover:border-primary/40 hover:text-primary hover:shadow-sm active:scale-[0.97]'
                                                                : 'bg-surface-50 text-surface-300 border border-surface-100 cursor-not-allowed'}`, "aria-disabled": currentPage >= totalPages, tabIndex: currentPage >= totalPages ? -1 : undefined, children: ["Next", _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] })] }));
                                    })()] })), products.length > 0 && (_jsxs("div", { className: "mt-16 p-6 bg-white rounded-2xl border border-surface-100", children: [_jsxs("h2", { className: "text-lg font-bold text-surface-900 mb-2", children: ["Buy Certified Pre-Owned ", brand.name, " Phones"] }), _jsxs("p", { className: "text-sm text-surface-500 leading-relaxed", children: ["Browse our collection of quality-checked ", brand.name, " smartphones at the best prices. Every device undergoes a rigorous 20-point inspection, comes with a 6-month warranty, free delivery, and 7-day return policy. Whether you are looking for the latest ", brand.name, " flagship or a budget-friendly option, Dream Gadgets has you covered."] })] }))] })] }), _jsx(BrandOfferBanner, {})] }));
}
//# sourceMappingURL=page.js.map