'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { useCartStore } from '../../store/cart.store';
import { apiClient } from '../../lib/api';
import { CouponInput } from '../../components/coupon/CouponInput';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface EmiPlanOption {
  id: string;
  providerName: string;
  providerSlug: string;
  label: string;
  tenureMonths: number;
  annualRate: number;
  processingFee: number;
  emiAmount: number;
  totalInterest: number;
  totalPayment: number;
}

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
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [emiPlans, setEmiPlans] = useState<EmiPlanOption[]>([]);
  const [selectedEmiPlan, setSelectedEmiPlan] = useState<EmiPlanOption | null>(null);
  const [showEmiDropdown, setShowEmiDropdown] = useState(false);
  const [emiLoading, setEmiLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const scriptLoadedRef = useRef(false);
  const cartTotal = total();
  const count = itemCount();

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

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
  }, []);

  // Fetch EMI plans for the cart total
  useEffect(() => {
    if (cartTotal < 3000 || emiPlans.length > 0) return;
    setEmiLoading(true);
    fetch(`${API}/public/emi/plans?amount=${Math.round(cartTotal - couponDiscount)}`)
      .then(res => res.json())
      .then(json => setEmiPlans(json.data ?? []))
      .catch(() => {/* silent */})
      .finally(() => setEmiLoading(false));
  }, [cartTotal, couponDiscount, emiPlans.length]);

  if (items.length === 0) return null;

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

  const handlePlaceOrder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const effectiveTotal = cartTotal - couponDiscount;
      const { data: orderRes } = await apiClient.post('/public/orders', {
        items: items.map(i => ({
          itemId: i.id,
          imei: null,
          description: i.name || '',
          unitPrice: i.price,
          quantity: i.quantity || 1,
        })),
        shippingAddress: address,
        totalAmount: effectiveTotal,
        couponCode: couponCode || undefined,
      });
      const order = orderRes?.data ?? orderRes;
      setOrderId(order.id);

      const amountPaise = Math.round(effectiveTotal * 100);
      const { data: rzpRes } = await apiClient.post('/payments/razorpay/order', {
        amount: amountPaise,
        receipt: order.orderNumber,
        notes: { orderId: order.id },
      });
      const rzpOrder = rzpRes?.data ?? rzpRes;
      const razorpayOrderId = rzpOrder.orderId;

      setStep('payment');
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? 'rzp_test_xxxxxxxx',
        amount: amountPaise,
        currency: 'INR',
        name: 'Dream Gadgets',
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: { name: address.name, contact: address.phone },
        theme: { color: '#E50914' },
        handler: async (response: any) => {
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
              typeof verifyErr === 'string' ? verifyErr :
              verifyErr?.response?.data?.error?.message ??
              verifyErr?.message ??
              'Payment was taken but verification failed. Please contact support.'
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
  }, [items, address, cartTotal, couponDiscount, couponCode, clearCart, router]);

  const inputClass = (key: string) =>
    `input ${
      fieldErrors[key]
        ? 'input-error'
        : ''
    }`;

  const labelClass = 'block text-sm font-semibold text-surface-700 mb-1.5';

  const StepIndicator = ({ num, label, current }: { num: number; label: string; current: Step }) => {
    const steps: Step[] = ['address', 'review', 'payment'];
    const isActive = current === steps[num - 1];
    const isCompleted = steps.indexOf(current) >= num;
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
          isActive
            ? 'bg-primary text-white shadow-md shadow-primary/30'
            : isCompleted
            ? 'bg-emerald-500 text-white'
            : 'bg-surface-100 text-surface-400'
        }`}>
          {isCompleted ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            num
          )}
        </div>
        <span className={`text-xs font-semibold ${isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-surface-400'}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-50/50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {/* ── Header + Stepper ── */}
        <div className="mb-10">
          <h1 className="heading-md mb-6">Checkout</h1>
          <div className="flex items-center gap-3">
            <StepIndicator num={1} label="Address" current={step} />
            <div className="flex-1 h-px bg-surface-200" />
            <StepIndicator num={2} label="Review" current={step} />
            <div className="flex-1 h-px bg-surface-200" />
            <StepIndicator num={3} label="Payment" current={step} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Main Content ── */}
          <div className="lg:col-span-3">
            {/* ═══ Step 1: Address Form ═══ */}
            {step === 'address' && (
              <form onSubmit={handleAddressSubmit} className="bg-white border border-surface-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-surface-900 mb-6">Shipping Address</h2>
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
                      <label htmlFor={`checkout-${f.key}`} className={labelClass}>{f.label}</label>
                      <input
                        id={`checkout-${f.key}`}
                        name={f.key}
                        type={f.type}
                        value={(address as any)[f.key]}
                        onChange={e => updateField(f.key as keyof AddressForm, e.target.value)}
                        placeholder={f.placeholder}
                        className={inputClass(f.key)}
                        autoComplete={f.key === 'name' ? 'name' : f.key === 'phone' ? 'tel' : f.key === 'street' ? 'street-address' : f.key === 'city' ? 'address-level2' : f.key === 'state' ? 'address-level1' : f.key === 'pincode' ? 'postal-code' : 'off'}
                      />
                      {fieldErrors[f.key] && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors[f.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <Link href="/cart" className="btn-ghost">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Back to Cart
                  </Link>
                  <button type="submit" className="btn-primary-lg">
                    Continue to Review
                  </button>
                </div>
              </form>
            )}

            {/* ═══ Step 2: Review Order ═══ */}
            {step === 'review' && (
              <div className="bg-white border border-surface-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-surface-900 mb-6">Review Your Order</h2>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-surface-700">Shipping To</h3>
                    <button onClick={() => setStep('address')} className="text-xs text-primary font-semibold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="bg-surface-50 rounded-xl p-4 text-sm text-surface-600 space-y-0.5 border border-surface-100">
                    <p className="font-semibold text-surface-900">{address.name}</p>
                    <p>{address.phone}</p>
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-surface-700 mb-3">Items ({count})</h3>
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl border border-surface-100">
                      <div className="w-14 h-14 bg-surface-100 rounded-lg shrink-0 overflow-hidden">
                        <img src={item.imageUrl || '/fallback.png'} alt={item.name} className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.src = '/fallback.png'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{item.name}</p>
                        <p className="text-xs text-surface-400">Qty: {item.quantity || 1}</p>
                      </div>
                      <p className="text-sm font-bold text-surface-900">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep('address')} className="btn-ghost">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-primary-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              <div className="bg-white border border-surface-100 rounded-2xl p-8 sm:p-10 shadow-sm text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                    <svg className="w-10 h-10 text-primary animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-surface-900 mb-2">Processing Payment</h2>
                <p className="text-sm text-surface-500 mb-2">Please complete the payment in the Razorpay popup.</p>
                {orderId && (
                  <p className="text-xs text-surface-400 font-mono">Order ID: {orderId.slice(0, 8)}...</p>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* ── Sidebar: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-surface-100 rounded-2xl p-6 shadow-sm sticky top-28">
              <h2 className="text-lg font-bold text-surface-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-surface-50 rounded-lg shrink-0 overflow-hidden border border-surface-100">
                      <img src={item.imageUrl || '/fallback.png'} alt={item.name} className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = '/fallback.png'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-surface-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-surface-400">Qty: {item.quantity || 1}</p>
                    </div>
                    <p className="text-xs font-semibold">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="divider pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">Subtotal ({count} items)</span>
                  <span className="font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Coupon: {couponCode}
                    </span>
                    <span className="font-semibold">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 mb-3">
                <CouponInput
                  subtotal={cartTotal}
                  onCouponApplied={(code, discount) => {
                    setCouponCode(code);
                    setCouponDiscount(discount);
                  }}
                  onCouponRemoved={() => {
                    setCouponCode(null);
                    setCouponDiscount(0);
                  }}
                  disabled={step !== 'review'}
                />
              </div>

              <div className="divider mt-4 pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-surface-900">Total</span>
                <span className="text-xl font-extrabold text-surface-900">₹{Math.max(0, cartTotal - couponDiscount).toLocaleString('en-IN')}</span>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-surface-400">
                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure checkout via Razorpay
              </div>

              {/* EMI Options */}
              {emiPlans.length > 0 && step === 'review' && (
                <div className="mt-4 pt-4 divider">
                  <button
                    type="button"
                    onClick={() => setShowEmiDropdown(!showEmiDropdown)}
                    className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-3 w-full"
                  >
                    <span>💳</span>
                    <span>Pay in Easy EMIs</span>
                    {selectedEmiPlan && (
                      <span className="badge-primary text-[10px] ml-1">
                        {selectedEmiPlan.emiAmount.toLocaleString('en-IN')}/mo
                      </span>
                    )}
                    <svg className={`w-3.5 h-3.5 ml-auto text-surface-400 transition-transform ${showEmiDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showEmiDropdown && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {emiPlans.map(plan => (
                        <label
                          key={plan.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedEmiPlan?.id === plan.id
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                              : 'border-surface-100 hover:border-surface-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="emiPlan"
                            checked={selectedEmiPlan?.id === plan.id}
                            onChange={() => { setSelectedEmiPlan(plan); setShowEmiDropdown(false); }}
                            className="w-4 h-4 text-primary accent-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-surface-900">
                              {plan.providerName} — {plan.label}
                            </p>
                            <p className="text-[11px] text-surface-400">
                              {plan.annualRate === 0 ? 'No Cost EMI' : `${plan.annualRate}% p.a.`}
                              {plan.processingFee > 0 && ` · Fee: ₹${plan.processingFee}`}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-primary shrink-0">
                            ₹{plan.emiAmount.toLocaleString('en-IN')}/mo
                          </p>
                        </label>
                      ))}
                      {selectedEmiPlan && (
                        <button
                          onClick={() => { setSelectedEmiPlan(null); setShowEmiDropdown(false); }}
                          className="w-full text-center text-xs text-surface-400 hover:text-surface-600 py-2 transition-colors"
                        >
                          Clear EMI selection
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {['Visa', 'MC', 'UPI', 'NetBanking', 'EMI'].map(m => (
                  <span key={m} className="px-2 py-1 bg-surface-50 rounded-lg text-[10px] font-medium text-surface-500 border border-surface-100">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
