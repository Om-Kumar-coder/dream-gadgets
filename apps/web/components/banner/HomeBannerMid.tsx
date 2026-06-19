'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllBanners } from '@/lib/bannerService';
import { MidPageBanner } from './MidPageBanner';

/**
 * Fetches home banners and renders mid-page banners
 * (for placement after brands carousel)
 */
export function HomeBannerMid() {
  const { data } = useQuery({
    queryKey: ['home-banners'],
    queryFn: () => getAllBanners('home'),
    staleTime: 60 * 1000,
    retry: 2,
  });

  const { middle = [] } = data ?? {};

  if (middle.length === 0) return null;

  return (
    <section className="container-page -mt-6 mb-8">
      <MidPageBanner banners={middle} variant="grid" />
    </section>
  );
}
