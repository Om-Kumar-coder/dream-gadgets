'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Save, Eye, EyeOff, X, ExternalLink } from 'lucide-react';
const DEFAULT_VALUE = {
    text: '',
    isActive: false,
    linkUrl: '',
    linkText: 'Learn more',
    bgColor: '#0f172a',
    textColor: '#ffffff',
    dismissible: true,
};
const PRESET_COLORS = [
    { label: 'Dark', bg: '#0f172a', text: '#ffffff' },
    { label: 'Primary', bg: '#6366f1', text: '#ffffff' },
    { label: 'Blue', bg: '#2563eb', text: '#ffffff' },
    { label: 'Green', bg: '#059669', text: '#ffffff' },
    { label: 'Amber', bg: '#d97706', text: '#ffffff' },
    { label: 'Red', bg: '#dc2626', text: '#ffffff' },
    { label: 'Rose', bg: '#e11d48', text: '#ffffff' },
    { label: 'Purple', bg: '#7c3aed', text: '#ffffff' },
];
export default function AnnouncementBarPage() {
    const queryClient = useQueryClient();
    const [dirty, setDirty] = useState(false);
    const [form, setForm] = useState(DEFAULT_VALUE);
    const [previewVisible, setPreviewVisible] = useState(false);
    const { data, isLoading } = useQuery({
        queryKey: ['admin-announcement-bar'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/settings/announcement_bar');
            return data.data;
        },
        retry: false,
    });
    // Load existing value into form
    useEffect(() => {
        if (data?.value) {
            setForm({ ...DEFAULT_VALUE, ...data.value });
        }
    }, [data]);
    const saveMutation = useMutation({
        mutationFn: (value) => apiClient.patch('/admin/settings/announcement_bar', {
            key: 'announcement_bar',
            value,
            description: 'Site-wide announcement bar',
        }),
        onSuccess: () => {
            toast.success('Announcement bar saved');
            setDirty(false);
            queryClient.invalidateQueries({ queryKey: ['admin-announcement-bar'] });
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to save');
        },
    });
    const update = (partial) => {
        setForm((prev) => ({ ...prev, ...partial }));
        setDirty(true);
    };
    const handleSave = () => {
        saveMutation.mutate(form);
    };
    // Preview background style
    const previewStyle = {
        backgroundColor: form.bgColor || DEFAULT_VALUE.bgColor,
        color: form.textColor || DEFAULT_VALUE.textColor,
    };
    return (_jsxs("div", { className: "space-y-6 animate-fade-in max-w-3xl", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Announcement Bar" }), _jsx("p", { className: "text-sm text-surface-500 mt-1", children: "Configure the global announcement bar shown at the top of every page" })] }), _jsxs("button", { onClick: handleSave, disabled: saveMutation.isPending || !dirty, className: "btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed", children: [saveMutation.isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Save, { className: "w-4 h-4" })), "Save Changes"] })] }), _jsxs("div", { className: "card p-0 overflow-hidden border border-surface-200", children: [_jsxs("div", { className: "px-4 py-2 bg-surface-50 border-b border-surface-200 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "w-3.5 h-3.5 text-surface-500" }), _jsx("span", { className: "text-xs font-medium text-surface-600", children: "Preview" })] }), _jsx("button", { onClick: () => setPreviewVisible(!previewVisible), className: "text-xs text-surface-500 hover:text-surface-700", children: previewVisible ? 'Hide preview' : 'Show preview' })] }), previewVisible && (_jsx("div", { className: "relative", style: previewStyle, children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-2.5 text-center text-sm flex items-center justify-center gap-2 flex-wrap", children: [_jsx("span", { children: form.text || 'Your announcement message here' }), form.linkUrl && (_jsxs("a", { href: form.linkUrl, className: "inline-flex items-center gap-1 underline font-medium hover:opacity-80", style: { color: form.textColor || '#ffffff' }, target: "_blank", rel: "noopener noreferrer", children: [form.linkText || 'Learn more', _jsx(ExternalLink, { className: "w-3 h-3" })] })), form.dismissible && (_jsx("button", { className: "ml-2 opacity-60 hover:opacity-100", disabled: true, children: _jsx(X, { className: "w-4 h-4" }) }))] }) })), !previewVisible && (_jsx("div", { className: "p-8 text-center text-sm text-surface-400", children: "Click \u201CShow preview\u201D to see a live preview of your announcement bar" }))] }), _jsxs("div", { className: "card p-6 space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-surface-900", children: "Enable Announcement Bar" }), _jsx("p", { className: "text-xs text-surface-500", children: "Show the bar on all public pages" })] }), _jsx("button", { onClick: () => update({ isActive: !form.isActive }), className: `relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-surface-300'}`, children: _jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}` }) })] }), _jsx("hr", { className: "border-surface-200" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-900 mb-1.5", children: "Announcement Text" }), _jsx("input", { type: "text", value: form.text, onChange: (e) => update({ text: e.target.value }), placeholder: "e.g., \uD83D\uDE80 Free shipping on orders over \u20B9999", className: "input w-full" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-900 mb-1.5", children: "Link URL" }), _jsx("input", { type: "text", value: form.linkUrl || '', onChange: (e) => update({ linkUrl: e.target.value }), placeholder: "e.g., /products or https://...", className: "input w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-900 mb-1.5", children: "Link Text" }), _jsx("input", { type: "text", value: form.linkText || '', onChange: (e) => update({ linkText: e.target.value }), placeholder: "Learn more", className: "input w-full" })] })] }), _jsx("hr", { className: "border-surface-200" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-900 mb-2", children: "Background Color" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: PRESET_COLORS.map((preset) => (_jsx("button", { onClick: () => update({ bgColor: preset.bg, textColor: preset.text }), className: `w-8 h-8 rounded-full ring-2 ring-offset-1 transition-all ${form.bgColor === preset.bg ? 'ring-primary scale-110' : 'ring-transparent hover:scale-105'}`, style: { backgroundColor: preset.bg }, title: `${preset.label} (${preset.bg})` }, preset.label))) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-xs text-surface-500", children: "BG:" }), _jsx("input", { type: "color", value: form.bgColor || '#0f172a', onChange: (e) => update({ bgColor: e.target.value }), className: "w-9 h-9 rounded cursor-pointer border border-surface-200" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-xs text-surface-500", children: "Text:" }), _jsx("input", { type: "color", value: form.textColor || '#ffffff', onChange: (e) => update({ textColor: e.target.value }), className: "w-9 h-9 rounded cursor-pointer border border-surface-200" })] })] })] }), _jsx("hr", { className: "border-surface-200" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-surface-900", children: "Dismissible" }), _jsx("p", { className: "text-xs text-surface-500", children: "Allow users to close the bar (remembered via localStorage)" })] }), _jsx("button", { onClick: () => update({ dismissible: !form.dismissible }), className: `relative w-11 h-6 rounded-full transition-colors ${form.dismissible !== false ? 'bg-primary' : 'bg-surface-300'}`, children: _jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.dismissible !== false ? 'translate-x-5' : 'translate-x-0'}` }) })] })] }), _jsx("div", { className: "card p-4 bg-surface-50 border border-dashed border-surface-300", children: _jsxs("div", { className: "flex items-center gap-2 text-xs text-surface-500", children: [_jsx(EyeOff, { className: "w-3.5 h-3.5" }), _jsxs("span", { children: ["When dismissed, the bar is hidden using ", _jsx("code", { className: "bg-surface-200 px-1 py-0.5 rounded text-[10px]", children: "localStorage" }), ". Users can see it again by clearing their browser data, or the bar reappears if the announcement text changes."] })] }) })] }));
}
//# sourceMappingURL=page.js.map