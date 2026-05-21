'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cart.store';
import { apiClient } from '../../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  async function handleCheckout() {
    setLoading(true);
    setError('');
    try {
      // Create order
      const { data: orderRes } = await apiClient.post('/public/orders', {
        items: items.map(i => ({ itemId: i.id, unitPrice: i.price })),
        shippingAddress: address,
        totalAmount: total(),
      });
      // Unwrap TransformInterceptor response: { status, data: order } or { status, data: { data: order } }
      const order = orderRes?.data?.data ?? orderRes?.data ?? orderRes;

      // Create Razorpay order
      const { data: rzpRes } = await apiClient.post('/payments/razorpay/order', {
        amount: total() * 100, // paise
        receipt: order.orderNumber,
      });

      // Load Razorpay script and open checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: total() * 100,
          currency: 'INR',
          order_id: rzpRes.data.orderId,
          name: 'Dream Gadgets',
          description: 'Phone Purchase',
          handler: async (response: any) => {
            clearCart();
            router.push(`/orders/${order.id}?payment=success`);
          },
          prefill: { name: address.name, contact: address.phone },
          theme: { color: '#E50914' },
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-4">Shipping Address</h2>
          <div className="space-y-3">
            {[
              { key: 'name', label: 'Full Name', type: 'text' },
              { key: 'phone', label: 'Phone Number', type: 'tel' },
              { key: 'street', label: 'Street Address', type: 'text' },
              { key: 'city', label: 'City', type: 'text' },
              { key: 'state', label: 'State', type: 'text' },
              { key: 'pincode', label: 'Pincode', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium">{f.label}</label>
                <input
                  type={f.type}
                  value={(address as any)[f.key]}
                  onChange={e => setAddress(p => ({ ...p, [f.key]: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="border rounded-xl p-4 space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="truncate flex-1 mr-2">{item.name}</span>
                <span className="font-medium">₹{item.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>₹{total().toLocaleString('en-IN')}</span>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-4 w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ₹${total().toLocaleString('en-IN')}`}
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">Secured by Razorpay</p>
        </div>
      </div>
    </div>
  );
}
