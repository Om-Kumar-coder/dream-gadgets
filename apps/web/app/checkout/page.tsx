'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '../../store/cart.store';
import { apiClient } from '../../lib/api';

type Step = 'address' | 'review' | 'payment';

interface AddressForm {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface FieldErrors {
  [key: string]: string;
}

function validateAddress(a: AddressForm): FieldErrors {
  const e: FieldErrors = {};
  if (!a.name.trim()) e.name = 'Full name is required';
  if (!a.phone.trim()) e.phone = 'Phone number is required';
  else if (!/^[0-9]{10}$/.test(a.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit phone number';
  if (!a.street.trim()) e.street = 'Street address is required';
  if (!a.city.trim()) e.city = 'City is required';
  if (!a.state.trim()) e.state = 'State is required';
  if (!a.pincode.trim()) e.pincode = 'Pincode is required';
  else if (!/^[0-9]{6}$/.test(a.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
  return e;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, itemCount, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<AddressForm>({
    name: '', phone: '', street: '', city: '', state: '', pincode: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const scriptLoadedRef = useRef(false);
  const cartTotal = total();
  const count = itemCount();

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // Load Razorpay script once
  useEffect(() => {
    if (scriptLoadedRef.current || typeof window === 'undefined') return;
    if ((window as any).Razorpay) {
      setRazorpayLoaded(true);
      scriptLoadedRef.current = true;
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
      scriptLoadedRef.current = true;
    };
    script.onerror = () => {
      setError('Failed to load payment gateway. Please try again.');
    };
    document.body.appendChild(script);
    return () => {
      // Don't remove script — it's needed for the session
    };
  }, []);

  if (items.length === 0) return null;

  // ─── Step 1: Submit Address ─────────────────────────────────────────────────
  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateAddress(address);
    setFieldErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep('review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function updateField(key: keyof AddressForm, value: string) {
    setAddress(prev => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  // ─── Step 2: Place Order + Pay ─────────────────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Create the online order
      const { data: orderRes } = await apiClient.post('/public/orders', {
        items: items.map(i => ({
          itemId: i.id,
          unitPrice: i.price,
          quantity: i.quantity || 1,
        })),
        shippingAddress: address,
        totalAmount: cartTotal,
      });
      // Unwrap TransformInterceptor: { status, data: { data: order } }
      const order = orderRes?.data?.data ?? orderRes?.data ?? orderRes;
      setOrderId(order.id);

      // 2. Create Razorpay order
      const amountPaise = Math.round(cartTotal * 100);
      const { data: rzpRes } = await apiClient.post('/payments/razorpay/order', {
        amount: amountPaise,
        receipt: order.orderNumber,
        notes: { orderId: order.id },
      });
      const rzpOrder = rzpRes?.data ?? rzpRes;
      const razorpayOrderId = rzpOrder.orderId;

      // 3. Open Razorpay checkout
      setStep('payment');
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? 'rzp_test_xxxxxxxx',
        amount: amountPaise,
        currency: 'INR',
        name: 'Dream Gadgets',
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: address.name,
          contact: address.phone,
        },
        theme: { color: '#E50914' },
        handler: async (response: any) => {
          // 4. Verify payment on backend
          try {
            await apiClient.post('/payments/razorpay/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order.id,
            });
            clearCart();
            router.push(`/orders/${order.id}?payment=success`);
          } catch (verifyErr: any) {
            setError(
              verifyErr?.response?.data?.error?.message ??
              'Payment was taken but verification failed. Please contact support with your order ID.'
            );
            router.push(`/orders/${order.id}?payment=pending`);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled. You can retry from your order page.');
            router.push(`/orders/${order.id}?payment=pending`);
          },
          confirm_close: true,
        },
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Checkout failed. Please try again.');
      setLoading(false);
    }
  }, [items, address, cartTotal, clearCart, router]);

  // ─── Shared Styles ──────────────────────────────────────────────────────────
  const inputClass = (key: string) =>
    `w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none ${
      fieldErrors[key]
        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
    }`;

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  const stepClass = (s: Step) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
      step === s
        ? 'bg-primary text-primary-foreground shadow-sm'
        : ['address', 'review'].indexOf(s) <= ['address', 'review', 'payment'].indexOf(step)
          ? 'bg-primary/10 text-primary'
          : 'bg-gray-100 text-gray-400'
    }`;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className={stepClass('address')}>
              <span>1</span>
              <span className="hidden sm:inline">Address</span>
            </div>
            <div className="w-8 h-px bg-gray-200" />
            <div className={stepClass('review')}>
              <span>2</span>
              <span className="hidden sm:inline">Review</span>
            </div>
            <div className="w-8 h-px bg-gray-200" />
            <div className={stepClass('payment')}>
              <span>3</span>
              <span className="hidden sm:inline">Pay</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Main Content ── */}
          <div className="lg:col-span-3">

            {/* ═══ Step 1: Address Form ═══ */}
            {step === 'address' && (
              <form onSubmit={handleAddressSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', colSpan: 'sm:col-span-2' },
                    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '9876543210', colSpan: 'sm:col-span-2' },
                    { key: 'street', label: 'Street Address', type: 'text', placeholder: '123 Main St, Apartment 4B', colSpan: 'sm:col-span-2' },
                    { key: 'city', label: 'City', type: 'text', placeholder: 'Mumbai' },
                    { key: 'state', label: 'State', type: 'text', placeholder: 'Maharashtra' },
                    { key: 'pincode', label: 'Pincode', type: 'text', placeholder: '400001' },
                  ].map(f => (
                    <div key={f.key} className={f.colSpan || ''}>
                      <label className={labelClass}>{f.label}</label>
                      <input
                        type={f.type}
                        value={(address as any)[f.key]}
                        onChange={e => updateField(f.key as keyof AddressForm, e.target.value)}
                        placeholder={f.placeholder}
                        className={inputClass(f.key)}
                        autoComplete={f.key === 'name' ? 'name' : f.key === 'phone' ? 'tel' : f.key === 'street' ? 'street-address' : f.key === 'city' ? 'address-level2' : f.key === 'state' ? 'address-level1' : f.key === 'pincode' ? 'postal-code' : 'off'}
                      />
                      {fieldErrors[f.key] && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors[f.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Back to Cart
                  </Link>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                  >
                    Continue to Review
                  </button>
                </div>
              </form>
            )}

            {/* ═══ Step 2: Review Order ═══ */}
            {step === 'review' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Review Your Order</h2>

                {/* Shipping Address */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Shipping To</h3>
                    <button
                      onClick={() => setStep('address')}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-0.5">
                    <p className="font-medium text-gray-900">{address.name}</p>
                    <p>{address.phone}</p>
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                  </div>
                </div>

                {/* Items */}
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Items ({count})</h3>
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                        <img src={item.imageUrl || '/fallback.png'} alt={item.name} className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.src = '/fallback.png'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity || 1}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setStep('address')}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay ₹{cartTotal.toLocaleString('en-IN')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ═══ Step 3: Payment Processing ═══ */}
            {step === 'payment' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 sm:p-10 shadow-sm text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h2>
                <p className="text-sm text-gray-500 mb-2">Please complete the payment in the Razorpay popup.</p>
                {orderId && (
                  <p className="text-xs text-gray-400">
                    Order ID: {orderId.slice(0, 8)}...
                  </p>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* ── Sidebar: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg shrink-0 overflow-hidden">
                      <img src={item.imageUrl || '/fallback.png'} alt={item.name} className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = '/fallback.png'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity || 1}</p>
                    </div>
                    <p className="text-xs font-semibold">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({count} items)</span>
                  <span className="font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
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

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure checkout via Razorpay
              </div>

              {/* Payment methods */}
              <div className="mt-4 flex justify-center gap-2">
                <span className="px-2 py-1 bg-gray-50 rounded text-[10px] font-medium text-gray-500">Visa</span>
                <span className="px-2 py-1 bg-gray-50 rounded text-[10px] font-medium text-gray-500">MC</span>
                <span className="px-2 py-1 bg-gray-50 rounded text-[10px] font-medium text-gray-500">UPI</span>
                <span className="px-2 py-1 bg-gray-50 rounded text-[10px] font-medium text-gray-500">Net Banking</span>
                <span className="px-2 py-1 bg-gray-50 rounded text-[10px] font-medium text-gray-500">EMI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
