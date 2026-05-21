'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Mail,
  MessageCircle,
  Truck,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  payment_confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  return_requested: 'bg-orange-100 text-orange-700',
  returned: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['payment_confirmed', 'cancelled'],
  payment_confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped'],
  shipped: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
};

type OnlineOrder = {
  id: string;
  orderNumber: string;
  clientId: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  } | null;
  branch: {
    id: string;
    name: string;
  };
  status: string;
  subtotal: number;
  shippingCharge: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber: string | null;
  courier: string | null;
  notes: string | null;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  orderedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  payments: {
    id: string;
    method: string;
    amount: number;
    reference: string | null;
    status: string;
    razorpayPaymentId: string | null;
    razorpayRefundId: string | null;
    refundAmount: number | null;
    refundStatus: string | null;
    refundedAt: string | null;
    createdAt: string;
  }[];
  createdAt: string;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/orders/${id}`);
      return data.data;
    },
  });

  const order = data as OnlineOrder | undefined;

  const updateStatus = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const { data } = await apiClient.post(`/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const cancelOrder = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/orders/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-400 text-sm">Loading order details...</div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="w-12 h-12 text-red-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Order Not Found</h3>
        <p className="text-gray-500 text-sm mt-1">
          {error instanceof Error ? error.message : 'Could not load order details'}
        </p>
        <Link href="/orders" className="mt-4 text-blue-600 hover:underline text-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  const availableTransitions = STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900 font-mono">
              {order.orderNumber}
            </h1>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {order.status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500">
                  Placed on{' '}
                  {order.orderedAt
                    ? format(new Date(order.orderedAt), 'dd MMM yyyy, h:mm a')
                    : '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500">Order Number</p>
                <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Branch</p>
                <p className="text-sm">{order.branch?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block ${
                    STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {order.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm">
                  {order.client ? (
                    <span>
                      {order.client.firstName} {order.client.lastName}
                      {order.client.email && (
                        <span className="text-gray-400 ml-1">({order.client.email})</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400">Guest</span>
                  )}
                </p>
              </div>
              {order.assignedTo && (
                <div>
                  <p className="text-xs text-gray-500">Assigned To</p>
                  <p className="text-sm">
                    {order.assignedTo.firstName} {order.assignedTo.lastName}
                  </p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Timeline</h3>
              <div className="space-y-3">
                {[
                  { label: 'Order Placed', date: order.orderedAt, icon: Package },
                  { label: 'Shipped', date: order.shippedAt, icon: Truck },
                  { label: 'Delivered', date: order.deliveredAt, icon: Package },
                ]
                  .filter((t) => t.date)
                  .map((t, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <t.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{t.label}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(t.date!), 'dd MMM yyyy, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                {!order.shippedAt && !order.deliveredAt && (
                  <p className="text-sm text-gray-400 italic">
                    Order is {order.status?.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
              <p className="font-medium">{order.shippingAddress?.name}</p>
              <p className="text-gray-600">{order.shippingAddress?.phone}</p>
              <p className="text-gray-600">{order.shippingAddress?.street}</p>
              <p className="text-gray-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.pincode}
              </p>
            </div>

            {order.trackingNumber && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Tracking:</span>
                <span className="font-mono font-medium">{order.trackingNumber}</span>
                {order.courier && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">{order.courier}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
            </div>

            {order.payments.length === 0 ? (
              <p className="text-sm text-gray-400">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium capitalize">
                          {payment.method || '—'}
                        </span>
                        {payment.razorpayPaymentId && (
                          <span className="text-xs text-gray-400 font-mono">
                            {payment.razorpayPaymentId}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          PAYMENT_STATUS_COLORS[payment.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <span className="font-medium">
                      ₹{Number(payment.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Order Totals */}
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  ₹{Number(order.subtotal).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">
                  {order.shippingCharge > 0
                    ? `₹${Number(order.shippingCharge).toLocaleString('en-IN')}`
                    : 'Free'}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{Number(order.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium">
                  ₹{Number(order.taxAmount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              {/* Status Transitions */}
              {availableTransitions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Update Status
                  </p>
                  {availableTransitions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        if (
                          status === 'cancelled'
                            ? confirm(`Cancel order ${order.orderNumber}?`)
                            : true
                        ) {
                          updateStatus.mutate({ status });
                        }
                      }}
                      disabled={updateStatus.isPending}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors capitalize"
                    >
                      {status === 'cancelled' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-blue-500" />
                      )}
                      Mark as {status.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 space-y-2">
                {order.client?.email && (
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Customer
                  </button>
                )}
                {order.client?.phone && (
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <MessageCircle className="w-4 h-4 text-gray-500" />
                    WhatsApp Customer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Ordered At</p>
                <p className="text-gray-900">
                  {order.orderedAt
                    ? format(new Date(order.orderedAt), 'dd MMM yyyy, h:mm a')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-gray-900">
                  {order.createdAt
                    ? format(new Date(order.createdAt), 'dd MMM yyyy, h:mm a')
                    : '—'}
                </p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-3 mt-1 text-sm">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
