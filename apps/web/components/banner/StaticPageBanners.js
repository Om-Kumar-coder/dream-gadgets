'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { usePromotionalBanners } from '@/lib/bannerService';
import { OfferBanner } from './OfferBanner';
import { MidPageBanner } from './MidPageBanner';
import { Loader2 } from 'lucide-react';
/**
 * Promotional offer banner for static pages (Sell, About, Contact, FAQ).
 * Renders at the bottom of the page.
 */
export function StaticOfferBanner() {
    const { data, isLoading, isError } = usePromotionalBanners();
    if (isLoading || isError || !data)
        return null;
    const { offer } = data;
    if (offer.length === 0)
        return null;
    return (_jsx("div", { className: "mb-14 md:mb-20", children: _jsx(OfferBanner, { banners: offer }) }));
}
/**
 * Promotional mid-page banner for static pages.
 * Renders between content sections.
 */
export function StaticMidBanner() {
    const { data, isLoading, isError } = usePromotionalBanners();
    if (isLoading) {
        return (_jsx("div", { className: "max-w-7xl mx-auto px-4 py-4", children: _jsx("div", { className: "h-[100px] rounded-2xl bg-surface-100 animate-pulse flex items-center justify-center", children: _jsx(Loader2, { className: "w-5 h-5 text-surface-400 animate-spin" }) }) }));
    }
    if (isError || !data)
        return null;
    const { middle } = data;
    if (middle.length === 0)
        return null;
    return (_jsx("div", { className: "max-w-7xl mx-auto px-4 py-6", children: _jsx(MidPageBanner, { banners: middle, variant: "single" }) }));
}
//# sourceMappingURL=StaticPageBanners.js.map