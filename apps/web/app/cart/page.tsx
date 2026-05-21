'use client';
import Link from 'next/link';
import { useCartStore } from '../../store/cart.store';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCartStore();
  const cartTotal = total();
  const count = itemCount();

  if (!items.length) {
    return (
      <ErrorBoundary>
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          {/* Empty Cart Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center">
              <svg className="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-gray-900">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Looks like you haven&apos;t added anything yet.<br />
            Browse our collection of certified phones and find the perfect device.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-500 mt-1">{count} item{count !== 1 ? 's' : ''} in your cart</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              if (!item || (!item.id && !item.imei)) return null;
              const price = Number(item.price) || 0;
              const qty = item.quantity || 1;
              const lineTotal = price * qty;
              const src = item.imageUrl || '/fallback.png';

              return (
                <div
                  key={item.id}
                  className="group flex gap-4 p-4 sm:p-5 border border-gray-100 rounded-xl bg-white hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-gray-50">
                    <img
                      src={src}
                      alt={item.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = '/fallback.png'; }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm sm:text-base font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.name || 'Unknown Product'}
                    </Link>
                    {item.imei && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        IMEI: {item.imei.slice(0, 8)}*****
                      </p>
                    )}
                    <p className="text-base sm:text-lg font-bold text-gray-900 mt-1.5">
                      ₹{price.toLocaleString('en-IN')}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => qty > 1 ? updateQuantity(item.id, qty - 1) : removeItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 font-bold"
                        >
                          −
                        </button>
                        <div className="w-8 h-8 flex items-center justify-center bg-white font-semibold text-sm text-gray-900 border-x border-gray-100">
                          {qty}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, qty + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 font-bold"
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
                    <span className="text-sm font-bold text-gray-900">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="border border-gray-100 rounded-2xl p-6 bg-white sticky top-24 shadow-sm">
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

              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Proceed to Checkout
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure checkout &bull; Free returns
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
