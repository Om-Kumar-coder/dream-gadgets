'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, FileText, Mail, MessageCircle, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
const STATUS_COLORS = {
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    voided: 'bg-red-100 text-red-700',
};
export default function SaleDetailPage({ params }) {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sales', params.id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/sales/${params.id}`);
            return data.data;
        },
    });
    const sale = data;
    const voidSale = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.post(`/sales/${id}/void`);
            return data;
        },
        onSuccess: () => {
            toast.success('Sale voided successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to void sale');
        },
    });
    const emailInvoice = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.post(`/sales/${id}/invoice/email`);
            return data;
        },
        onSuccess: () => {
            toast.success('Invoice queued for email delivery');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to send email');
        },
    });
    const whatsappInvoice = useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.post(`/sales/${id}/invoice/whatsapp`);
            return data;
        },
        onSuccess: () => {
            toast.success('Invoice queued for WhatsApp delivery');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to send WhatsApp');
        },
    });
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("div", { className: "text-surface-400", children: "Loading..." }) }));
    }
    if (isError || !sale) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx("div", { className: "text-red-500 mb-2", children: "\u26A0\uFE0F" }), _jsx("h3", { className: "text-lg font-medium text-surface-900", children: "Failed to load sale" }), _jsx("p", { className: "text-surface-500 text-sm mt-1", children: error instanceof Error ? error.message : 'Please try again' }), _jsx(Link, { href: "/sales", className: "mt-4 text-blue-600 hover:underline text-sm", children: "Back to Sales" })] }));
    }
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Link, { href: "/sales", className: "flex items-center gap-1 text-surface-600 hover:text-surface-900 transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Back"] }), _jsx("h1", { className: "heading-sm text-surface-900", children: sale.invoiceNumber })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("a", { href: `/api/v1/sales/${sale.id}/invoice`, target: "_blank", rel: "noreferrer", className: "btn-primary btn-md", children: [_jsx(FileText, { className: "w-4 h-4" }), " Download PDF"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-surface-900", children: "Order Details" }), _jsx("p", { className: "text-sm text-surface-500", children: sale.saleDate ? format(new Date(sale.saleDate), 'dd MMM yyyy, h:mm a') : '—' })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: `text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[sale.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`, children: sale.paymentStatus }), sale.isVoided && (_jsx("span", { className: "text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-700 ml-2", children: "Voided" }))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Invoice #" }), _jsx("p", { className: "font-mono text-sm", children: sale.invoiceNumber })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Branch" }), _jsx("p", { className: "text-sm", children: sale.branch?.name ?? 'N/A' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Sale Type" }), _jsx("p", { className: "text-sm capitalize", children: sale.saleType })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Client" }), _jsx("p", { className: "text-sm", children: sale.client ? (_jsxs("span", { children: [sale.client.firstName, " ", sale.client.lastName, sale.client.email && (_jsxs("span", { className: "text-surface-400 ml-1", children: ["(", sale.client.email, ")"] }))] })) : (_jsx("span", { className: "text-surface-400", children: "Walk-in" })) })] })] }), _jsx("div", { className: "space-y-3", children: sale.items.map((item) => (_jsxs("div", { className: "flex items-center justify-between py-3 border-b border-surface-100 last:border-0", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: item.description }), _jsxs("p", { className: "text-xs text-surface-400", children: ["IMEI: ", item.imei] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-medium text-sm", children: ["\u20B9", Number(item.total).toLocaleString()] }), _jsxs("p", { className: "text-xs text-surface-400", children: ["\u20B9", Number(item.unitPrice).toLocaleString(), " \u00D7 ", item.discount > 0 ? '1' : '1', item.discount > 0 && _jsxs("span", { className: "text-red-500", children: [" -\u20B9", item.discount] })] })] })] }, item.id))) }), "              ", _jsxs("div", { className: "mt-6 space-y-2 border-t border-surface-100 pt-4", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-surface-500", children: "Subtotal" }), _jsxs("span", { className: "font-medium", children: ["\u20B9", Number(sale.subtotal).toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-surface-500", children: "Discount" }), _jsxs("span", { className: "font-medium text-red-500", children: ["- \u20B9", Number(sale.discountAmount).toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-surface-500", children: "Tax" }), _jsxs("span", { className: "font-medium", children: ["\u20B9", Number(sale.taxAmount).toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between text-lg font-semibold pt-2 border-t border-surface-200", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["\u20B9", Number(sale.totalAmount).toLocaleString()] })] })] })] }), _jsxs("div", { className: "card p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-surface-900 mb-4", children: "Payments" }), _jsx("div", { className: "space-y-3", children: sale.payments.map((payment) => (_jsxs("div", { className: "py-3 border-b border-surface-100 last:border-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium capitalize", children: payment.method }), payment.reference && (_jsxs("span", { className: "text-xs text-surface-400", children: ["Ref: ", payment.reference] })), payment.status && (_jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full font-medium ${payment.status === 'completed' ? 'badge-success' :
                                                                        payment.status === 'failed' ? 'badge-danger' :
                                                                            'badge-neutral'}`, children: payment.status }))] }), _jsxs("span", { className: "font-medium", children: ["\u20B9", Number(payment.amount).toLocaleString()] })] }), payment.razorpayRefundId && (_jsxs("div", { className: "mt-2 ml-2 pl-3 border-l-2 border-amber-200 bg-amber-50/50 rounded-r p-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs font-medium text-amber-800 mb-1", children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" }) }), "Refund ", payment.refundStatus === 'processed' ? 'Processed' : payment.refundStatus ?? ''] }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-surface-600", children: [_jsxs("span", { children: ["ID: ", _jsx("span", { className: "font-mono", children: payment.razorpayRefundId })] }), payment.refundAmount != null && (_jsxs("span", { children: ["Amount: ", _jsxs("strong", { children: ["\u20B9", Number(payment.refundAmount).toLocaleString('en-IN')] })] })), payment.refundedAt && (_jsx("span", { children: new Date(payment.refundedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }))] })] }))] }, payment.id))) })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "card p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-surface-900 mb-4", children: "Actions" }), _jsxs("div", { className: "space-y-2", children: ["                ", _jsxs("button", { onClick: () => emailInvoice.mutate(sale.id), disabled: sale.isVoided || emailInvoice.isPending, className: "btn-outline btn-md w-full justify-start", children: [_jsx(Mail, { className: "w-4 h-4" }), " Email Invoice"] }), _jsxs("button", { onClick: () => whatsappInvoice.mutate(sale.id), disabled: sale.isVoided || whatsappInvoice.isPending, className: "btn-outline btn-md w-full justify-start", children: [_jsx(MessageCircle, { className: "w-4 h-4" }), " WhatsApp Invoice"] }), !sale.isVoided && (_jsxs("button", { onClick: () => {
                                                    if (confirm('Are you sure you want to void this sale?')) {
                                                        voidSale.mutate(sale.id);
                                                    }
                                                }, disabled: voidSale.isPending, className: "flex items-center gap-2 w-full px-4 py-2 border-2 border-red-200 rounded-xl hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: [_jsx(Trash2, { className: "w-4 h-4" }), " Void Sale"] }))] })] }), _jsxs("div", { className: "card p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-surface-900 mb-4", children: "Metadata" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-surface-500", children: "Created" }), _jsx("p", { className: "text-surface-900", children: sale.createdAt ? format(new Date(sale.createdAt), 'dd MMM yyyy, h:mm a') : '—' })] }), sale.isVoided && sale.voidedAt && (_jsxs("div", { children: [_jsx("p", { className: "text-surface-500", children: "Voided" }), _jsx("p", { className: "text-surface-900", children: format(new Date(sale.voidedAt), 'dd MMM yyyy, h:mm a') })] }))] })] })] })] })] }));
}
//# sourceMappingURL=page.js.map