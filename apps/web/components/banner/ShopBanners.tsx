'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllBanners } from '@/lib/bannerService';
import { HeroSlider } from './HeroSlider';
import { OfferBanner } from './OfferBanner';
import { Loader2 } from 'lucide-react';

export function ShopBannerSlider() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shop-banners'],
    queryFn: () => getAllBanners('shop'),
    staleTime: 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="bg-white border-b border-surface-100/80">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="min-h-[200px] md:min-h-[260px] rounded-2xl bg-surface-100 animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-surface-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) return null;

  const { slider } = data;
  if (slider.length === 0) return null;

  return (
    <div className="bg-white border-b border-surface-100/80">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <HeroSlider banners={slider} autoPlayInterval={5000} />
      </div>
    </div>
  );
}

export function ShopBannerOffer() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shop-banners'],
    queryFn: () => getAllBanners('shop'),
    staleTime: 60 * 1000,
    retry: 2,
  });

  if (isLoading || isError || !data) return null;

  const { offer } = data;
  if (offer.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8 mb-8">
      <OfferBanner banners={offer} />
    </div>
  );
}
