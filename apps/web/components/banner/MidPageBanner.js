'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { getBannerImage, getBannerHref, trackBannerClick } from '@/lib/bannerService';
import { ScrollReveal } from '../ui/ScrollReveal';
export function MidPageBanner({ banners, variant = 'single', className = '', }) {
    if (!banners || banners.length === 0)
        return null;
    if (variant === 'grid') {
        return (_jsx("div", { className: `grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 ${className}`, children: banners.slice(0, 2).map((banner) => (_jsx(BannerCard, { banner: banner }, banner.id))) }));
    }
    return (_jsx("div", { className: `space-y-4 md:space-y-6 ${className}`, children: banners.slice(0, 1).map((banner) => (_jsx(BannerCard, { banner: banner, prominent: true }, banner.id))) }));
}
function BannerCard({ banner, prominent = false, }) {
    const imgUrl = getBannerImage(banner);
    const href = getBannerHref(banner);
    const handleClick = () => {
        trackBannerClick(banner.id);
    };
    return (_jsx(ScrollReveal, { children: _jsxs(Link, { href: href, onClick: handleClick, className: `group relative overflow-hidden rounded-2xl bg-surface-900 border border-surface-800 flex items-center ${prominent ? 'min-h-[200px] md:min-h-[280px]' : 'min-h-[160px] md:min-h-[220px]'} hover:shadow-elevation-3 hover:-translate-y-0.5 transition-all duration-300`, children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("img", { src: imgUrl, alt: banner.title, className: `w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${prominent ? '' : ''}` }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-surface-950/85 via-surface-950/50 to-transparent" })] }), _jsxs("div", { className: "relative z-10 p-6 md:p-8 max-w-lg", children: [banner.subtitle && (_jsx("p", { className: "text-xs md:text-sm text-primary font-semibold mb-1.5 uppercase tracking-wider", children: banner.subtitle })), _jsx("h3", { className: `font-bold text-white leading-tight ${prominent ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`, children: banner.title }), banner.ctaText && (_jsxs("span", { className: "inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-semibold group-hover:gap-2.5 transition-all", children: [banner.ctaText, _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] }))] })] }) }));
}
//# sourceMappingURL=MidPageBanner.js.map