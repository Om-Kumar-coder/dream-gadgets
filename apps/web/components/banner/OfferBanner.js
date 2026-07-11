'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { getBannerImage, getBannerHref, trackBannerClick } from '@/lib/bannerService';
export function OfferBanner({ banners, className = '' }) {
    if (!banners || banners.length === 0)
        return null;
    const banner = banners[0];
    const imgUrl = getBannerImage(banner);
    const href = getBannerHref(banner);
    const handleClick = () => {
        trackBannerClick(banner.id);
    };
    return (_jsx("div", { className: className, children: _jsxs(Link, { href: href, onClick: handleClick, className: "group relative overflow-hidden rounded-3xl bg-gradient-hero-alt border border-white/5 min-h-[200px] md:min-h-[300px] flex items-center justify-center", children: [imgUrl && (_jsxs("div", { className: "absolute inset-0", children: [_jsx("img", { src: imgUrl, alt: banner.title, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-surface-950/80 via-surface-950/40 to-surface-950/20" })] })), _jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" }), _jsxs("div", { className: "relative z-10 text-center p-8 md:p-12 max-w-2xl", children: [banner.subtitle && (_jsx("span", { className: "inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/60 text-xs font-semibold mb-4", children: banner.subtitle })), _jsx("h2", { className: "text-3xl md:text-5xl font-extrabold text-white mb-2", children: banner.title }), banner.ctaText && (_jsxs("span", { className: "inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/25", children: [banner.ctaText, _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })] }))] })] }) }));
}
//# sourceMappingURL=OfferBanner.js.map