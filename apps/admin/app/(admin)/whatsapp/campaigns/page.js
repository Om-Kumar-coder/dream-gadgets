'use client';
import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, Plus, Search, Send, Play, Loader2, CheckCircle, XCircle, Clock, Users, Eye, TrendingUp, MessageSquare, Target, } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';
import { Modal } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';
const STATUS_BADGES = {
    draft: { label: 'Draft', class: 'bg-surface-50 text-surface-600 border-surface-200' },
    scheduled: { label: 'Scheduled', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    sending: { label: 'Sending', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    sent: { label: 'Sent', class: 'bg-green-50 text-green-700 border-green-200' },
    completed: { label: 'Completed', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    failed: { label: 'Failed', class: 'bg-red-50 text-red-700 border-red-200' },
};
const CAMPAIGN_TYPES = ['broadcast', 'segmented', 'triggered', 'ab_test'];
export default function WhatsAppCampaignsPage() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [viewingCampaign, setViewingCampaign] = useState(null);
    // Form state
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formType, setFormType] = useState('broadcast');
    const [formTemplateId, setFormTemplateId] = useState('');
    const { data: campaigns, isLoading } = useQuery({
        queryKey: ['whatsapp-campaigns', search, statusFilter],
        queryFn: async () => {
            const params = { limit: '100' };
            if (search)
                params.search = search;
            if (statusFilter)
                params.status = statusFilter;
            const { data } = await apiClient.get('/whatsapp/campaigns', { params });
            // TransformInterceptor wraps: { status, data: { data: [], ... } }
            const raw = data?.data ?? data ?? {};
            return Array.isArray(raw) ? raw : (raw.data ?? []);
        },
    });
    const { data: templatesData } = useQuery({
        queryKey: ['whatsapp-templates-select'],
        queryFn: async () => {
            const { data } = await apiClient.get('/whatsapp/templates', { params: { limit: '100' } });
            const raw = data?.data ?? data ?? {};
            return (Array.isArray(raw) ? raw : (raw.data ?? []));
        },
    });
    const campaignList = campaigns ?? [];
    const templates = templatesData ?? [];
    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (payload) => {
            await apiClient.post('/whatsapp/campaigns', payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
            setShowCreate(false);
            setFormName('');
            setFormDesc('');
            toast.success('Campaign created');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create campaign');
        },
    });
    // Launch mutation
    const launchMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.post(`/whatsapp/campaigns/${id}/launch`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
            toast.success('Campaign launched!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to launch campaign');
        },
    });
    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.delete(`/whatsapp/campaigns/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
            toast.success('Campaign deleted');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete campaign');
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            toast.error('Campaign name is required');
            return;
        }
        createMutation.mutate({
            name: formName.trim(),
            description: formDesc.trim() || undefined,
            type: formType,
            templateId: formTemplateId || undefined,
        });
    };
    return (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { children: _jsxs("p", { className: "text-sm text-surface-500", children: [campaignList.length, " campaign", campaignList.length !== 1 ? 's' : ''] }) }), _jsxs(Button, { variant: "default", size: "md", onClick: () => setShowCreate(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Campaign"] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative flex-1 max-w-xs", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search campaigns\u2026", className: "w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" })] }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "scheduled", children: "Scheduled" }), _jsx("option", { value: "sending", children: "Sending" }), _jsx("option", { value: "sent", children: "Sent" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "failed", children: "Failed" })] })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-16", children: _jsx(Loader2, { className: "w-6 h-6 text-surface-300 animate-spin" }) })) : campaignList.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-surface-400", children: [_jsx(BarChart3, { className: "w-12 h-12 mb-3" }), _jsx("p", { className: "text-sm font-medium", children: "No campaigns yet" }), _jsx("p", { className: "text-xs mb-4", children: "Create your first WhatsApp marketing campaign" }), _jsxs(Button, { variant: "default", size: "sm", onClick: () => setShowCreate(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Campaign"] })] })) : (_jsx("div", { className: "space-y-4", children: campaignList.map((camp) => {
                    const statusInfo = STATUS_BADGES[camp.status] ?? STATUS_BADGES.draft;
                    const isDraft = camp.status === 'draft';
                    const deliveryRate = camp.totalRecipients > 0
                        ? Math.round((camp.deliveredCount / camp.totalRecipients) * 100)
                        : 0;
                    const readRate = camp.deliveredCount > 0
                        ? Math.round((camp.readCount / camp.deliveredCount) * 100)
                        : 0;
                    return (_jsxs("div", { className: "bg-white border border-surface-100 rounded-2xl p-5 hover:shadow-elevation-2 transition-all duration-200", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h3", { className: "text-base font-bold text-surface-900 truncate", children: camp.name }), _jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusInfo.class}`, children: statusInfo.label }), _jsx("span", { className: "text-[10px] text-surface-400 capitalize px-1.5 py-0.5 bg-surface-50 rounded", children: camp.type })] }), camp.description && (_jsx("p", { className: "text-xs text-surface-400 truncate", children: camp.description }))] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [isDraft && (_jsxs("button", { onClick: () => launchMutation.mutate(camp.id), disabled: launchMutation.isPending, className: "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all active:scale-[0.97]", children: [_jsx(Play, { className: "w-3 h-3" }), "Launch"] })), _jsx("button", { onClick: () => setViewingCampaign(camp), className: "p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-lg transition-all", title: "View details", children: _jsx(Eye, { className: "w-4 h-4" }) }), isDraft && (_jsx("button", { onClick: () => {
                                                    if (confirm(`Delete campaign "${camp.name}"?`)) {
                                                        deleteMutation.mutate(camp.id);
                                                    }
                                                }, className: "p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all", title: "Delete", children: _jsx(XCircle, { className: "w-3.5 h-3.5" }) }))] })] }), !isDraft && camp.totalRecipients > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "grid grid-cols-5 gap-3", children: [
                                            { label: 'Sent', value: camp.sentCount, total: camp.totalRecipients, color: 'bg-blue-500' },
                                            { label: 'Delivered', value: camp.deliveredCount, total: camp.totalRecipients, color: 'bg-emerald-500' },
                                            { label: 'Read', value: camp.readCount, total: camp.deliveredCount || 1, color: 'bg-violet-500' },
                                            { label: 'Clicked', value: camp.clickCount, total: camp.sentCount || 1, color: 'bg-amber-500' },
                                            { label: 'Converted', value: camp.conversionCount, total: camp.clickCount || 1, color: 'bg-rose-500' },
                                        ].map((m) => {
                                            const pct = Math.round((m.value / m.total) * 100);
                                            return (_jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-lg font-extrabold text-surface-900", children: [pct, "%"] }), _jsx("p", { className: "text-[10px] text-surface-400", children: m.label }), _jsx("div", { className: "mt-1 h-1.5 bg-surface-100 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full ${m.color} transition-all duration-500`, style: { width: `${Math.min(pct, 100)}%` } }) }), _jsxs("p", { className: "text-[9px] text-surface-400 mt-0.5", children: [m.value, "/", m.total] })] }, m.label));
                                        }) }), _jsxs("div", { className: "flex items-center gap-4 text-[10px] text-surface-400 pt-2 border-t border-surface-100", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(MessageSquare, { className: "w-3 h-3" }), camp.totalRecipients, " recipients"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(TrendingUp, { className: "w-3 h-3" }), deliveryRate, "% delivery rate"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Target, { className: "w-3 h-3" }), readRate, "% read rate"] }), camp.scheduledAt && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), "Scheduled: ", new Date(camp.scheduledAt).toLocaleDateString('en-IN')] }))] })] })), isDraft && (_jsxs("div", { className: "flex items-center gap-2 text-[10px] text-surface-400", children: [_jsx(Users, { className: "w-3 h-3" }), "Ready to launch", _jsx("span", { className: "text-surface-200", children: "\u00B7" }), "Created ", new Date(camp.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short',
                                    })] }))] }, camp.id));
                }) })), _jsx(Modal, { isOpen: showCreate, onClose: () => setShowCreate(false), title: "Create Campaign", size: "lg", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-700 mb-1.5", children: "Campaign Name *" }), _jsx("input", { type: "text", value: formName, onChange: (e) => setFormName(e.target.value), className: "w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all", placeholder: "Summer Sale 2026", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-700 mb-1.5", children: "Description" }), _jsx("textarea", { value: formDesc, onChange: (e) => setFormDesc(e.target.value), className: "w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none", rows: 2, placeholder: "Promotional campaign for summer clearance" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-700 mb-1.5", children: "Type" }), _jsx("select", { value: formType, onChange: (e) => setFormType(e.target.value), className: "w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all", children: CAMPAIGN_TYPES.map((t) => (_jsx("option", { value: t, children: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }, t))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-700 mb-1.5", children: "Template" }), _jsxs("select", { value: formTemplateId, onChange: (e) => setFormTemplateId(e.target.value), className: "w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all", children: [_jsx("option", { value: "", children: "No template" }), templates.map((t) => (_jsx("option", { value: t.id, children: t.name }, t.id)))] })] })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-3 border-t border-surface-100", children: [_jsx("button", { type: "button", onClick: () => setShowCreate(false), className: "px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-800 transition-colors", children: "Cancel" }), _jsx(Button, { type: "submit", variant: "default", size: "sm", disabled: !formName.trim() || createMutation.isPending, children: createMutation.isPending ? 'Creating...' : 'Create Campaign' })] })] }) }), _jsx(Modal, { isOpen: !!viewingCampaign, onClose: () => setViewingCampaign(null), title: viewingCampaign?.name ?? 'Campaign Details', size: "lg", children: viewingCampaign && (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Status" }), _jsx("span", { className: `inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_BADGES[viewingCampaign.status]?.class ?? ''}`, children: viewingCampaign.status })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Type" }), _jsx("p", { className: "text-sm font-medium capitalize", children: viewingCampaign.type.replace(/_/g, ' ') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Created" }), _jsx("p", { className: "text-sm", children: new Date(viewingCampaign.createdAt).toLocaleDateString('en-IN') })] })] }), viewingCampaign.description && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400 mb-1", children: "Description" }), _jsx("p", { className: "text-sm", children: viewingCampaign.description })] })), viewingCampaign.totalRecipients > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-surface-500 mb-3 uppercase tracking-wider", children: "Campaign Performance" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
                                                { label: 'Total Recipients', value: viewingCampaign.totalRecipients, icon: Users, color: 'bg-surface-500' },
                                                { label: 'Sent', value: viewingCampaign.sentCount, icon: Send, color: 'bg-blue-500' },
                                                { label: 'Delivered', value: viewingCampaign.deliveredCount, icon: CheckCircle, color: 'bg-emerald-500' },
                                                { label: 'Read', value: viewingCampaign.readCount, icon: Eye, color: 'bg-violet-500' },
                                                { label: 'Clicked', value: viewingCampaign.clickCount, icon: TrendingUp, color: 'bg-amber-500' },
                                                { label: 'Converted', value: viewingCampaign.conversionCount, icon: Target, color: 'bg-rose-500' },
                                                { label: 'Failed', value: viewingCampaign.failedCount, icon: XCircle, color: 'bg-red-500' },
                                                { label: 'Delivery Rate', value: `${Math.round((viewingCampaign.deliveredCount / viewingCampaign.totalRecipients) * 100)}%`, icon: BarChart3, color: 'bg-teal-500' },
                                            ].map((s) => (_jsxs("div", { className: "card p-3 flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${s.color}`, children: _jsx(s.icon, { className: "w-4 h-4 text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-bold text-surface-900", children: s.value }), _jsx("p", { className: "text-[10px] text-surface-400", children: s.label })] })] }, s.label))) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-surface-500 mb-3 uppercase tracking-wider", children: "Conversion Funnel" }), _jsx("div", { className: "space-y-2", children: [
                                                { label: 'Sent', value: viewingCampaign.sentCount, total: viewingCampaign.totalRecipients, color: 'bg-blue-500' },
                                                { label: 'Delivered', value: viewingCampaign.deliveredCount, total: viewingCampaign.totalRecipients, color: 'bg-emerald-500' },
                                                { label: 'Read', value: viewingCampaign.readCount, total: viewingCampaign.deliveredCount || 1, color: 'bg-violet-500' },
                                                { label: 'Clicked', value: viewingCampaign.clickCount, total: viewingCampaign.sentCount || 1, color: 'bg-amber-500' },
                                                { label: 'Converted', value: viewingCampaign.conversionCount, total: viewingCampaign.clickCount || 1, color: 'bg-rose-500' },
                                            ].map((step) => {
                                                const pct = step.total > 0 ? (step.value / step.total) * 100 : 0;
                                                return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xs font-medium text-surface-600 w-20 shrink-0", children: step.label }), _jsx("div", { className: "flex-1 h-6 bg-surface-100 rounded-lg overflow-hidden", children: _jsx("div", { className: `h-full rounded-lg ${step.color} transition-all duration-500 flex items-center justify-end px-2`, style: { width: `${Math.min(pct, 100)}%`, minWidth: step.value > 0 ? '3rem' : '0' }, children: _jsxs("span", { className: "text-[10px] font-bold text-white", children: [Math.round(pct), "%"] }) }) }), _jsxs("span", { className: "text-xs font-semibold text-surface-900 w-16 text-right", children: [step.value, "/", step.total] })] }, step.label));
                                            }) })] })] })), viewingCampaign.totalRecipients === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-surface-400", children: [_jsx(BarChart3, { className: "w-8 h-8 mb-2" }), _jsx("p", { className: "text-sm font-medium", children: "No analytics yet" }), _jsx("p", { className: "text-xs", children: "Launch the campaign to see performance data" })] })), _jsx("div", { className: "flex items-center justify-end pt-3 border-t border-surface-100", children: viewingCampaign.status === 'draft' && (_jsxs(Button, { variant: "default", size: "sm", onClick: () => {
                                    launchMutation.mutate(viewingCampaign.id);
                                    setViewingCampaign(null);
                                }, disabled: launchMutation.isPending, children: [_jsx(Play, { className: "w-4 h-4 mr-1.5" }), "Launch Campaign"] })) })] })) })] }));
}
//# sourceMappingURL=page.js.map