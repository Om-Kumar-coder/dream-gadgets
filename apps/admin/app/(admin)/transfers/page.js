'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { toast } from 'react-hot-toast';
import { Modal } from '@dream-gadgets/ui';
import { Button } from '@dream-gadgets/ui';
import { Form, FormField, FormActions } from '@dream-gadgets/ui';
import { useRealtimeUpdates } from '@/lib/useRealtimeUpdates';
const STATUS_COLORS = {
    draft: 'bg-gray-100 text-gray-600',
    initiated: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-yellow-100 text-yellow-700',
    received: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};
export default function TransfersPage() {
    const qc = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [showView, setShowView] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    // Auto-refresh on transfer events
    useRealtimeUpdates({
        'stock.transfer.created': [['transfers']],
        'stock.transfer.received': [['transfers']],
        'stock.transfer.updated': [['transfers']],
    });
    const columns = [
        {
            accessorKey: 'transferNumber',
            header: 'Transfer #',
            cell: ({ row }) => _jsx("span", { className: "font-mono text-xs", children: row.original.transferNumber }),
        },
        {
            accessorKey: 'fromBranch',
            header: 'From',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.fromBranch?.name }),
        },
        {
            accessorKey: 'toBranch',
            header: 'To',
            cell: ({ row }) => _jsx("span", { className: "text-sm", children: row.original.toBranch?.name }),
        },
        {
            accessorKey: 'items',
            header: 'Items',
            cell: ({ row }) => _jsx("span", { children: row.original.items?.length ?? 0 }),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row.original.status] ?? 'bg-gray-100 text-gray-600'}`, children: row.original.status })),
        },
        {
            accessorKey: 'initiatedAt',
            header: 'Date',
            cell: ({ row }) => (_jsx("span", { className: "text-gray-500 text-xs", children: row.original.initiatedAt ? format(new Date(row.original.initiatedAt), 'dd MMM yyyy') : '—' })),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => _jsx(TransferActions, { transfer: row.original }),
        },
    ];
    const createMutation = useMutation({
        mutationFn: async (data) => {
            const { data: result } = await apiClient.post('/transfers', data);
            return result;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['transfers'] });
            setShowCreate(false);
            toast.success('Transfer created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create transfer');
        },
    });
    const receiveMutation = useMutation({
        mutationFn: async ({ id, itemIds }) => {
            const { data } = await apiClient.patch(`/transfers/${id}/receive`, { itemIds });
            return data;
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['transfers'] });
            toast.success('Transfer received');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to receive transfer');
        },
    });
    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }) => {
            const { data } = await apiClient.patch(`/transfers/${id}/reject`, { reason });
            return data;
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['transfers'] });
            toast.success('Transfer rejected');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to reject transfer');
        },
    });
    const TransferActions = ({ transfer }) => {
        const [showMenu, setShowMenu] = useState(false);
        return (_jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowMenu(!showMenu), className: "text-gray-600 hover:text-blue-600 transition-colors", children: _jsx(CheckCircle, { className: "w-4 h-4" }) }), showMenu && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setShowMenu(false) }), _jsxs("div", { className: "absolute right-0 top-6 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1", children: [_jsxs("button", { onClick: () => {
                                        setSelectedTransfer(transfer);
                                        setShowView(true);
                                        setShowMenu(false);
                                    }, className: "flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left", children: [_jsx(Eye, { className: "w-3.5 h-3.5" }), " View Details"] }), transfer.status === 'initiated' && (_jsxs("button", { onClick: () => {
                                        receiveMutation.mutate({ id: transfer.id, itemIds: transfer.items.map(i => i.itemId) });
                                        setShowMenu(false);
                                    }, disabled: receiveMutation.isPending, className: "flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left", children: [_jsx(CheckCircle, { className: "w-3.5 h-3.5" }), " Receive All"] })), transfer.status === 'initiated' && (_jsxs("button", { onClick: () => {
                                        const reason = prompt('Enter rejection reason:');
                                        if (reason) {
                                            rejectMutation.mutate({ id: transfer.id, reason });
                                            setShowMenu(false);
                                        }
                                    }, disabled: rejectMutation.isPending, className: "flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left", children: [_jsx(XCircle, { className: "w-3.5 h-3.5" }), " Reject"] })), _jsxs("a", { href: `/api/v1/transfers/${transfer.id}/manifest`, target: "_blank", rel: "noreferrer", className: "flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left", children: [_jsx(FileText, { className: "w-3.5 h-3.5" }), " Manifest PDF"] })] })] }))] }));
    };
    const CreateTransferForm = () => {
        const [fromBranchId, setFromBranchId] = useState('');
        const [toBranchId, setToBranchId] = useState('');
        const [itemIds, setItemIds] = useState('');
        const [notes, setNotes] = useState('');
        return (_jsxs(Form, { onSubmit: (e) => {
                e.preventDefault();
                createMutation.mutate({
                    fromBranchId,
                    toBranchId,
                    itemIds: itemIds.split(',').map(s => s.trim()).filter(Boolean),
                    notes: notes || undefined,
                });
            }, children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(FormField, { label: "From Branch", required: true, children: _jsxs("select", { value: fromBranchId, onChange: (e) => setFromBranchId(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "", children: "Select source branch" }), _jsx("option", { value: "branch1", children: "Branch 1" }), _jsx("option", { value: "branch2", children: "Branch 2" })] }) }), _jsx(FormField, { label: "To Branch", required: true, children: _jsxs("select", { value: toBranchId, onChange: (e) => setToBranchId(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "", children: "Select destination branch" }), _jsx("option", { value: "branch1", children: "Branch 1" }), _jsx("option", { value: "branch2", children: "Branch 2" })] }) })] }), _jsx(FormField, { label: "Item IDs (comma-separated)", required: true, children: _jsx("input", { type: "text", value: itemIds, onChange: (e) => setItemIds(e.target.value), placeholder: "uuid1, uuid2, ...", className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", required: true }) }), _jsx(FormField, { label: "Notes", children: _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 2, className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" }) })] }), _jsx(FormActions, { onCancel: () => setShowCreate(false), submitText: "Create Transfer", submitDisabled: createMutation.isPending })] }));
    };
    const TransferDetails = () => {
        if (!selectedTransfer)
            return null;
        return (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Transfer #" }), _jsx("p", { className: "font-mono text-sm", children: selectedTransfer.transferNumber })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Status" }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedTransfer.status] ?? 'bg-gray-100 text-gray-600'}`, children: selectedTransfer.status })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "From" }), _jsx("p", { className: "text-sm", children: selectedTransfer.fromBranch?.name })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "To" }), _jsx("p", { className: "text-sm", children: selectedTransfer.toBranch?.name })] }), _jsxs("div", { className: "col-span-2", children: [_jsxs("p", { className: "text-xs text-gray-500", children: ["Items (", selectedTransfer.items?.length, ")"] }), _jsx("div", { className: "mt-1 space-y-1", children: selectedTransfer.items?.map((item) => (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "font-mono text-xs", children: item.imei }), _jsx("span", { className: "text-gray-500 text-xs", children: item.status })] }, item.id))) })] }), selectedTransfer.notes && (_jsxs("div", { className: "col-span-2", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Notes" }), _jsx("p", { className: "text-sm", children: selectedTransfer.notes })] }))] }) }));
    };
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Stock Transfers" }), _jsx("p", { className: "text-sm text-surface-500", children: "Move inventory between branches" })] }), _jsxs(Button, { variant: "default", size: "md", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Transfer"] })] }), _jsx(DataTable, { columns: columns, queryKey: ['transfers'], apiEndpoint: "/transfers", enableSorting: true, enableFilters: true, enablePagination: true, pageSize: 20 }), _jsx(Modal, { isOpen: showCreate, onClose: () => setShowCreate(false), title: "Create Transfer", size: "lg", children: _jsx(CreateTransferForm, {}) }), _jsx(Modal, { isOpen: showView, onClose: () => setShowView(false), title: "Transfer Details", size: "lg", children: _jsx(TransferDetails, {}) })] }));
}
//# sourceMappingURL=page.js.map