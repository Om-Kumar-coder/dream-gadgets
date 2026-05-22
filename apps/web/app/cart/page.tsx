'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '../../store/cart.store';
import { ErrorBoundary } from '../../components/ErrorBoundary';

function DeliveryEstimate(): string {
  const now = new Date();
  const day = now.getDay();
  // Estimate delivery in 3-5 business days
  let daysToAdd = day >= 5 ? 5 : 3;
  const est = new Date(now);
  est.setDate(est.getDate() + daysToAdd);
  return est.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function CartSavingsBanner({ savings }: { savings: number }) {
  if (savings <= 0) return null;
  return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
      <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-emerald-700 font-medium">
        You&apos;re saving <strong>₹{savings.toLocaleString('en-IN')}</strong> on this order!
      </p>
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const cartTotal = total();
  const count = itemCount();
  const savings = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const original = item.originalPrice ? Number(item.originalPrice) : price;
    return sum + (original - price) * (item.quantity || 1);
  }, 0);
  const deliveryDate = DeliveryEstimate();

  if (!items.length) {
    return (
      <ErrorBoundary>
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Looks like you haven&apos;t added anything yet.<br />
            Browse our collection of certified phones and find the perfect device.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Products
          </Link>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-sm text-gray-500 mt-0.5">{count} item{count !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Cart Items ── */}
            <div className="lg:col-span-2 space-y-3">
              <CartSavingsBanner savings={savings} />

              {items.map((item) => {
                if (!item || (!item.id && !item.imei)) return null;
                const price = Number(item.price) || 0;
                const qty = item.quantity || 1;
                const lineTotal = price * qty;
                const src = item.imageUrl || '/fallback.png';
                const originalPrice = item.originalPrice ? Number(item.originalPrice) : null;

                return (
                  <div
                    key={item.id}
                    className="group flex gap-4 p-4 sm:p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                      <img
                        src={src}
                        alt={item.name || 'Product'}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.src = '/fallback.png'; }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-sm sm:text-base font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name || 'Unknown Product'}
                      </Link>
                      {item.imei && (
                        <p className="text-xs text-gray-400 mt-0.5">IMEI: {item.imei.slice(0, 8)}*****</p>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-lg font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</p>
                        {originalPrice && originalPrice > price && (
                          <p className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => qty > 1 ? updateQuantity(item.id, qty - 1) : removeItem(item.id)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 font-bold text-lg"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <div className="w-9 h-9 flex items-center justify-center bg-white font-semibold text-sm text-gray-900 border-x border-gray-100">
                            {qty}
                          </div>
                          <button
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 font-bold text-lg"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Line Total (Desktop) */}
                    <div className="hidden sm:flex flex-col items-end justify-between">
                      <span className="text-base font-bold text-gray-900">₹{lineTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 sticky top-28 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal ({count} items)</span>
                    <span className="font-semibold text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Total Savings</span>
                      <span className="font-semibold">-₹{savings.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Free delivery by <strong>{deliveryDate}</strong>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-extrabold text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Promo code */}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                      disabled={promoApplied}
                    />
                    <button
                      onClick={() => { if (promoCode.trim()) setPromoApplied(true); }}
                      disabled={promoApplied || !promoCode.trim()}
                      className="px-4 py-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {promoApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Promo code applied!
                    </p>
                  )}
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
                >
                  Proceed to Checkout
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                {/* Trust badges */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Secure checkout via Razorpay
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    30-day easy returns
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Free doorstep delivery
                  </div>
                </div>

                {/* Payment methods */}
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-medium text-gray-500 border border-gray-100">Visa</span>
                  <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-medium text-gray-500 border border-gray-100">MC</span>
                  <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-medium text-gray-500 border border-gray-100">UPI</span>
                  <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-medium text-gray-500 border border-gray-100">Net Banking</span>
                  <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-medium text-gray-500 border border-gray-100">EMI</span>
                </div>
              </div>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-white active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
