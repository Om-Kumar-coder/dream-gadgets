'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, X, Phone, CheckCircle, XCircle, MoreHorizontal, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { toast } from 'react-hot-toast';
const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    contacted: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};
const STATUS_OPTIONS = ['pending', 'contacted', 'completed', 'rejected'];
function LeadDetailModal({ leadId, onClose, }) {
    const { data: leadData, isLoading } = useQuery({
        queryKey: ['buyback-lead', leadId],
        queryFn: () => apiClient.get(`/buyback/leads/${leadId}`).then((r) => r.data?.data ?? r.data),
    });
    const lead = leadData ?? null;
    if (isLoading) {
        return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-8 text-center", children: [_jsx("div", { className: "w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" }), _jsx("p", { className: "text-sm text-gray-500 mt-3", children: "Loading details..." })] }) }));
    }
    if (!lead) {
        return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-8 text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Lead not found" }), _jsx("button", { onClick: onClose, className: "mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50", children: "Close" })] }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Lead Details" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Brand" }), _jsx("p", { className: "font-medium", children: lead.brand })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Model" }), _jsx("p", { className: "font-medium", children: lead.modelName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Phone" }), _jsx("p", { className: "font-mono text-sm", children: lead.phone })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Device Type" }), _jsx("p", { className: "capitalize", children: lead.deviceType })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Status" }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium inline-block ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-600'}`, children: lead.status })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Submitted" }), _jsx("p", { className: "text-sm text-gray-600", children: lead.createdAt ? format(new Date(lead.createdAt), 'dd MMM yyyy, h:mm a') : '—' })] })] }), lead.screenCondition || lead.bodyCondition || lead.batteryHealth ? (_jsxs("div", { className: "border-t border-gray-100 pt-4", children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3", children: "Quick Assessment" }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Screen" }), _jsx("p", { className: "text-sm font-medium", children: lead.screenCondition || '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Body" }), _jsx("p", { className: "text-sm font-medium", children: lead.bodyCondition || '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Battery" }), _jsx("p", { className: "text-sm font-medium", children: lead.batteryHealth || '—' })] })] })] })) : null, lead.functionalIssues ? (_jsxs("div", { className: "border-t border-gray-100 pt-4", children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3", children: "Functional Issues" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: lead.functionalIssues.split(',').map((issue, i) => (_jsx("span", { className: "text-[11px] px-2 py-1 rounded-lg bg-red-50 text-red-700 font-medium", children: issue.trim() }, i))) })] })) : null, lead.photos && lead.photos.length > 0 ? (_jsxs("div", { className: "border-t border-gray-100 pt-4", children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3", children: ["Device Photos (", lead.photos.length, ")"] }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: lead.photos.map((photo) => (_jsx("a", { href: photo.url, target: "_blank", rel: "noopener noreferrer", className: "aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:opacity-90 transition-opacity", children: _jsx("img", { src: photo.url, alt: "Device photo", className: "w-full h-full object-cover" }) }, photo.id))) })] })) : null, _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Notes" }), _jsx("p", { className: "text-sm text-gray-600 bg-gray-50 rounded-lg p-3", children: lead.notes || 'No notes' })] })] }), _jsx("div", { className: "px-6 py-4 bg-gray-50 flex justify-end", children: _jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", children: "Close" }) })] }) }));
}
function StatusUpdateMenu({ lead, onUpdate, onClose, }) {
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: onClose }), _jsxs("div", { className: "absolute right-0 top-6 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1", children: [_jsx("p", { className: "px-4 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Set Status" }), STATUS_OPTIONS.filter((s) => s !== lead.status).map((status) => (_jsxs("button", { onClick: () => {
                            onUpdate(status);
                            onClose();
                        }, className: "flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left capitalize", children: [status === 'contacted' && _jsx(Phone, { className: "w-3.5 h-3.5 text-blue-500" }), status === 'completed' && _jsx(CheckCircle, { className: "w-3.5 h-3.5 text-green-500" }), status === 'rejected' && _jsx(XCircle, { className: "w-3.5 h-3.5 text-red-500" }), status === 'pending' && _jsx(MessageSquare, { className: "w-3.5 h-3.5 text-yellow-500" }), status] }, status)))] })] }));
}
export default function BuybackLeadsPage() {
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const updateStatus = useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await apiClient.patch(`/buyback/leads/${id}`, { status });
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['buyback-leads'] });
            toast.success('Lead status updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });
    const columns = [
        {
            accessorKey: 'device',
            header: 'Device',
            cell: ({ row }) => (_jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: [row.original.brand, " ", _jsx("span", { className: "font-normal", children: row.original.modelName })] }), _jsx("p", { className: "text-xs text-gray-400 capitalize", children: row.original.deviceType })] })),
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) => (_jsx("a", { href: `tel:${row.original.phone}`, className: "font-mono text-xs text-blue-600 hover:underline", children: row.original.phone })),
        },
        {
            accessorKey: 'assessment',
            header: 'Condition',
            cell: ({ row }) => {
                const { screenCondition, bodyCondition, batteryHealth } = row.original;
                if (!screenCondition && !bodyCondition && !batteryHealth) {
                    return _jsx("span", { className: "text-xs text-gray-400", children: "\u2014" });
                }
                return (_jsxs("div", { className: "flex flex-wrap gap-1 max-w-[200px]", children: [screenCondition && (_jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium whitespace-nowrap", title: "Screen", children: screenCondition })), bodyCondition && (_jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium whitespace-nowrap", title: "Body", children: bodyCondition })), batteryHealth && (_jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium whitespace-nowrap", title: "Battery", children: batteryHealth }))] }));
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row.original.status] ?? 'bg-gray-100 text-gray-600'}`, children: row.original.status })),
        },
        {
            accessorKey: 'createdAt',
            header: 'Submitted',
            cell: ({ row }) => (_jsx("span", { className: "text-surface-500 text-xs", children: row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy') : '—' })),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const [showMenu, setShowMenu] = useState(false);
                return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => setSelectedLeadId(row.original.id), className: "p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100", title: "View details", children: _jsx(Eye, { className: "w-3.5 h-3.5" }) }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowMenu(!showMenu), className: "p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100", title: "Update status", children: _jsx(MoreHorizontal, { className: "w-3.5 h-3.5" }) }), showMenu && (_jsx(StatusUpdateMenu, { lead: row.original, onUpdate: (status) => updateStatus.mutate({ id: row.original.id, status }), onClose: () => setShowMenu(false) }))] })] }));
            },
        },
    ];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Buyback Leads" }), _jsx("p", { className: "text-sm text-surface-500", children: "Customer sell/buyback requests submitted from the website" })] }) }), _jsx("div", { className: "flex gap-2", children: ['', ...STATUS_OPTIONS].map((status) => (_jsx("button", { onClick: () => setStatusFilter(status), className: `badge text-xs px-3 py-1.5 transition-colors capitalize ${statusFilter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'badge-neutral cursor-pointer hover:bg-surface-200'}`, children: status || 'All' }, status || 'all'))) }), _jsx(DataTable, { columns: columns, queryKey: ['buyback-leads', statusFilter], apiEndpoint: "/buyback/leads", enableSorting: true, enableFilters: false, enablePagination: true, pageSize: 20, renderNoResults: () => (_jsxs("div", { className: "py-12 text-center", children: [_jsx("div", { className: "text-gray-400 text-4xl mb-2", children: "\uD83D\uDCCB" }), _jsx("p", { className: "text-gray-500", children: "No buyback leads found" }), statusFilter && (_jsx("button", { onClick: () => setStatusFilter(''), className: "text-blue-600 hover:underline text-sm mt-2", children: "Clear status filter" }))] })) }), selectedLeadId && (_jsx(LeadDetailModal, { leadId: selectedLeadId, onClose: () => setSelectedLeadId(null) }))] }));
}
//# sourceMappingURL=page.js.map