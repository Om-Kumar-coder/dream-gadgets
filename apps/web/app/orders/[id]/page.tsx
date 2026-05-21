import type { Metadata } from 'next';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { CancelOrderButton } from '../../../components/order/CancelOrderButton';

export const metadata: Metadata = { title: 'Order Confirmation' };

async function getOrder(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}/public/orders/${id}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const json = await res.json();
    // Unwrap TransformInterceptor: { status, data: { data: order } } or { status, data: order }
    return json?.data?.data ?? json?.data ?? json;
  } catch { return null; }
}

// Use shared enum for status progression
const STATUS_STEPS = [
  OnlineOrderStatus.PENDING_PAYMENT,
  OnlineOrderStatus.PAYMENT_CONFIRMED,
  OnlineOrderStatus.PROCESSING,
  OnlineOrderStatus.PACKED,
  OnlineOrderStatus.SHIPPED,
  OnlineOrderStatus.OUT_FOR_DELIVERY,
  OnlineOrderStatus.DELIVERED,
];

function StatusTimeline({ currentStatus }: { currentStatus: OnlineOrderStatus }) {
  const currentStep = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.slice(0, -1).map((step, i) => {
          const isActive = i <= currentStep - 1;
          const isCurrent = i === currentStep - 1;
          return (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : isCurrent
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-gray-200 text-gray-300 bg-white'
                }`}
              >
                {isActive ? '✓' : i + 2}
              </div>
              <span className={`text-[10px] mt-1.5 text-center capitalize leading-tight max-w-[64px] ${
                isActive ? 'text-gray-900 font-medium' : 'text-gray-400'
              }`}>
                {step.replace(/_/g, ' ')}
              </span>
              {/* Connector line */}
              {i < STATUS_STEPS.length - 2 && (
                <div className={`absolute top-3.5 left-[calc(50%+14px)] w-[calc(100%-28px)] h-px ${
                  isActive ? 'bg-primary' : 'bg-gray-100'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { payment?: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Order Not Found</h1>
        <p className="text-gray-500 mb-6">This order may not exist or you may not have access.</p>
        <a href="/" className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all">
          Go Home
        </a>
      </div>
    );
  }

  const paymentSuccess = searchParams?.payment === 'success';
  const paymentPending = searchParams?.payment === 'pending';
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* ── Payment Success Banner ── */}
      {paymentSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-emerald-800 text-sm">Payment Successful!</h3>
            <p className="text-xs text-emerald-600 mt-0.5">Your order has been confirmed. We&apos;ll notify you when it ships.</p>
          </div>
        </div>
      )}

      {/* ── Payment Pending Banner ── */}
      {paymentPending && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-amber-800 text-sm">Payment Pending</h3>
            <p className="text-xs text-amber-600 mt-0.5">Your order was created but payment is not yet confirmed.</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">
          {order.status === OnlineOrderStatus.DELIVERED
            ? '✅'
            : paymentSuccess
              ? '🎉'
              : paymentPending
                ? '⏳'
                : '📦'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {order.status === OnlineOrderStatus.DELIVERED && 'Delivered!'}
          {order.status === OnlineOrderStatus.PAYMENT_CONFIRMED && 'Order Confirmed'}
          {order.status === OnlineOrderStatus.PENDING_PAYMENT && 'Order Created'}
          {![OnlineOrderStatus.DELIVERED, OnlineOrderStatus.PAYMENT_CONFIRMED, OnlineOrderStatus.PENDING_PAYMENT].includes(order.status) && 'Order Updated'}
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Order #{order.orderNumber}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Placed on {new Date(order.orderedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* ── Status Timeline ── */}
      {currentStep >= 0 && <StatusTimeline currentStatus={order.status} />}

      {/* ── Order Details ── */}
      <div className="border border-gray-100 rounded-2xl p-6 space-y-4 bg-white shadow-sm">
        <h2 className="font-bold text-gray-900 text-sm">Order Details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Status</p>
            <p className="font-medium capitalize text-gray-900">{order.status.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total</p>
            <p className="font-bold text-lg text-gray-900">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
          </div>
          {order.payments?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Payment</p>
              <p className="font-medium text-emerald-600 text-xs capitalize">
                {order.payments[0].status} via {order.payments[0].method}
              </p>
            </div>
          )}
          {order.trackingNumber && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-0.5">Tracking</p>
              <p className="font-medium text-sm">{order.trackingNumber} {order.courier ? `(${order.courier})` : ''}</p>
            </div>
          )}
        </div>

        {order.shippingAddress && (
          <div className="border-t border-gray-100 pt-4 mt-2">
            <p className="text-xs text-gray-400 mb-1.5">Shipping Address</p>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
          </div>
        )}

        {/* Cancel Action — only show for cancellable orders */}
        {(order.status === 'pending_payment' || order.status === 'payment_confirmed') && (
          <div className="border-t border-gray-100 pt-4 mt-2">
            <CancelOrderButton
              orderId={order.id}
              status={order.status}
              amount={order.totalAmount}
            />
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="mt-8 text-center space-y-3">
        <a
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
        >
          Continue Shopping
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
        <p className="text-xs text-gray-400">
          Questions about your order? <a href="/contact" className="text-primary hover:underline">Contact Us</a>
        </p>
      </div>
    </div>
  );
}
