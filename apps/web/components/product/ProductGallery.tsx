'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);

  const mainImage = images[selectedIndex] || '/images/placeholders/no-image.svg';

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedIndex < images.length - 1) {
        setSelectedIndex(i => i + 1);
      } else if (diff < 0 && selectedIndex > 0) {
        setSelectedIndex(i => i - 1);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div
        ref={imageRef}
        className="relative aspect-square rounded-2xl overflow-hidden bg-surface-100 cursor-crosshair group"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={mainImage}
          alt={`${name} - Image ${selectedIndex + 1}`}
          fill
          className={`object-cover transition-transform duration-200 ${
            zoom ? 'scale-150' : 'scale-100'
          }`}
          style={
            zoom
              ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
              : undefined
          }
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholders/no-image.svg';
          }}
        />

        {/* Shadow overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(i => Math.max(0, i - 1))}
              disabled={selectedIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 hover:bg-white backdrop-blur-sm"
            >
              <svg className="w-5 h-5 text-surface-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedIndex(i => Math.min(images.length - 1, i + 1))}
              disabled={selectedIndex === images.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 hover:bg-white backdrop-blur-sm"
            >
              <svg className="w-5 h-5 text-surface-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {selectedIndex + 1} / {images.length || 1}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden bg-surface-100 shrink-0 border-2 transition-all ${
                i === selectedIndex
                  ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-sm'
                  : 'border-transparent hover:border-surface-300 opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={url}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholders/no-image.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile swipe hint */}
      <p className="text-xs text-surface-400 text-center md:hidden">
        ← Swipe to navigate →
      </p>
    </div>
  );
}
