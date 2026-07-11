'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { RefreshCw, Search, RotateCcw, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
const REFUND_STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    processed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
};
export default function AdminRefundsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [refundFilter, setRefundFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const { data: refunds, isLoading, isError } = useQuery({
        queryKey: ['admin-refunds'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/refunds');
            // TransformInterceptor wraps responses as { status: 'success', data: [...] }
            return (data?.data ?? data ?? []);
        },
        refetchInterval: 30000, // Auto-refresh every 30s
    });
    const retryMutation = useMutation({
        mutationFn: async (paymentId) => {
            const { data } = await apiClient.post(`/admin/refunds/${paymentId}/retry`);
            return data;
        },
        onSuccess: () => {
            toast.success('Refund initiated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
            setSelectedPayment(null);
        },
        onError: (error) => {
            const msg = error?.response?.data?.message ?? 'Failed to process refund';
            toast.error(typeof msg === 'string' ? msg : 'Refund failed');
        },
    });
    // Filter logic — safe against null payments & missing fields
    const filteredRefunds = (refunds ?? []).filter((item) => {
        const payments = item.payments ?? [];
        const orderNumber = item.orderNumber ?? '';
        const clientName = item.clientName ?? '';
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesSearch = orderNumber.toLowerCase().includes(q) ||
                clientName.toLowerCase().includes(q) ||
                payments.some((p) => p.razorpayPaymentId?.toLowerCase().includes(q));
            if (!matchesSearch)
                return false;
        }
        // Status filter — check across all payments
        if (refundFilter !== 'all') {
            const anyMatch = payments.some((p) => {
                const status = p.refundStatus ?? 'pending';
                if (refundFilter === 'pending')
                    return status === 'pending' || (!p.razorpayRefundId && status === 'pending');
                if (refundFilter === 'failed')
                    return status === 'failed';
                if (refundFilter === 'processed')
                    return status === 'processed';
                return true;
            });
            if (!anyMatch)
                return false;
        }
        return true;
    });
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Refunds" }), _jsx("p", { className: "text-sm text-surface-500 mt-1", children: "Monitor and manually trigger refunds for cancelled online orders" })] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsxs("div", { className: "relative flex-1 min-w-[200px] max-w-sm", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" }), _jsx("input", { type: "text", placeholder: "Search order #, customer, payment ID...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-9 pr-3 py-2 text-sm input" })] }), _jsx("div", { className: "flex gap-1.5", children: ['all', 'pending', 'failed', 'processed'].map((f) => (_jsx("button", { onClick: () => setRefundFilter(f), className: `px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${refundFilter === f
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`, children: f === 'all' ? 'All' : f }, f))) })] }), isLoading && !isError && (_jsxs("div", { className: "flex items-center justify-center py-16", children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin text-surface-400" }), _jsx("span", { className: "ml-2 text-sm text-surface-400", children: "Loading refunds..." })] })), isError && (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx(ShieldAlert, { className: "w-8 h-8 text-red-400 mb-2" }), _jsx("p", { className: "text-sm text-surface-500", children: "Failed to load refund data. Check server connection or permissions." }), _jsx("button", { onClick: () => queryClient.invalidateQueries({ queryKey: ['admin-refunds'] }), className: "mt-3 text-sm text-blue-600 hover:underline", children: "Try again" })] })), !isLoading && !isError && filteredRefunds.length === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx(RotateCcw, { className: "w-10 h-10 text-green-300 mb-3" }), _jsx("h3", { className: "text-sm font-medium text-surface-700", children: "All caught up" }), _jsx("p", { className: "text-xs text-surface-400 mt-1", children: searchQuery || refundFilter !== 'all'
                            ? 'No refunds match your filters'
                            : 'No cancelled orders with completed payments need refund action' })] })), !isLoading && !isError && filteredRefunds.length > 0 && (_jsx("div", { className: "space-y-4", children: filteredRefunds.map((item) => (_jsxs("div", { className: "card p-5 hover:shadow-card-hover transition-all", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "font-mono text-sm font-medium", children: item.orderNumber }), _jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full badge-neutral", children: "Cancelled" }), "                      ", _jsx("span", { className: "text-xs text-surface-400", children: (() => {
                                                try {
                                                    const d = new Date(item.cancelledAt);
                                                    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                                }
                                                catch {
                                                    return '—';
                                                }
                                            })() })] }), _jsxs("span", { className: "font-semibold text-sm", children: ["\u20B9", Number(item.totalAmount).toLocaleString('en-IN')] })] }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-surface-500 mb-4", children: [_jsx("span", { children: item.clientName }), item.clientEmail && (_jsx("span", { className: "text-surface-400", children: item.clientEmail })), _jsx("span", { className: "text-surface-400", children: item.branchName })] }), _jsx("div", { className: "space-y-2", children: item.payments.map((payment) => {
                                const refundStatus = payment.refundStatus ?? 'pending';
                                const needsRefund = !payment.razorpayRefundId || refundStatus === 'failed' || refundStatus === 'pending';
                                return (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg ${needsRefund
                                        ? 'bg-amber-50 border border-amber-200'
                                        : 'bg-surface-50 border border-surface-100'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-medium", children: ["\u20B9", Number(payment.amount).toLocaleString('en-IN')] }), _jsx("p", { className: "text-[10px] text-surface-400 font-mono mt-0.5", children: payment.razorpayPaymentId ?? 'No Razorpay ID' })] }), payment.razorpayRefundId && (_jsxs("div", { className: "pl-3 border-l border-surface-200", children: [_jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full font-medium ${REFUND_STATUS_COLORS[refundStatus] ?? 'bg-gray-100 text-gray-600'}`, children: refundStatus }), _jsx("p", { className: "text-[10px] text-surface-400 font-mono mt-0.5", children: payment.razorpayRefundId })] }))] }), needsRefund && (_jsxs("button", { onClick: () => setSelectedPayment({
                                                paymentId: payment.paymentId,
                                                orderNumber: item.orderNumber,
                                                amount: payment.amount,
                                                clientName: item.clientName,
                                            }), disabled: retryMutation.isPending && selectedPayment?.paymentId === payment.paymentId, className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [retryMutation.isPending && selectedPayment?.paymentId === payment.paymentId ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(RefreshCw, { className: "w-3.5 h-3.5" })), "Retry Refund"] })), !needsRefund && refundStatus === 'processed' && (_jsxs("span", { className: "text-[10px] text-green-600 font-medium flex items-center gap-1", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500" }), "Refunded"] }))] }, payment.paymentId));
                            }) })] }, item.orderId))) })), selectedPayment && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4", children: [_jsx("h3", { className: "text-base font-semibold text-surface-900 mb-2", children: "Confirm Refund" }), _jsx("p", { className: "text-sm text-surface-500 mb-4", children: "This will initiate a full refund via Razorpay for the following payment:" }), _jsxs("div", { className: "bg-surface-50 rounded-lg p-3 mb-4 space-y-1.5 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Order" }), _jsx("span", { className: "font-mono font-medium", children: selectedPayment.orderNumber })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Customer" }), _jsx("span", { children: selectedPayment.clientName })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Amount" }), _jsxs("span", { className: "font-semibold", children: ["\u20B9", Number(selectedPayment.amount).toLocaleString('en-IN')] })] })] }), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx("button", { onClick: () => setSelectedPayment(null), disabled: retryMutation.isPending, className: "px-4 py-2 text-sm font-medium text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors disabled:opacity-50", children: "Cancel" }), _jsxs("button", { onClick: () => retryMutation.mutate(selectedPayment.paymentId), disabled: retryMutation.isPending, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50", children: [retryMutation.isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(RefreshCw, { className: "w-4 h-4" })), retryMutation.isPending ? 'Processing...' : 'Confirm Refund'] })] })] }) }))] }));
}
//# sourceMappingURL=page.js.map