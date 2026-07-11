import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';
import { CancelOrderButton } from '../../../components/order/CancelOrderButton';
export const metadata = { title: 'Order Confirmation' };
async function getOrder(id) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}/public/orders/${id}`, { cache: 'no-store' });
        if (!res.ok)
            return null;
        const json = await res.json();
        return json?.data?.data ?? json?.data ?? json;
    }
    catch {
        return null;
    }
}
const STATUS_STEPS = [
    OnlineOrderStatus.PENDING_PAYMENT,
    OnlineOrderStatus.PAYMENT_CONFIRMED,
    OnlineOrderStatus.PROCESSING,
    OnlineOrderStatus.PACKED,
    OnlineOrderStatus.SHIPPED,
    OnlineOrderStatus.OUT_FOR_DELIVERY,
    OnlineOrderStatus.DELIVERED,
];
function StatusTimeline({ currentStatus }) {
    const currentStep = STATUS_STEPS.indexOf(currentStatus);
    return (_jsx("div", { className: "mb-8", children: _jsx("div", { className: "flex items-center justify-between", children: STATUS_STEPS.slice(0, -1).map((step, i) => {
                const isActive = i <= currentStep - 1;
                const isCurrent = i === currentStep - 1;
                return (_jsxs("div", { className: "flex flex-col items-center flex-1 relative", children: [_jsx("div", { className: `w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${isActive
                                ? 'bg-primary border-primary text-white shadow-sm'
                                : isCurrent
                                    ? 'border-primary text-primary bg-primary/10'
                                    : 'border-surface-200 text-surface-300 bg-white'}`, children: isActive ? '✓' : i + 2 }), _jsx("span", { className: `text-[10px] mt-1.5 text-center capitalize leading-tight max-w-[64px] ${isActive ? 'text-surface-900 font-medium' : 'text-surface-400'}`, children: step.replace(/_/g, ' ') }), i < STATUS_STEPS.length - 2 && (_jsx("div", { className: `absolute top-3.5 left-[calc(50%+14px)] w-[calc(100%-28px)] h-px ${isActive ? 'bg-primary' : 'bg-surface-100'}` }))] }, step));
            }) }) }));
}
export default async function OrderPage({ params, searchParams, }) {
    const order = await getOrder(params.id);
    if (!order) {
        return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-20 text-center", children: [_jsx("div", { className: "w-20 h-20 mx-auto bg-surface-50 rounded-full flex items-center justify-center mb-6", children: _jsx("svg", { className: "w-10 h-10 text-surface-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h1", { className: "heading-md text-surface-900 mb-2", children: "Order Not Found" }), _jsx("p", { className: "text-surface-500 mb-6", children: "This order may not exist or you may not have access." }), _jsx("a", { href: "/", className: "btn-primary btn-lg", children: "Go Home" })] }));
    }
    const paymentSuccess = searchParams?.payment === 'success';
    const paymentPending = searchParams?.payment === 'pending';
    const currentStep = STATUS_STEPS.indexOf(order.status);
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-8 animate-fade-in", children: [paymentSuccess && (_jsxs("div", { className: "mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0", children: _jsx("svg", { className: "w-5 h-5 text-emerald-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M5 13l4 4L19 7" }) }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-emerald-800 text-sm", children: "Payment Successful!" }), _jsx("p", { className: "text-xs text-emerald-600 mt-0.5", children: "Your order has been confirmed. We'll notify you when it ships." })] })] })), paymentPending && (_jsxs("div", { className: "mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0", children: _jsx("svg", { className: "w-5 h-5 text-amber-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-amber-800 text-sm", children: "Payment Pending" }), _jsx("p", { className: "text-xs text-amber-600 mt-0.5", children: "Your order was created but payment is not yet confirmed." })] })] })), _jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "text-5xl mb-4", children: order.status === OnlineOrderStatus.DELIVERED
                            ? '✅'
                            : paymentSuccess
                                ? '🎉'
                                : paymentPending
                                    ? '⏳'
                                    : '📦' }), _jsxs("h1", { className: "heading-md text-surface-900", children: [order.status === OnlineOrderStatus.DELIVERED && 'Delivered!', order.status === OnlineOrderStatus.PAYMENT_CONFIRMED && 'Order Confirmed', order.status === OnlineOrderStatus.PENDING_PAYMENT && 'Order Created', ![OnlineOrderStatus.DELIVERED, OnlineOrderStatus.PAYMENT_CONFIRMED, OnlineOrderStatus.PENDING_PAYMENT].includes(order.status) && 'Order Updated'] }), _jsxs("p", { className: "text-surface-500 mt-1.5 text-sm", children: ["Order #", order.orderNumber] }), _jsxs("p", { className: "text-xs text-surface-400 mt-0.5", children: ["Placed on ", new Date(order.orderedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })] })] }), currentStep >= 0 && _jsx(StatusTimeline, { currentStatus: order.status }), _jsxs("div", { className: "card p-6 space-y-4", children: [_jsx("h2", { className: "font-bold text-surface-900 text-sm", children: "Order Details" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400 mb-0.5", children: "Status" }), _jsx("p", { className: "font-medium capitalize text-surface-900", children: order.status.replace(/_/g, ' ') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400 mb-0.5", children: "Total" }), _jsxs("p", { className: "font-bold text-lg text-surface-900", children: ["\u20B9", Number(order.totalAmount).toLocaleString('en-IN')] })] }), order.payments?.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400 mb-0.5", children: "Payment" }), _jsxs("p", { className: "font-medium text-emerald-600 text-xs capitalize", children: [order.payments[0].status, " via ", order.payments[0].method] })] })), order.trackingNumber && (_jsxs("div", { className: "col-span-2", children: [_jsx("p", { className: "text-xs text-surface-400 mb-0.5", children: "Tracking" }), _jsxs("p", { className: "font-medium text-sm", children: [order.trackingNumber, " ", order.courier ? `(${order.courier})` : ''] })] }))] }), order.shippingAddress && (_jsxs("div", { className: "divider pt-4 mt-2", children: [_jsx("p", { className: "text-xs text-surface-400 mb-1.5", children: "Shipping Address" }), _jsxs("div", { className: "text-sm text-surface-700 space-y-0.5", children: [_jsx("p", { className: "font-medium text-surface-900", children: order.shippingAddress.name }), _jsx("p", { children: order.shippingAddress.phone }), _jsx("p", { children: order.shippingAddress.street }), _jsxs("p", { children: [order.shippingAddress.city, ", ", order.shippingAddress.state, " - ", order.shippingAddress.pincode] })] })] })), (order.status === 'pending_payment' || order.status === 'payment_confirmed') && (_jsx("div", { className: "divider pt-4 mt-2", children: _jsx(CancelOrderButton, { orderId: order.id, status: order.status, amount: order.totalAmount }) }))] }), _jsxs("div", { className: "mt-8 text-center space-y-3", children: [_jsxs("a", { href: "/products", className: "btn-primary btn-lg", children: ["Continue Shopping", _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })] }), _jsxs("p", { className: "text-xs text-surface-400", children: ["Questions about your order? ", _jsx("a", { href: "/contact", className: "text-primary hover:underline", children: "Contact Us" })] })] })] }));
}
//# sourceMappingURL=page.js.map