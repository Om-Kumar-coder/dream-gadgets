'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '../../store/cart.store';

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  condition: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  storage?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  inStock?: boolean;
  quickAdd?: boolean;
}

const FALLBACK_IMAGE = '/images/placeholders/no-image.svg';

const CONDITION_BADGES: Record<string, { label: string; color: string; emoji: string }> = {
  SEALED_PACK: { label: 'Sealed Pack', color: 'bg-violet-100 text-violet-700 border-violet-200', emoji: '🎯' },
  OPEN_BOX: { label: 'Open Box', color: 'bg-blue-100 text-blue-700 border-blue-200', emoji: '📦' },
  SUPER_MINT: { label: 'Super Mint', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', emoji: '✨' },
  MINT: { label: 'Mint', color: 'bg-teal-100 text-teal-700 border-teal-200', emoji: '💎' },
  GOOD: { label: 'Good', color: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '👍' },
};

function calculateDiscount(price: number, original?: number): number | null {
  if (!original || original <= price) return null;
  return Math.round((1 - price / original) * 100);
}

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => {
        const fill = rating >= star ? 'text-amber-400' : rating >= star - 0.5 ? 'text-amber-300' : 'text-surface-200';
        return (
          <svg key={star} className={`${sizeClass} ${fill}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

export function ProductCard({
  id, slug, name, condition, price, originalPrice, imageUrl,
  storage, rating = 0, reviewCount = 0, brand, inStock = true, quickAdd = false,
}: ProductCardProps) {
  const src = imageUrl || FALLBACK_IMAGE;
  const conditionInfo = CONDITION_BADGES[condition] || { label: condition, color: 'bg-surface-100 text-surface-600 border-surface-200', emoji: '📱' };
  const discount = calculateDiscount(price, originalPrice);
  const { addItem } = useCartStore();

  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-surface-100/80 overflow-hidden hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-surface-50 to-surface-100 overflow-hidden">
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
        />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${conditionInfo.color} bg-white/90 backdrop-blur-sm shadow-sm`}>
            {conditionInfo.emoji} {conditionInfo.label}
          </span>
        </div>

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-2.5 right-2.5">
            <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              -{discount}%
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-surface-950 text-white text-xs font-semibold px-5 py-2 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover quick add */}
        {quickAdd && inStock && (
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem({ id, imei: id, name, price, slug, imageUrl });
              }}
              className="w-full py-2.5 bg-white/95 backdrop-blur-md text-surface-900 text-xs font-bold rounded-xl shadow-lg border border-surface-200 hover:bg-white active:scale-[0.97] transition-all"
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Cart
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        {/* Brand */}
        {brand && (
          <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{brand}</span>
        )}

        {/* Name */}
        <h3 className="text-sm font-semibold text-surface-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Storage */}
        {storage && (
          <span className="text-[11px] text-surface-400 bg-surface-50 px-2 py-0.5 rounded-full w-fit border border-surface-100 font-medium">
            {storage}
          </span>
        )}

        {/* Rating */}
        {(rating > 0 || reviewCount > 0) && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {rating > 0 && <RatingStars rating={rating} size="xs" />}
            <span className="text-[10px] text-surface-400">
              {reviewCount > 0 ? `(${reviewCount})` : ''}
            </span>
          </div>
        )}

        {/* Price section */}
        <div className="mt-auto pt-2 flex items-baseline gap-2 flex-wrap">
          <span className="text-base font-extrabold text-surface-900">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-surface-400 line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* EMI hint */}
        {price > 10000 && (
          <p className="text-[10px] text-surface-400 mt-0.5">
            No cost EMI from ₹{Math.round(price / 6).toLocaleString('en-IN')}/mo
          </p>
        )}
      </div>
    </Link>
  );
}
