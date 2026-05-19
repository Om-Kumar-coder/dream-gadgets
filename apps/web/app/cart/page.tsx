'use client';
import Link from 'next/link';
import { useCartStore } from '../../store/cart.store';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export default function CartPage() {
  const cart = useCartStore();
  const items = cart?.items ?? [];
  const removeItem = cart?.removeItem ?? (() => undefined);
  const total = cart?.total ?? (() => 0);

  console.log('CART STATE:', cart);

  if (!items.length) {
    return (
      <ErrorBoundary>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Browse our collection and add phones to your cart.</p>
          <Link href="/products" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium">
            Shop Now
          </Link>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {(items || []).map((item) => {
              if (!item || (!item.id && !item.imei) || Number(item.price) === 0) return null;
              const key = item.id || item.imei;
              const price = Number(item.price) || 0;
              const imeiLabel = item?.imei ? item.imei.slice(0, 8) : '--------';
              const src = item?.imageUrl || '/fallback.png';

              return (
                <div key={key} className="flex gap-4 p-4 border rounded-xl bg-white">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={src}
                      alt={item?.name || 'Product'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/fallback.png'; }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item?.name || 'Unknown Product'}</h3>
                    <p className="text-xs text-muted-foreground mt-1">IMEI: {imeiLabel}*****</p>
                    <p className="text-lg font-bold mt-2">₹{price.toLocaleString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!item?.id) return;
                      removeItem(item.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border rounded-xl p-6 bg-white h-fit">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{total().toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Free</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span><span>₹{total().toLocaleString('en-IN')}</span></div>
            </div>
            <Link
              href="/checkout"
              className="mt-4 block w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium text-center hover:opacity-90"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
