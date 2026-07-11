'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Search, Eye, Edit, Trash2, Loader2, XCircle, } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';
import { Modal } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';
const STATUS_BADGES = {
    approved: { label: 'Approved', class: 'bg-green-50 text-green-700 border-green-200' },
    pending: { label: 'Pending', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    rejected: { label: 'Rejected', class: 'bg-red-50 text-red-700 border-red-200' },
    draft: { label: 'Draft', class: 'bg-surface-50 text-surface-600 border-surface-200' },
};
const CATEGORIES = ['transactional', 'marketing', 'otp', 'authentication', 'utility'];
export default function WhatsAppTemplatesPage() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [viewingTemplate, setViewingTemplate] = useState(null);
    // Form state
    const [formName, setFormName] = useState('');
    const [formCategory, setFormCategory] = useState('transactional');
    const [formLanguage, setFormLanguage] = useState('en');
    const [formBody, setFormBody] = useState('');
    const [formHeader, setFormHeader] = useState('');
    const [formFooter, setFormFooter] = useState('');
    const { data: templates, isLoading } = useQuery({
        queryKey: ['whatsapp-templates', search, categoryFilter],
        queryFn: async () => {
            const params = { limit: '100' };
            if (search)
                params.search = search;
            if (categoryFilter)
                params.category = categoryFilter;
            const { data } = await apiClient.get('/whatsapp/templates', { params });
            // TransformInterceptor wraps: { status, data: { data: [], ... } }
            const raw = data?.data ?? data ?? {};
            return Array.isArray(raw) ? raw : (raw.data ?? []);
        },
    });
    const templateList = templates ?? [];
    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (payload) => {
            await apiClient.post('/whatsapp/templates', payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-templates'] });
            setShowCreate(false);
            resetForm();
            toast.success('Template created');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create template');
        },
    });
    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...payload }) => {
            await apiClient.patch(`/whatsapp/templates/${id}`, payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-templates'] });
            setEditingTemplate(null);
            resetForm();
            toast.success('Template updated');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update template');
        },
    });
    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.delete(`/whatsapp/templates/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-templates'] });
            toast.success('Template deleted');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete template');
        },
    });
    const resetForm = () => {
        setFormName('');
        setFormCategory('transactional');
        setFormLanguage('en');
        setFormBody('');
        setFormHeader('');
        setFormFooter('');
    };
    const openEdit = (t) => {
        setEditingTemplate(t);
        setFormName(t.name);
        setFormCategory(t.category);
        setFormLanguage(t.language);
        setFormBody(t.body);
        setFormHeader(t.headerValue ?? '');
        setFormFooter(t.footer ?? '');
    };
    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name: formName,
            category: formCategory,
            language: formLanguage,
            body: formBody,
            headerValue: formHeader || undefined,
            footer: formFooter || undefined,
        };
        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, ...payload });
        }
        else {
            createMutation.mutate(payload);
        }
    };
    return (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { children: _jsxs("p", { className: "text-sm text-surface-500", children: [templateList.length, " template", templateList.length !== 1 ? 's' : ''] }) }), _jsxs(Button, { variant: "default", size: "md", onClick: openCreate, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Template"] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative flex-1 max-w-xs", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search templates\u2026", className: "w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" })] }), _jsxs("select", { value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), className: "border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all", children: [_jsx("option", { value: "", children: "All Categories" }), CATEGORIES.map((c) => (_jsx("option", { value: c, children: c.charAt(0).toUpperCase() + c.slice(1) }, c)))] })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-16", children: _jsx(Loader2, { className: "w-6 h-6 text-surface-300 animate-spin" }) })) : templateList.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-surface-400", children: [_jsx(FileText, { className: "w-12 h-12 mb-3" }), _jsx("p", { className: "text-sm font-medium", children: "No templates yet" }), _jsx("p", { className: "text-xs mb-4", children: "Create your first WhatsApp message template" }), _jsxs(Button, { variant: "default", size: "sm", onClick: openCreate, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Template"] })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: templateList.map((tpl) => {
                    const statusInfo = STATUS_BADGES[tpl.status] ?? STATUS_BADGES.draft;
                    return (_jsxs("div", { className: "bg-white border border-surface-100 rounded-2xl p-5 hover:shadow-elevation-2 hover:border-surface-200 transition-all duration-200", children: [_jsx("div", { className: "flex items-start justify-between mb-3", children: _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h3", { className: "text-sm font-bold text-surface-900 truncate", children: tpl.name }), _jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${statusInfo.class}`, children: statusInfo.label })] }), _jsxs("div", { className: "flex items-center gap-2 text-[10px] text-surface-400", children: [_jsx("span", { className: "px-1.5 py-0.5 bg-surface-50 rounded font-medium capitalize", children: tpl.category }), _jsx("span", { children: tpl.language.toUpperCase() })] })] }) }), _jsx("div", { className: "bg-surface-50 rounded-xl p-3 mb-3 max-h-24 overflow-y-auto", children: _jsx("p", { className: "text-xs text-surface-600 whitespace-pre-wrap line-clamp-4", children: tpl.body || 'No body content' }) }), tpl.footer && (_jsx("p", { className: "text-[10px] text-surface-400 mb-3 truncate", children: tpl.footer })), tpl.rejectionReason && (_jsxs("div", { className: "flex items-start gap-1.5 mb-3 text-[10px] text-red-600 bg-red-50 rounded-lg px-2 py-1.5", children: [_jsx(XCircle, { className: "w-3 h-3 shrink-0 mt-0.5" }), _jsx("span", { children: tpl.rejectionReason })] })), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-surface-100", children: [_jsxs("span", { className: "text-[10px] text-surface-400", children: ["Updated ", new Date(tpl.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => setViewingTemplate(tpl), className: "p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-lg transition-all", title: "View", children: _jsx(Eye, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => openEdit(tpl), className: "p-1.5 text-surface-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all", title: "Edit", children: _jsx(Edit, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => {
                                                    if (confirm(`Delete template "${tpl.name}"?`)) {
                                                        deleteMutation.mutate(tpl.id);
                                                    }
                                                }, className: "p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all", title: "Delete", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] })] }, tpl.id));
                }) })), _jsx(Modal, { isOpen: showCreate || !!editingTemplate, onClose: () => { setShowCreate(false); setEditingTemplate(null); resetForm(); }, title: editingTemplate ? 'Edit Template' : 'Create Template', size: "lg", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-700 mb-1.5", children: "Template Name *" }), _jsx("input", { type: "text", value: formName, onChange: (e) => setFormName(e.target.value), className: "w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all", placeholder: "order_confirmation", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-700 mb-1.5", children: "Category" }), _jsx("select", { value: formCategory, onChange: (e) => setFormCategory(e.target.value), className: "w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all", children: CATEGORIES.map((c) => (_jsx("option", { value: c, children: c.charAt(0).toUpperCase() + c.slice(1) }, c))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-700 mb-1.5", children: "Header (optional)" }), _jsx("input", { type: "text", value: formHeader, onChange: (e) => setFormHeader(e.target.value), className: "w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all", placeholder: "Your order has been confirmed!" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-700 mb-1.5", children: "Body *" }), _jsx("textarea", { value: formBody, onChange: (e) => setFormBody(e.target.value), className: "w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none", rows: 5, placeholder: "Dear {{name}}, your order {{orderNumber}} has been confirmed!", required: true }), _jsxs("p", { className: "text-[10px] text-surface-400 mt-1", children: ["Use ", '{{variable}}', " for dynamic values"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-700 mb-1.5", children: "Footer (optional)" }), _jsx("input", { type: "text", value: formFooter, onChange: (e) => setFormFooter(e.target.value), className: "w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all", placeholder: "\u2014 Dream Gadgets Team" })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-3 border-t border-surface-100", children: [_jsx("button", { type: "button", onClick: () => { setShowCreate(false); setEditingTemplate(null); resetForm(); }, className: "px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-800 transition-colors", children: "Cancel" }), _jsx(Button, { type: "submit", variant: "default", size: "sm", disabled: !formName.trim() || !formBody.trim() || createMutation.isPending || updateMutation.isPending, children: createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTemplate ? 'Update' : 'Create' })] })] }) }), _jsx(Modal, { isOpen: !!viewingTemplate, onClose: () => setViewingTemplate(null), title: viewingTemplate?.name ?? '', size: "lg", children: viewingTemplate && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Category" }), _jsx("p", { className: "text-sm font-medium capitalize", children: viewingTemplate.category })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Language" }), _jsx("p", { className: "text-sm font-medium", children: viewingTemplate.language.toUpperCase() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Status" }), _jsx("span", { className: `inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_BADGES[viewingTemplate.status]?.class ?? ''}`, children: viewingTemplate.status })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Template ID" }), _jsx("p", { className: "text-sm font-mono", children: viewingTemplate.templateId || 'Not submitted' })] })] }), viewingTemplate.headerValue && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400 mb-1", children: "Header" }), _jsx("div", { className: "bg-surface-50 rounded-xl p-3", children: _jsx("p", { className: "text-sm font-medium", children: viewingTemplate.headerValue }) })] })), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400 mb-1", children: "Body" }), _jsx("div", { className: "bg-surface-50 rounded-xl p-3 max-h-48 overflow-y-auto", children: _jsx("p", { className: "text-sm whitespace-pre-wrap", children: viewingTemplate.body }) })] }), viewingTemplate.footer && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400 mb-1", children: "Footer" }), _jsx("p", { className: "text-sm text-surface-500", children: viewingTemplate.footer })] })), viewingTemplate.rejectionReason && (_jsxs("div", { className: "p-3 bg-red-50 border border-red-200 rounded-xl", children: [_jsx("p", { className: "text-xs font-medium text-red-700 mb-1", children: "Rejection Reason" }), _jsx("p", { className: "text-sm text-red-600", children: viewingTemplate.rejectionReason })] })), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-surface-100 text-[10px] text-surface-400", children: [_jsxs("span", { children: ["Created: ", new Date(viewingTemplate.createdAt).toLocaleString('en-IN')] }), _jsxs("span", { children: ["Updated: ", new Date(viewingTemplate.updatedAt).toLocaleString('en-IN')] })] })] })) })] }));
}
//# sourceMappingURL=page.js.map