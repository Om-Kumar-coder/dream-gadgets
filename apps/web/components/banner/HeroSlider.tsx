'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Banner, getBannerImage, getBannerHref, trackBannerClick } from '@/lib/bannerService';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface HeroSliderProps {
  banners: Banner[];
  autoPlayInterval?: number;
  className?: string;
}

export function HeroSlider({
  banners,
  autoPlayInterval = 5000,
  className = '',
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const len = banners.length;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(((index % len) + len) % len);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [len, isTransitioning]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (len <= 1 || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [len, isPaused, next, autoPlayInterval]);

  if (!banners || len === 0) return null;

  const banner = banners[current];
  const imgUrl = getBannerImage(banner);
  const href = getBannerHref(banner);

  const handleClick = () => {
    trackBannerClick(banner.id);
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-surface-950 border border-white/5 min-h-[320px] md:min-h-[400px] flex items-center group ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={imgUrl}
          alt={banner.title}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950/90 via-surface-950/60 to-surface-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12 lg:p-16 w-full">
        <Link href={href} onClick={handleClick} className="block">
          {banner.subtitle && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs font-semibold mb-5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft" />
              {banner.subtitle}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4">
            {banner.title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < banner.title.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h1>
          {banner.ctaText && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/30">
              {banner.ctaText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Arrows */}
      {len > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {/* Dots */}
        {len > 1 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? 'bg-white w-6'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Pause/Play */}
        {len > 1 && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-all"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
