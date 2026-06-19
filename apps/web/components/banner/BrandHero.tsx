'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface BrandHeroData {
  imageUrl: string | null;
}

interface DynamicBrandHeroProps {
  slug: string;
  brandName: string;
  brandLogo: string;
  totalProducts: number;
}

export function DynamicBrandHero({
  slug,
  brandName,
  brandLogo,
  totalProducts,
}: DynamicBrandHeroProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['brand-hero', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/public/brand-hero/${slug}`);
      return (data.data || data) as BrandHeroData;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const heroImageUrl = data?.imageUrl;

  return (
    <section
      className={`relative overflow-hidden min-h-[300px] md:min-h-[400px] flex items-center ${
        heroImageUrl
          ? 'bg-surface-950'
          : 'bg-gradient-to-br from-surface-950 via-surface-900 to-primary/20'
      }`}
    >
      {/* Hero Background Image */}
      {heroImageUrl && (
        <div className="absolute inset-0">
          <img
            src={heroImageUrl}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          {/* Dark overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface-950/85 via-surface-950/50 to-surface-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950/60 to-transparent" />
        </div>
      )}

      {/* Loading overlay while fetching hero */}
      {isLoading && !heroImageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
        </div>
      )}

      {/* Giant brand watermark background (visible if no hero image) */}
      {!heroImageUrl && (
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none">
          <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] -mr-20 md:-mr-32 opacity-[0.06] md:opacity-[0.08]">
            <img
              src={brandLogo}
              alt=""
              className="w-full h-full object-contain"
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* Gradient edge fades */}
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-surface-950/80 via-surface-950/40 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-surface-950/60 to-transparent pointer-events-none" />

      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center gap-6 md:gap-10">
          {/* Brand Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center p-4 shrink-0 shadow-xl ring-1 ring-white/5">
            <img
              src={brandLogo}
              alt={brandName}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Brand Info */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-white/40 mb-3">
              <Link href="/" className="hover:text-white/70 transition-colors font-medium">Home</Link>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white/70 font-medium">{brandName}</span>
            </nav>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {brandName} Phones
            </h1>
            <p className="text-white/50 text-sm md:text-base mt-2 max-w-xl">
              {totalProducts} certified pre-owned {brandName} smartphone{totalProducts !== 1 ? 's' : ''} available. Quality checked with warranty.
            </p>

            {/* Quick action links */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href="/products"
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 border border-white/10 hover:bg-white/20 hover:text-white transition-all"
              >
                All Brands
              </Link>
              <Link
                href="/sell"
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 border border-white/10 hover:bg-white/20 hover:text-white transition-all"
              >
                Sell {brandName}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
