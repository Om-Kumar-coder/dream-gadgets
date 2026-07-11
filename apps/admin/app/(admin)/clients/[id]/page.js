'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
export default function ClientDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const qc = useQueryClient();
    const { data: clientData, isLoading } = useQuery({
        queryKey: ['client', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/clients/${id}`);
            return data.data;
        },
    });
    const { data: historyData } = useQuery({
        queryKey: ['client-history', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/clients/${id}/history`);
            return data.data;
        },
    });
    const verifyEkyc = useMutation({
        mutationFn: () => apiClient.patch(`/clients/${id}/ekyc/verify`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['client', id] }),
    });
    if (isLoading) {
        return _jsx("div", { className: "text-surface-400 py-8 text-center", children: "Loading\u2026" });
    }
    const client = clientData;
    return (_jsxs("div", { className: "max-w-4xl space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => router.back(), className: "p-1.5 rounded-lg hover:bg-surface-100 transition-colors", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsxs("h1", { className: "heading-sm text-surface-900", children: [client?.firstName, " ", client?.lastName] }), _jsx("p", { className: "text-sm text-surface-500", children: client?.phone })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5", children: [_jsxs("div", { className: "lg:col-span-2 card p-5 space-y-4", children: [_jsx("h2", { className: "font-medium text-surface-800", children: "Profile" }), _jsx("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
                                    ['First Name', client?.firstName],
                                    ['Last Name', client?.lastName],
                                    ['Phone', client?.phone],
                                    ['Alt Phone', client?.alternatePhone ?? '—'],
                                    ['Email', client?.email ?? '—'],
                                    ['Gender', client?.gender ?? '—'],
                                    ['Date of Birth', client?.dateOfBirth ? format(new Date(client.dateOfBirth), 'dd MMM yyyy') : '—'],
                                    ['Customer Type', client?.customerType ?? '—'],
                                    ['ID Proof', client?.idProofType ? `${client.idProofType}: ${client.idProofNumber}` : '—'],
                                    ['Branch', client?.branch?.name ?? '—'],
                                ].map(([label, value]) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: label }), _jsx("p", { className: "font-medium text-surface-800 mt-0.5", children: value })] }, label))) }), client?.address && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500", children: "Address" }), _jsx("p", { className: "text-sm text-surface-800 mt-0.5", children: client.address })] }))] }), _jsxs("div", { className: "card p-5 space-y-4", children: [_jsx("h2", { className: "font-medium text-surface-800", children: "EKYC Status" }), _jsx("div", { className: `text-sm px-3 py-2 rounded-lg font-medium ${client?.ekycStatus === 'verified'
                                    ? 'badge-success'
                                    : client?.ekycStatus === 'pending'
                                        ? 'badge-warning'
                                        : 'badge-neutral'}`, children: client?.ekycStatus ?? 'Not submitted' }), client?.ekycStatus === 'pending' && (_jsxs("button", { onClick: () => verifyEkyc.mutate(), disabled: verifyEkyc.isPending, className: "w-full btn-primary btn-md", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), verifyEkyc.isPending ? 'Verifying…' : 'Verify EKYC'] })), (!client?.ekycStatus || client?.ekycStatus === 'rejected') && (_jsxs("label", { className: "flex items-center gap-2 border-2 border-dashed border-surface-200 rounded-lg p-3 cursor-pointer hover:border-primary/40 transition-colors", children: [_jsx(Upload, { className: "w-4 h-4 text-surface-400" }), _jsx("span", { className: "text-xs text-surface-500", children: "Upload ID documents" }), _jsx("input", { type: "file", accept: "image/*,.pdf", multiple: true, className: "hidden" })] }))] })] }), _jsxs("div", { className: "card p-5 space-y-4", children: [_jsx("h2", { className: "font-medium text-surface-800", children: "Transaction History" }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm", children: [
                            ['Sales', historyData?.sales?.length ?? 0],
                            ['Purchases', historyData?.purchases?.length ?? 0],
                            ['Exchanges', historyData?.exchanges?.length ?? 0],
                            ['Returns', historyData?.returns?.length ?? 0],
                        ].map(([label, count]) => (_jsxs("div", { className: "bg-surface-50 rounded-lg p-3 text-center", children: [_jsx("p", { className: "text-2xl font-bold text-surface-900", children: count }), _jsx("p", { className: "text-xs text-surface-500 mt-0.5", children: label })] }, label))) }), historyData?.sales?.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-surface-700 mb-2", children: "Recent Sales" }), _jsx("div", { className: "space-y-2", children: historyData.sales.slice(0, 5).map((s) => (_jsxs("div", { className: "flex items-center justify-between text-sm py-2 border-b border-surface-100 last:border-0", children: [_jsx("span", { className: "font-mono text-xs text-surface-500", children: s.invoiceNumber }), _jsxs("span", { className: "font-medium", children: ["\u20B9", Number(s.totalAmount).toLocaleString()] }), _jsx("span", { className: "text-xs text-surface-400", children: s.saleDate ? format(new Date(s.saleDate), 'dd MMM yyyy') : '—' })] }, s.id))) })] }))] })] }));
}
//# sourceMappingURL=page.js.map