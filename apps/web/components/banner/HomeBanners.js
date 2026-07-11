'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { getAllBanners, getBannerImage } from '@/lib/bannerService';
import { HeroSlider } from './HeroSlider';
import { MidPageBanner } from './MidPageBanner';
import { OfferBanner } from './OfferBanner';
import { Loader2 } from 'lucide-react';
export function HomeBanners() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['home-banners'],
        queryFn: () => getAllBanners('home'),
        staleTime: 60 * 1000, // 1 minute
        retry: 2,
    });
    if (isLoading) {
        return (_jsx("section", { className: "relative bg-gradient-hero overflow-hidden", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 py-10 md:py-16", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2 min-h-[320px] md:min-h-[400px] rounded-3xl bg-surface-900/50 animate-pulse flex items-center justify-center", children: _jsx(Loader2, { className: "w-8 h-8 text-surface-600 animate-spin" }) }), _jsx("div", { className: "min-h-[320px] md:min-h-[400px] rounded-3xl bg-surface-900/30 animate-pulse" })] }) }) }));
    }
    if (isError || !data) {
        // Fallback to a minimal default hero section
        return (_jsx("section", { className: "relative bg-gradient-hero overflow-hidden", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 py-10 md:py-16", children: _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: _jsx("div", { className: "lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-surface-950 border border-white/5 min-h-[320px] md:min-h-[400px] flex items-center", children: _jsxs("div", { className: "relative z-10 p-8 md:p-12 lg:p-16", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs font-semibold mb-5", children: [_jsx("span", { className: "w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft" }), "Dream Gadgets"] }), _jsxs("h1", { className: "text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4", children: ["Premium Phones", _jsx("br", {}), _jsx("span", { className: "text-gradient-brand", children: "Best Prices" })] }), _jsx("p", { className: "text-lg text-white/60 mb-6 max-w-lg", children: "Certified pre-owned smartphones with warranty, quality checked, and delivered to your doorstep." })] }) }) }) }) }));
    }
    const { slider, middle, bottom, offer } = data;
    return (_jsxs(_Fragment, { children: [_jsx("section", { className: "relative bg-gradient-hero overflow-hidden", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 py-10 md:py-16", children: _jsxs("div", { className: `grid grid-cols-1 gap-6 ${bottom.length > 0 ? 'lg:grid-cols-3' : ''}`, children: [_jsx("div", { className: bottom.length > 0 ? 'lg:col-span-2' : '', children: _jsx(HeroSlider, { banners: slider, autoPlayInterval: 5000 }) }), bottom.length > 0 && (_jsx(LastSoldCard, { banner: bottom[0] }))] }) }) }), middle.length > 0 && (_jsx("section", { className: "container-page -mt-6 mb-8", children: _jsx(MidPageBanner, { banners: middle, variant: "grid" }) })), offer.length > 0 && (_jsx("section", { className: "container-page mb-14 md:mb-20", children: _jsx(OfferBanner, { banners: offer }) }))] }));
}
function LastSoldCard({ banner }) {
    const imgUrl = getBannerImage(banner);
    return (_jsx("div", { className: "relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/5 min-h-[320px] md:min-h-[400px] flex items-center", children: _jsxs("div", { className: "p-6 md:p-8 w-full", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full text-amber-400 text-xs font-semibold mb-4", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }) }), banner.subtitle || 'Featured'] }), _jsx("p", { className: "text-xs text-white/40 uppercase tracking-wider font-semibold mb-1", children: banner.title }), _jsxs("div", { className: "flex flex-col items-center text-center py-4", children: [_jsx("div", { className: "w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5 overflow-hidden", children: imgUrl ? (_jsx("img", { src: imgUrl, alt: banner.title, className: "w-full h-full object-contain p-3" })) : (_jsxs("svg", { className: "w-16 h-16 text-white/10", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", ry: "2" }), _jsx("line", { x1: "12", y1: "18", x2: "12.01", y2: "18" })] })) }), banner.ctaText && (_jsx("span", { className: "inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/25", children: banner.ctaText }))] })] }) }));
}
//# sourceMappingURL=HomeBanners.js.map