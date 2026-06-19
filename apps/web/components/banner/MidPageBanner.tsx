'use client';

import Link from 'next/link';
import { Banner, getBannerImage, getBannerHref, trackBannerClick, getDeviceType } from '@/lib/bannerService';
import { ScrollReveal } from '../ui/ScrollReveal';

interface MidPageBannerProps {
  banners: Banner[];
  variant?: 'single' | 'grid';
  className?: string;
}

export function MidPageBanner({
  banners,
  variant = 'single',
  className = '',
}: MidPageBannerProps) {
  if (!banners || banners.length === 0) return null;

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 ${className}`}>
        {banners.slice(0, 2).map((banner) => (
          <BannerCard key={banner.id} banner={banner} />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {banners.slice(0, 1).map((banner) => (
        <BannerCard key={banner.id} banner={banner} prominent />
      ))}
    </div>
  );
}

function BannerCard({
  banner,
  prominent = false,
}: {
  banner: Banner;
  prominent?: boolean;
}) {
  const imgUrl = getBannerImage(banner);
  const href = getBannerHref(banner);

  const handleClick = () => {
    trackBannerClick(banner.id);
  };

  return (
    <ScrollReveal>
      <Link
        href={href}
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-2xl bg-surface-900 border border-surface-800 flex items-center ${
          prominent ? 'min-h-[200px] md:min-h-[280px]' : 'min-h-[160px] md:min-h-[220px]'
        } hover:shadow-elevation-3 hover:-translate-y-0.5 transition-all duration-300`}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={imgUrl}
            alt={banner.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              prominent ? '' : ''
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-950/85 via-surface-950/50 to-transparent" />
        </div>
        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 max-w-lg">
          {banner.subtitle && (
            <p className="text-xs md:text-sm text-primary font-semibold mb-1.5 uppercase tracking-wider">
              {banner.subtitle}
            </p>
          )}
          <h3
            className={`font-bold text-white leading-tight ${
              prominent ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
            }`}
          >
            {banner.title}
          </h3>
          {banner.ctaText && (
            <span className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-semibold group-hover:gap-2.5 transition-all">
              {banner.ctaText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </Link>
    </ScrollReveal>
  );
}
