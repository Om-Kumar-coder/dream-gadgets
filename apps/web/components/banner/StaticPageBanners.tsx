'use client';

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

  if (isLoading || isError || !data) return null;

  const { offer } = data;
  if (offer.length === 0) return null;

  return (
    <div className="mb-14 md:mb-20">
      <OfferBanner banners={offer} />
    </div>
  );
}

/**
 * Promotional mid-page banner for static pages.
 * Renders between content sections.
 */
export function StaticMidBanner() {
  const { data, isLoading, isError } = usePromotionalBanners();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="h-[100px] rounded-2xl bg-surface-100 animate-pulse flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-surface-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (isError || !data) return null;

  const { middle } = data;
  if (middle.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <MidPageBanner banners={middle} variant="single" />
    </div>
  );
}
