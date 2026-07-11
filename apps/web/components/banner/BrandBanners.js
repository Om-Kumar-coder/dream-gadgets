'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { usePromotionalBanners } from '@/lib/bannerService';
import { MidPageBanner } from './MidPageBanner';
import { OfferBanner } from './OfferBanner';
import { Loader2 } from 'lucide-react';
/**
 * Mid-page promotional banner for brand pages.
 * Renders between the brand hero and the product listing.
 */
export function BrandPromoBanner() {
    const { data, isLoading, isError } = usePromotionalBanners();
    if (isLoading) {
        return (_jsx("div", { className: "max-w-7xl mx-auto px-4 mt-6 mb-2", children: _jsx("div", { className: "h-[120px] rounded-2xl bg-surface-100 animate-pulse flex items-center justify-center", children: _jsx(Loader2, { className: "w-5 h-5 text-surface-400 animate-spin" }) }) }));
    }
    if (isError || !data)
        return null;
    const { middle } = data;
    if (middle.length === 0)
        return null;
    // Use single variant for brand mid-page banner
    return (_jsx("div", { className: "max-w-7xl mx-auto px-4 mt-6 mb-2", children: _jsx(MidPageBanner, { banners: middle, variant: "single" }) }));
}
/**
 * Offer banner for brand pages.
 * Renders at the bottom after the product grid / SEO section.
 */
export function BrandOfferBanner() {
    const { data, isLoading, isError } = usePromotionalBanners();
    if (isLoading || isError || !data)
        return null;
    const { offer } = data;
    if (offer.length === 0)
        return null;
    return (_jsx("div", { className: "max-w-7xl mx-auto px-4 mt-8 mb-8", children: _jsx(OfferBanner, { banners: offer }) }));
}
//# sourceMappingURL=BrandBanners.js.map