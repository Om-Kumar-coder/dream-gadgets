'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist, onWishlistChange, type WishlistItem } from '../../lib/wishlist';

function formatPrice(n: number): string {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getWishlist());
    setMounted(true);
    return onWishlistChange(() => setItems(getWishlist()));
  }, []);

  const total = items.reduce((sum, i) => sum + Number(i.price || 0), 0);

  return (
    <main className="animate-fade-in">
      {/* Hero */}
      <section className="text-white py-14 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">My Wishlist</h1>
          <p className="text-white/70">Phones you&apos;ve saved — grab them before they&apos;re gone</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {mounted && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-28 h-28 bg-surface-100 rounded-full flex items-center justify-center mb-5">
              <svg className="w-12 h-12 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-surface-700 mb-1.5">Your wishlist is empty</p>
            <p className="text-sm text-surface-400 mb-6 max-w-xs">
              Tap the ♥ on any product to save it here for later.
            </p>
            <Link
              href="/products"
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-md shadow-primary/25"
            >
              Browse Phones
            </Link>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-surface-500">
                  {items.length} item{items.length !== 1 ? 's' : ''} saved
                </p>
                <p className="text-sm text-surface-500">
                  Total value{' '}
                  <span className="font-extrabold text-surface-900">{formatPrice(total)}</span>
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {items.map(item => {
                const originalPrice = item.originalPrice && item.originalPrice > item.price
                  ? item.originalPrice
                  : undefined;
                return (
                  <div
                    key={item.id}
                    className="group relative bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    <Link href={`/products/${item.id}`} className="block">
                      <div className="relative aspect-square bg-gradient-to-br from-surface-50 to-surface-100 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-14 h-14 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                              <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30 hover:opacity-90 transition-all active:scale-90"
                      aria-label="Remove from wishlist"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="p-4 flex-1 flex flex-col">
                      {item.condition && (
                        <span className="inline-block text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-full mb-2 capitalize w-fit">
                          {String(item.condition).replace(/_/g, ' ')}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-surface-900 line-clamp-2 leading-snug mb-2">
                        {item.name}
                      </h3>
                      <div className="mt-auto flex items-baseline gap-2">
                        <span className="font-extrabold text-surface-900 text-base">
                          {formatPrice(item.price)}
                        </span>
                        {originalPrice && (
                          <span className="text-surface-400 line-through text-xs">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/products/${item.id}`}
                        className="mt-3 w-full py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl text-center hover:bg-primary hover:text-white transition-all active:scale-[0.97]"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
