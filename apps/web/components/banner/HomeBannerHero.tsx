'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllBanners, getBannerImage } from '@/lib/bannerService';
import { HeroSlider } from './HeroSlider';
import { Loader2 } from 'lucide-react';

export function HomeBannerHero() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['home-banners'],
    queryFn: () => getAllBanners('home'),
    staleTime: 60 * 1000,
    retry: 2,
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 min-h-[320px] md:min-h-[400px] rounded-3xl bg-surface-900/50 animate-pulse flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-surface-600 animate-spin" />
            </div>
            <div className="min-h-[320px] md:min-h-[400px] rounded-3xl bg-surface-900/30 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // Error or no data — show fallback static hero
  if (isError || !data || (data.slider.length === 0 && data.bottom.length === 0)) {
    return (
      <section className="relative bg-gradient-hero overflow-hidden">
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-neon-amber/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Hero Banner */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-surface-950 border border-white/5 min-h-[320px] md:min-h-[400px] flex items-center">
              <div className="absolute inset-0 noise-bg" />
              <div className="relative z-10 p-8 md:p-12 lg:p-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs font-semibold mb-5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft" />
                  Certified & Verified
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4">
                  Premium Phones
                  <br />
                  <span className="text-gradient-brand">Best Prices</span>
                </h1>
                <p className="text-lg text-white/60 mb-6 max-w-lg">
                  Certified pre-owned smartphones with warranty, quality checked, and delivered to your doorstep.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/30"
                  >
                    Shop Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  <a
                    href="/sell"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm hover:bg-white/20 active:scale-[0.97] transition-all border border-white/10"
                  >
                    Sell Your Phone
                  </a>
                </div>
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-xl font-bold text-white">10K+</p>
                    <p className="text-xs text-white/40">Phones Sold</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">4.8★</p>
                    <p className="text-xs text-white/40">Avg Rating</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">50+</p>
                    <p className="text-xs text-white/40">Cities</p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64">
                <div className="w-full h-full rounded-full border border-white/5" />
                <div className="absolute inset-4 rounded-full border border-white/5" />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
              </div>
            </div>

            {/* Last Sold / Side Card placeholder */}
            <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/5 min-h-[320px] md:min-h-[400px] flex items-center">
              <div className="p-6 md:p-8 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full text-amber-400 text-xs font-semibold mb-4">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Just Sold
                </div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Last Sold Product</p>
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                    <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/25">
                    Shop Now
                  </span>
                </div>
                <a
                  href="/products"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-semibold text-white/80 hover:text-white transition-all"
                >
                  View All Products
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { slider, bottom } = data;

  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-neon-amber/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className={`grid grid-cols-1 gap-6 ${bottom.length > 0 ? 'lg:grid-cols-3' : ''}`}>
          <div className={bottom.length > 0 ? 'lg:col-span-2' : ''}>
            <HeroSlider banners={slider} autoPlayInterval={5000} />
          </div>

          {/* Last Sold / Side Card */}
          {bottom.length > 0 && (
            <LastSoldCard banner={bottom[0]} />
          )}
        </div>
      </div>
    </section>
  );
}

function LastSoldCard({ banner }: { banner: any }) {
  const imgUrl = getBannerImage(banner);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/5 min-h-[320px] md:min-h-[400px] flex items-center">
      <div className="p-6 md:p-8 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full text-amber-400 text-xs font-semibold mb-4">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {banner.subtitle || 'Featured'}
        </div>
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">
          {banner.title}
        </p>

        <div className="flex flex-col items-center text-center py-4">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5 overflow-hidden">
            {imgUrl ? (
              <img src={imgUrl} alt={banner.title} className="w-full h-full object-contain p-3" />
            ) : (
              <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            )}
          </div>
          {banner.ctaText && (
            <span className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/25">
              {banner.ctaText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
