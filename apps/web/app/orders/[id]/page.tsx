import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Order Confirmation' };

async function getOrder(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}/public/orders/${id}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

const STATUS_STEPS = ['pending_payment', 'payment_confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground">This order may not exist or you may not have access.</p>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">{order.status === 'delivered' ? '✅' : '📦'}</div>
        <h1 className="text-2xl font-bold">Order {order.status === 'delivered' ? 'Delivered' : 'Confirmed'}</h1>
        <p className="text-muted-foreground mt-1">Order #{order.orderNumber}</p>
      </div>

      {/* Status Timeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STATUS_STEPS.slice(1).map((step, i) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${i <= currentStep - 1 ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                {i <= currentStep - 1 ? '✓' : i + 1}
              </div>
              <span className="text-xs mt-1 text-center hidden md:block capitalize">{step.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details */}
      <div className="border rounded-xl p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium capitalize">{order.status.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
        </div>
        {order.trackingNumber && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tracking</span>
            <span className="font-medium">{order.trackingNumber} ({order.courier})</span>
          </div>
        )}
        {order.shippingAddress && (
          <div className="text-sm">
            <span className="text-muted-foreground block mb-1">Shipping to</span>
            <span>{order.shippingAddress.name}, {order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</span>
          </div>
        )}
      </div>
    </div>
  );
}
