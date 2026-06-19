'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllBanners } from '@/lib/bannerService';
import { OfferBanner } from './OfferBanner';

/**
 * Fetches home banners and renders the offer banner
 * (for placement at bottom, replacing the static app banner)
 */
export function HomeBannerOffer() {
  const { data } = useQuery({
    queryKey: ['home-banners'],
    queryFn: () => getAllBanners('home'),
    staleTime: 60 * 1000,
    retry: 2,
  });

  const { offer = [] } = data ?? {};

  if (offer.length === 0) return null;

  return (
    <section className="container-page mb-14 md:mb-20">
      <OfferBanner banners={offer} />
    </section>
  );
}
