'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard, Trash2, ToggleLeft, ToggleRight, Pencil, ChevronDown, ChevronRight, X, RefreshCw, Building2, } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
const emptyProviderForm = {
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    sortOrder: 0,
};
const emptyPlanForm = {
    providerId: '',
    label: '',
    tenureMonths: 3,
    minAmount: 0,
    maxAmount: '',
    annualRate: 14,
    processingFee: 0,
    sortOrder: 0,
};
// ─── Helpers ────────────────────────────────────────────────────────────
function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}
function formatDate(dateStr) {
    if (!dateStr)
        return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
// ─── Provider Form Modal ────────────────────────────────────────────────
function ProviderFormModal({ modal, onClose, onSave, saving, }) {
    const [form, setForm] = useState(modal.edit
        ? {
            name: modal.edit.name,
            slug: modal.edit.slug,
            description: modal.edit.description || '',
            logoUrl: modal.edit.logoUrl || '',
            sortOrder: modal.edit.sortOrder,
        }
        : emptyProviderForm);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40", onClick: onClose, children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-100", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: modal.edit ? 'Edit EMI Provider' : 'Create EMI Provider' }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: ["Provider Name ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { type: "text", value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), className: "input", placeholder: "Bajaj Finserv" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: ["Slug ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { type: "text", value: form.slug, onChange: (e) => setForm((f) => ({ ...f, slug: e.target.value })), className: `input font-mono text-sm ${modal.edit ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`, placeholder: "bajaj_finserv", disabled: !!modal.edit }), _jsx("p", { className: "text-[10px] text-gray-400 mt-0.5", children: modal.edit ? 'Slug cannot be changed after creation' : 'Lowercase, underscores, no spaces' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: form.description, onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })), className: "input min-h-[60px] resize-none", placeholder: "Flexible EMI options...", rows: 2 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Logo URL" }), _jsx("input", { type: "text", value: form.logoUrl, onChange: (e) => setForm((f) => ({ ...f, logoUrl: e.target.value })), className: "input text-sm", placeholder: "https://..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Sort Order" }), _jsx("input", { type: "number", value: form.sortOrder, onChange: (e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) })), className: "input text-sm", min: 0 })] })] })] }), _jsxs("div", { className: "px-6 py-4 bg-gray-50 flex justify-end gap-3", children: [_jsx("button", { onClick: onClose, className: "btn-outline btn-sm", children: "Cancel" }), _jsx("button", { onClick: () => onSave(form), disabled: saving || !form.name || !form.slug, className: "btn-primary btn-sm", children: saving ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: "w-3.5 h-3.5 animate-spin" }), "Saving..."] })) : (modal.edit ? 'Update Provider' : 'Create Provider') })] })] }) }));
}
// ─── Plan Form Modal ────────────────────────────────────────────────────
function PlanFormModal({ modal, providers, onClose, onSave, saving, }) {
    const [form, setForm] = useState(modal.edit
        ? {
            providerId: modal.edit.providerId,
            label: modal.edit.label,
            tenureMonths: modal.edit.tenureMonths,
            minAmount: modal.edit.minAmount,
            maxAmount: modal.edit.maxAmount ? String(modal.edit.maxAmount) : '',
            annualRate: modal.edit.annualRate,
            processingFee: modal.edit.processingFee,
            sortOrder: modal.edit.sortOrder,
        }
        : { ...emptyPlanForm, providerId: modal.providerId || (providers[0]?.id ?? '') });
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40", onClick: onClose, children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-100", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: modal.edit ? 'Edit EMI Plan' : 'Create EMI Plan' }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "p-6 space-y-4 max-h-[65vh] overflow-y-auto", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Provider" }), _jsx("select", { value: form.providerId, onChange: (e) => setForm((f) => ({ ...f, providerId: e.target.value })), className: "input text-sm", disabled: !!modal.providerId, children: providers.map((p) => (_jsx("option", { value: p.id, children: p.name }, p.id))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: ["Label ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { type: "text", value: form.label, onChange: (e) => setForm((f) => ({ ...f, label: e.target.value })), className: "input text-sm", placeholder: "6 Months" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Tenure (Months)" }), _jsx("input", { type: "number", value: form.tenureMonths, onChange: (e) => {
                                                const v = Number(e.target.value);
                                                setForm((f) => ({
                                                    ...f,
                                                    tenureMonths: v,
                                                    label: v > 0 ? `${v} Months` : f.label,
                                                }));
                                            }, className: "input text-sm", min: 1, max: 84 })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Min Amount (\u20B9)" }), _jsx("input", { type: "number", value: form.minAmount, onChange: (e) => setForm((f) => ({ ...f, minAmount: Number(e.target.value) })), className: "input text-sm", min: 0, step: 100 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Max Amount (\u20B9)" }), _jsx("input", { type: "number", value: form.maxAmount, onChange: (e) => setForm((f) => ({ ...f, maxAmount: e.target.value })), className: "input text-sm", min: 0, step: 100, placeholder: "Unlimited" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Annual Rate (%)" }), _jsx("input", { type: "number", value: form.annualRate, onChange: (e) => setForm((f) => ({ ...f, annualRate: Number(e.target.value) })), className: "input text-sm", min: 0, max: 100, step: 0.5 }), form.annualRate === 0 && (_jsx("p", { className: "text-[10px] text-emerald-600 font-medium mt-0.5", children: "\u2605 No Cost EMI" }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Processing Fee (\u20B9)" }), _jsx("input", { type: "number", value: form.processingFee, onChange: (e) => setForm((f) => ({ ...f, processingFee: Number(e.target.value) })), className: "input text-sm", min: 0, step: 50 })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Sort Order" }), _jsx("input", { type: "number", value: form.sortOrder, onChange: (e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) })), className: "input text-sm", min: 0 })] })] }), _jsxs("div", { className: "px-6 py-4 bg-gray-50 flex justify-end gap-3", children: [_jsx("button", { onClick: onClose, className: "btn-outline btn-sm", children: "Cancel" }), _jsx("button", { onClick: () => onSave(form), disabled: saving || !form.label || !form.providerId, className: "btn-primary btn-sm", children: saving ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: "w-3.5 h-3.5 animate-spin" }), "Saving..."] })) : (modal.edit ? 'Update Plan' : 'Create Plan') })] })] }) }));
}
// ─── Plan Row (Expandable) ──────────────────────────────────────────────
function PlanRow({ plan, onToggle, onEdit, onDelete, isToggling, }) {
    return (_jsx("div", { className: `flex items-center gap-3 px-4 py-3 border-b border-surface-100 last:border-b-0 hover:bg-surface-50 transition-colors ${!plan.isActive ? 'opacity-60' : ''}`, children: _jsxs("div", { className: "flex-1 grid grid-cols-6 gap-2 text-sm items-center", children: [_jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "font-medium text-surface-900", children: plan.label }), _jsxs("span", { className: "text-xs text-surface-400 ml-2", children: ["(", plan.tenureMonths, "mo)"] })] }), _jsx("div", { children: plan.annualRate === 0 ? (_jsx("span", { className: "text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full", children: "No Cost" })) : (_jsxs("span", { className: "text-surface-600", children: [Number(plan.annualRate), "% p.a."] })) }), _jsxs("div", { className: "text-surface-600", children: [formatCurrency(Number(plan.minAmount)), plan.maxAmount ? ` — ${formatCurrency(Number(plan.maxAmount))}` : '+'] }), _jsx("div", { className: "text-surface-600", children: Number(plan.processingFee) > 0 ? formatCurrency(Number(plan.processingFee)) : 'Free' }), _jsxs("div", { className: "flex items-center gap-1 justify-end", children: [_jsx("button", { onClick: () => onEdit(plan), className: "p-1.5 text-surface-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50", title: "Edit plan", children: _jsx(Pencil, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => onToggle(plan.id), disabled: isToggling, className: `p-1.5 rounded-lg transition-colors ${plan.isActive ? 'text-emerald-600 hover:text-amber-500 hover:bg-amber-50' : 'text-surface-400 hover:text-emerald-600 hover:bg-emerald-50'}`, title: plan.isActive ? 'Deactivate' : 'Activate', children: plan.isActive ? _jsx(ToggleRight, { className: "w-3.5 h-3.5" }) : _jsx(ToggleLeft, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => {
                                if (window.confirm(`Delete plan "${plan.label}"?`))
                                    onDelete(plan.id);
                            }, className: "p-1.5 text-surface-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50", title: "Delete plan", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] }) }));
}
// ─── Provider Card ──────────────────────────────────────────────────────
function ProviderCard({ provider, onToggleProvider, onEditProvider, onDeleteProvider, onAddPlan, onEditPlan, onTogglePlan, onDeletePlan, expanded, onToggleExpand, isToggling, }) {
    const activePlans = provider.plans?.filter((p) => p.isActive).length ?? 0;
    const totalPlans = provider.plans?.length ?? 0;
    return (_jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-50/50 transition-colors", onClick: onToggleExpand, children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${provider.isActive ? 'bg-primary/10' : 'bg-surface-100'}`, children: _jsx(CreditCard, { className: `w-5 h-5 ${provider.isActive ? 'text-primary' : 'text-surface-400'}` }) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: `font-semibold text-sm ${provider.isActive ? 'text-surface-900' : 'text-surface-400'}`, children: provider.name }), _jsx("span", { className: "text-[10px] font-mono text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded", children: provider.slug }), !provider.isActive && (_jsx("span", { className: "text-[10px] font-medium text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded", children: "Inactive" }))] }), provider.description && (_jsx("p", { className: "text-xs text-surface-500 mt-0.5 line-clamp-1", children: provider.description }))] })] }), _jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [_jsxs("span", { className: "text-xs text-surface-400", children: [activePlans, "/", totalPlans, " plans"] }), _jsx("span", { className: "text-[10px] text-surface-400 bg-surface-50 px-2 py-0.5 rounded-lg", children: formatDate(provider.createdAt) }), _jsxs("div", { className: "flex items-center gap-1", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => onToggleProvider(provider.id), disabled: isToggling, className: `p-1.5 rounded-lg transition-colors ${provider.isActive ? 'text-emerald-600 hover:text-amber-500 hover:bg-amber-50' : 'text-surface-400 hover:text-emerald-600 hover:bg-emerald-50'}`, title: provider.isActive ? 'Deactivate' : 'Activate', children: provider.isActive ? _jsx(ToggleRight, { className: "w-4 h-4" }) : _jsx(ToggleLeft, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => onEditProvider(provider), className: "p-1.5 text-surface-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50", title: "Edit provider", children: _jsx(Pencil, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => {
                                            if (window.confirm(`Delete provider "${provider.name}" and all its plans?`))
                                                onDeleteProvider(provider.id);
                                        }, className: "p-1.5 text-surface-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50", title: "Delete provider", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] }), expanded ? (_jsx(ChevronDown, { className: "w-4 h-4 text-surface-400" })) : (_jsx(ChevronRight, { className: "w-4 h-4 text-surface-400" }))] })] }), expanded && (_jsxs("div", { className: "border-t border-surface-100", children: [_jsxs("div", { className: "px-4 py-2 bg-surface-50/50 grid grid-cols-6 gap-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider", children: [_jsx("div", { className: "col-span-2", children: "Plan" }), _jsx("div", { children: "Rate" }), _jsx("div", { children: "Amount Range" }), _jsx("div", { children: "Fee" }), _jsx("div", { className: "text-right", children: "Actions" })] }), (!provider.plans || provider.plans.length === 0) ? (_jsxs("div", { className: "px-4 py-8 text-center", children: [_jsx("p", { className: "text-sm text-surface-400", children: "No plans yet for this provider." }), _jsx("button", { onClick: () => onAddPlan(provider.id), className: "text-xs text-primary font-medium hover:underline mt-1", children: "+ Add first plan" })] })) : (_jsxs(_Fragment, { children: [[...provider.plans]
                                .sort((a, b) => a.sortOrder - b.sortOrder)
                                .map((plan) => (_jsx(PlanRow, { plan: plan, onToggle: onTogglePlan, onEdit: onEditPlan, onDelete: onDeletePlan, isToggling: togglePlanMutation.isPending }, plan.id))), _jsx("div", { className: "px-4 py-3 border-t border-surface-100 bg-surface-50/30", children: _jsxs("button", { onClick: () => onAddPlan(provider.id), className: "flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), "Add Plan"] }) })] }))] }))] }));
}
// ─── Main Page ──────────────────────────────────────────────────────────
export default function EmiAdminPage() {
    const qc = useQueryClient();
    const [expandedProviderIds, setExpandedProviderIds] = useState(new Set());
    const [providerModal, setProviderModal] = useState({ open: false, edit: null });
    const [planModal, setPlanModal] = useState({ open: false, edit: null });
    // Fetch providers with plans
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['emi-providers'],
        queryFn: () => apiClient.get('/admin/emi/providers').then((r) => {
            const payload = r.data?.data ?? r.data ?? [];
            return Array.isArray(payload) ? payload : [];
        }),
    });
    const providers = Array.isArray(data) ? data : [];
    // ── Mutations ─────────────────────────────────────────────────────────
    const createProvider = useMutation({
        mutationFn: (form) => apiClient.post('/admin/emi/providers', form),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['emi-providers'] });
            setProviderModal({ open: false, edit: null });
            toast.success('EMI provider created');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create'),
    });
    const updateProvider = useMutation({
        mutationFn: ({ id, ...form }) => apiClient.patch(`/admin/emi/providers/${id}`, form),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['emi-providers'] });
            setProviderModal({ open: false, edit: null });
            toast.success('Provider updated');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update'),
    });
    const deleteProvider = useMutation({
        mutationFn: (id) => apiClient.delete(`/admin/emi/providers/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['emi-providers'] });
            toast.success('Provider deleted');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete'),
    });
    const createPlan = useMutation({
        mutationFn: (form) => apiClient.post('/admin/emi/plans', {
            ...form,
            maxAmount: form.maxAmount ? Number(form.maxAmount) : null,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['emi-providers'] });
            setPlanModal({ open: false, edit: null });
            toast.success('EMI plan created');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create plan'),
    });
    const updatePlan = useMutation({
        mutationFn: ({ id, ...form }) => apiClient.patch(`/admin/emi/plans/${id}`, {
            ...form,
            maxAmount: form.maxAmount ? Number(form.maxAmount) : null,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['emi-providers'] });
            setPlanModal({ open: false, edit: null });
            toast.success('Plan updated');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update plan'),
    });
    const deletePlan = useMutation({
        mutationFn: (id) => apiClient.delete(`/admin/emi/plans/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['emi-providers'] });
            toast.success('Plan deleted');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete plan'),
    });
    const toggleProviderMutation = useMutation({
        mutationFn: ({ id, isActive }) => apiClient.patch(`/admin/emi/providers/${id}`, { isActive: !isActive }),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ['emi-providers'] });
            toast.success(vars.isActive ? 'Deactivated' : 'Activated');
        },
        onError: () => toast.error('Failed to toggle provider status'),
    });
    const togglePlanMutation = useMutation({
        mutationFn: ({ id, isActive }) => apiClient.patch(`/admin/emi/plans/${id}`, { isActive: !isActive }),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ['emi-providers'] });
            toast.success(vars.isActive ? 'Deactivated' : 'Activated');
        },
        onError: () => toast.error('Failed to toggle plan status'),
    });
    // ── Stats ─────────────────────────────────────────────────────────────
    const totalProviders = providers.length;
    const totalActiveProviders = providers.filter((p) => p.isActive).length;
    const totalPlans = providers.reduce((sum, p) => sum + (p.plans?.length ?? 0), 0);
    const totalActivePlans = providers.reduce((sum, p) => sum + (p.plans?.filter((pl) => pl.isActive).length ?? 0), 0);
    // ── Render ────────────────────────────────────────────────────────────
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "EMI Plans" }), _jsx("p", { className: "text-sm text-surface-500", children: "Manage EMI providers and their installment plans" })] }), _jsxs("button", { onClick: () => setProviderModal({ open: true, edit: null }), className: "btn-primary btn-md", children: [_jsx(Plus, { className: "w-4 h-4" }), "Create Provider"] })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
                    { label: 'Providers', value: totalProviders, active: totalActiveProviders, icon: Building2, color: 'bg-blue-500' },
                    { label: 'Plans', value: totalPlans, active: totalActivePlans, icon: CreditCard, color: 'bg-emerald-500' },
                    { label: 'Active Providers', value: totalActiveProviders, icon: ToggleRight, color: 'bg-primary' },
                    { label: 'Inactive', value: totalProviders - totalActiveProviders, icon: ToggleLeft, color: 'bg-amber-500' },
                ].map((stat) => (_jsxs("div", { className: "card p-4 flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center shrink-0`, children: _jsx(stat.icon, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-extrabold text-surface-900", children: stat.value }), _jsxs("p", { className: "text-xs text-surface-400", children: [stat.label, 'active' in stat && _jsxs("span", { className: "ml-1", children: ["(", stat.active, " active)"] })] })] })] }, stat.label))) }), isLoading ? (_jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsx("div", { className: "card p-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-surface-100 animate-pulse rounded-xl" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 w-32 bg-surface-100 animate-pulse rounded-lg" }), _jsx("div", { className: "h-3 w-48 bg-surface-50 animate-pulse rounded-lg" })] }), _jsx("div", { className: "h-4 w-16 bg-surface-50 animate-pulse rounded-lg" })] }) }, i))) })) : isError ? (_jsxs("div", { className: "card p-12 text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3", children: _jsx(RefreshCw, { className: "w-6 h-6 text-red-500" }) }), _jsx("h3", { className: "font-semibold text-surface-900 mb-1", children: "Failed to load EMI data" }), _jsx("p", { className: "text-sm text-surface-500 mb-4", children: "Could not fetch EMI providers and plans." }), _jsx("button", { onClick: () => refetch(), className: "btn-primary btn-sm", children: "Try Again" })] })) : providers.length === 0 ? (_jsxs("div", { className: "card p-12 text-center", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-4", children: _jsx(CreditCard, { className: "w-7 h-7 text-surface-300" }) }), _jsx("h3", { className: "font-semibold text-surface-900 mb-1", children: "No EMI Providers" }), _jsx("p", { className: "text-sm text-surface-500 mb-5 max-w-xs mx-auto", children: "Create your first EMI provider to start offering installment payment options to customers." }), _jsxs("button", { onClick: () => setProviderModal({ open: true, edit: null }), className: "btn-primary btn-md", children: [_jsx(Plus, { className: "w-4 h-4" }), "Create Provider"] })] })) : (_jsx("div", { className: "space-y-3", children: providers.map((provider) => (_jsx(ProviderCard, { provider: provider, expanded: expandedProviderIds.has(provider.id), onToggleExpand: () => {
                        setExpandedProviderIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(provider.id))
                                next.delete(provider.id);
                            else
                                next.add(provider.id);
                            return next;
                        });
                    }, onToggleProvider: (id) => toggleProviderMutation.mutate({ id, isActive: provider.isActive }), onEditProvider: (p) => setProviderModal({ open: true, edit: p }), onDeleteProvider: (id) => deleteProvider.mutate(id), onAddPlan: (providerId) => setPlanModal({ open: true, edit: null, providerId }), onEditPlan: (plan) => setPlanModal({ open: true, edit: plan }), onTogglePlan: (id) => {
                        const plan = provider.plans?.find((p) => p.id === id);
                        if (plan)
                            togglePlanMutation.mutate({ id, isActive: plan.isActive });
                    }, onDeletePlan: (id) => deletePlan.mutate(id), isToggling: toggleProviderMutation.isPending || togglePlanMutation.isPending }, provider.id))) })), providerModal.open && (_jsx(ProviderFormModal, { modal: providerModal, onClose: () => setProviderModal({ open: false, edit: null }), onSave: (form) => {
                    if (providerModal.edit) {
                        const { slug, ...rest } = form;
                        updateProvider.mutate({ id: providerModal.edit.id, ...rest });
                    }
                    else {
                        createProvider.mutate(form);
                    }
                }, saving: createProvider.isPending || updateProvider.isPending })), planModal.open && (_jsx(PlanFormModal, { modal: planModal, providers: providers, onClose: () => setPlanModal({ open: false, edit: null }), onSave: (form) => {
                    if (planModal.edit) {
                        updatePlan.mutate({ id: planModal.edit.id, ...form });
                    }
                    else {
                        createPlan.mutate(form);
                    }
                }, saving: createPlan.isPending || updatePlan.isPending }))] }));
}
//# sourceMappingURL=page.js.map