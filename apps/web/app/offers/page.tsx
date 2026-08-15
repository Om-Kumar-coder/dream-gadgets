'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllBanners } from '../../lib/bannerService';
import { HeroSlider } from '../../components/banner/HeroSlider';
import { MidPageBanner } from '../../components/banner/MidPageBanner';
import { OfferBanner } from '../../components/banner/OfferBanner';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function OffersPage() {
  const home = useQuery({
    queryKey: ['offers-home-banners'],
    queryFn: () => getAllBanners('home'),
    staleTime: 60 * 1000,
    retry: 2,
  });
  const promo = useQuery({
    queryKey: ['offers-promo-banners'],
    queryFn: () => getAllBanners('promotional'),
    staleTime: 60 * 1000,
    retry: 2,
  });

  const loading = home.isLoading || promo.isLoading;
  const slider = home.data?.slider ?? [];
  const middle = [...(home.data?.middle ?? []), ...(promo.data?.middle ?? [])];
  const offer = [...(home.data?.offer ?? []), ...(promo.data?.offer ?? [])];
  const empty = !loading && slider.length === 0 && middle.length === 0 && offer.length === 0;

  return (
    <main className="animate-fade-in">
      <section className="text-white py-14 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Offers & Deals</h1>
          <p className="text-white/70">All the current promotions from Dream Gadgets, in one place</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 space-y-10">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 text-surface-400 animate-spin" />
          </div>
        )}

        {empty && (
          <div className="text-center py-20">
            <p className="text-lg font-bold text-surface-700 mb-2">No active offers right now</p>
            <p className="text-sm text-surface-400 mb-6">New offers land soon — check our hot deals in the meantime.</p>
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/25"
            >
              View Hot Deals
            </Link>
          </div>
        )}

        {slider.length > 0 && (
          <div>
            <h2 className="heading-sm text-surface-900 mb-4">Featured</h2>
            <HeroSlider banners={slider} autoPlayInterval={6000} />
          </div>
        )}

        {middle.length > 0 && (
          <div>
            <h2 className="heading-sm text-surface-900 mb-4">Shop Offers</h2>
            <MidPageBanner banners={middle} variant="grid" />
          </div>
        )}

        {offer.length > 0 && (
          <div>
            <h2 className="heading-sm text-surface-900 mb-4">Exclusive Offers</h2>
            <OfferBanner banners={offer} />
          </div>
        )}
      </section>
    </main>
  );
}
