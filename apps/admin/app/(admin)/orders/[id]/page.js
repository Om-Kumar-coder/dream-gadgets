'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, CreditCard, Mail, MessageCircle, Truck, XCircle, ChevronDown, } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
const STATUS_COLORS = {
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
const PAYMENT_STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
};
const STATUS_TRANSITIONS = {
    pending_payment: ['payment_confirmed', 'cancelled'],
    payment_confirmed: ['processing', 'cancelled'],
    processing: ['packed', 'cancelled'],
    packed: ['shipped'],
    shipped: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
};
export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const qc = useQueryClient();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/orders/${id}`);
            return data.data;
        },
    });
    const order = data;
    const updateStatus = useMutation({
        mutationFn: async ({ status }) => {
            const { data } = await apiClient.post(`/orders/${id}/status`, { status });
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['order', id] });
            qc.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order status updated');
        },
        onError: (error) => {
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
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        },
    });
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-16", children: _jsx("div", { className: "text-surface-400 text-sm", children: "Loading order details..." }) }));
    }
    if (isError || !order) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx(Package, { className: "w-12 h-12 text-red-300 mb-3" }), _jsx("h3", { className: "text-lg font-medium text-surface-900", children: "Order Not Found" }), _jsx("p", { className: "text-surface-500 text-sm mt-1", children: error instanceof Error ? error.message : 'Could not load order details' }), _jsx(Link, { href: "/orders", className: "mt-4 text-blue-600 hover:underline text-sm", children: "Back to Orders" })] }));
    }
    const availableTransitions = STATUS_TRANSITIONS[order.status] ?? [];
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Link, { href: "/orders", className: "flex items-center gap-1 text-surface-600 hover:text-surface-900 transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Back"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h1", { className: "heading-sm text-surface-900 font-mono", children: order.orderNumber }), _jsx("span", { className: `text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`, children: order.status?.replace(/_/g, ' ') })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "card p-6", children: [_jsx("div", { className: "flex items-center justify-between mb-6", children: _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-surface-900", children: "Order Details" }), _jsxs("p", { className: "text-sm text-surface-500", children: ["Placed on", ' ', order.orderedAt
                                                            ? format(new Date(order.orderedAt), 'dd MMM yyyy, h:mm a')
                                                            : '—'] })] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Order Number" }), _jsx("p", { className: "font-mono text-sm font-medium", children: order.orderNumber })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Branch" }), _jsx("p", { className: "text-sm", children: order.branch?.name ?? '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Status" }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium inline-block ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`, children: order.status?.replace(/_/g, ' ') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Customer" }), _jsx("p", { className: "text-sm", children: order.client ? (_jsxs("span", { children: [order.client.firstName, " ", order.client.lastName, order.client.email && (_jsxs("span", { className: "text-surface-400 ml-1", children: ["(", order.client.email, ")"] }))] })) : (_jsx("span", { className: "text-surface-400", children: "Guest" })) })] }), order.assignedTo && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Assigned To" }), _jsxs("p", { className: "text-sm", children: [order.assignedTo.firstName, " ", order.assignedTo.lastName] })] }))] }), _jsxs("div", { className: "border-t border-surface-100 pt-4", children: [_jsx("h3", { className: "text-sm font-medium text-surface-700 mb-3", children: "Timeline" }), _jsxs("div", { className: "space-y-3", children: [[
                                                        { label: 'Order Placed', date: order.orderedAt, icon: Package },
                                                        { label: 'Shipped', date: order.shippedAt, icon: Truck },
                                                        { label: 'Delivered', date: order.deliveredAt, icon: Package },
                                                    ]
                                                        .filter((t) => t.date)
                                                        .map((t, i) => (_jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center", children: _jsx(t.icon, { className: "w-4 h-4 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-surface-800", children: t.label }), _jsx("p", { className: "text-xs text-surface-400", children: format(new Date(t.date), 'dd MMM yyyy, h:mm a') })] })] }, i))), !order.shippedAt && !order.deliveredAt && (_jsxs("p", { className: "text-sm text-surface-400 italic", children: ["Order is ", order.status?.replace(/_/g, ' ')] }))] })] })] }), _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(MapPin, { className: "w-5 h-5 text-surface-500" }), _jsx("h2", { className: "text-lg font-semibold text-surface-900", children: "Shipping Address" })] }), _jsxs("div", { className: "bg-surface-50 rounded-lg p-4 space-y-1.5 text-sm", children: [_jsx("p", { className: "font-medium", children: order.shippingAddress?.name }), _jsx("p", { className: "text-surface-600", children: order.shippingAddress?.phone }), _jsx("p", { className: "text-surface-600", children: order.shippingAddress?.street }), _jsxs("p", { className: "text-surface-600", children: [order.shippingAddress?.city, ", ", order.shippingAddress?.state, ' ', order.shippingAddress?.pincode] })] }), order.trackingNumber && (_jsxs("div", { className: "mt-4 flex items-center gap-2 text-sm", children: [_jsx(Truck, { className: "w-4 h-4 text-surface-400" }), _jsx("span", { className: "text-surface-500", children: "Tracking:" }), _jsx("span", { className: "font-mono font-medium", children: order.trackingNumber }), order.courier && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-surface-300", children: "|" }), _jsx("span", { className: "text-surface-500", children: order.courier })] }))] }))] }), _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(CreditCard, { className: "w-5 h-5 text-surface-500" }), _jsx("h2", { className: "text-lg font-semibold text-surface-900", children: "Payments" })] }), order.payments.length === 0 ? (_jsx("p", { className: "text-sm text-surface-400", children: "No payments recorded" })) : (_jsx("div", { className: "space-y-3", children: order.payments.map((payment) => (_jsxs("div", { className: "flex items-center justify-between py-3 border-b border-surface-100 last:border-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-sm font-medium capitalize", children: payment.method || '—' }), payment.razorpayPaymentId && (_jsx("span", { className: "text-xs text-surface-400 font-mono", children: payment.razorpayPaymentId }))] }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_COLORS[payment.status] ?? 'bg-gray-100 text-gray-600'}`, children: payment.status })] }), _jsxs("span", { className: "font-medium", children: ["\u20B9", Number(payment.amount).toLocaleString('en-IN')] })] }, payment.id))) })), _jsxs("div", { className: "mt-4 space-y-2 border-t border-surface-100 pt-4", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-surface-500", children: "Subtotal" }), _jsxs("span", { className: "font-medium", children: ["\u20B9", Number(order.subtotal).toLocaleString('en-IN')] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-surface-500", children: "Shipping" }), _jsx("span", { className: "font-medium", children: order.shippingCharge > 0
                                                            ? `₹${Number(order.shippingCharge).toLocaleString('en-IN')}`
                                                            : 'Free' })] }), order.discountAmount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [_jsx("span", { children: "Discount" }), _jsxs("span", { children: ["-\u20B9", Number(order.discountAmount).toLocaleString('en-IN')] })] })), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-surface-500", children: "Tax" }), _jsxs("span", { className: "font-medium", children: ["\u20B9", Number(order.taxAmount).toLocaleString('en-IN')] })] }), _jsxs("div", { className: "flex justify-between text-lg font-semibold pt-2 border-t border-surface-200", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["\u20B9", Number(order.totalAmount).toLocaleString('en-IN')] })] })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "card p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-surface-900 mb-4", children: "Actions" }), _jsxs("div", { className: "space-y-2", children: [availableTransitions.length > 0 && (_jsxs("div", { className: "space-y-1.5", children: [_jsx("p", { className: "text-xs font-medium text-surface-500 uppercase tracking-wider", children: "Update Status" }), availableTransitions.map((status) => (_jsxs("button", { onClick: () => {
                                                            if (status === 'cancelled'
                                                                ? confirm(`Cancel order ${order.orderNumber}?`)
                                                                : true) {
                                                                updateStatus.mutate({ status });
                                                            }
                                                        }, disabled: updateStatus.isPending, className: "btn-outline btn-md w-full justify-start capitalize", children: [status === 'cancelled' ? (_jsx(XCircle, { className: "w-4 h-4 text-red-500" })) : (_jsx(ChevronDown, { className: "w-4 h-4 text-blue-500" })), "Mark as ", status.replace(/_/g, ' ')] }, status)))] })), _jsxs("div", { className: "pt-2 border-t border-surface-100 space-y-2", children: [order.client?.email && (_jsxs("button", { className: "flex items-center gap-2 w-full px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx(Mail, { className: "w-4 h-4 text-surface-500" }), "Email Customer"] })), order.client?.phone && (_jsxs("button", { className: "btn-outline btn-md w-full justify-start", children: [_jsx(MessageCircle, { className: "w-4 h-4 text-surface-500" }), "WhatsApp Customer"] }))] })] })] }), _jsxs("div", { className: "card p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-surface-900 mb-4", children: "Metadata" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Ordered At" }), _jsx("p", { className: "text-surface-900", children: order.orderedAt
                                                            ? format(new Date(order.orderedAt), 'dd MMM yyyy, h:mm a')
                                                            : '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Created At" }), _jsx("p", { className: "text-surface-900", children: order.createdAt
                                                            ? format(new Date(order.createdAt), 'dd MMM yyyy, h:mm a')
                                                            : '—' })] }), order.notes && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Notes" }), _jsx("p", { className: "text-surface-900 bg-surface-50 rounded-lg p-3 mt-1 text-sm", children: order.notes })] }))] })] })] })] })] }));
}
//# sourceMappingURL=page.js.map