'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { X, Upload, Calendar, Image as ImageIcon, Loader2, Eye, Crop, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageCropModal } from './ImageCropModal';
const emptyForm = {
    title: '',
    subtitle: '',
    imageUrl: '',
    mobileImageUrl: '',
    linkUrl: '',
    ctaText: '',
    pageType: 'home',
    position: 'slider',
    deviceType: 'all',
    sortOrder: 0,
    isActive: true,
    startsAt: '',
    endsAt: '',
};
const PAGE_TYPES = [
    { value: 'home', label: 'Home' },
    { value: 'shop', label: 'Shop' },
    { value: 'promotional', label: 'Promotional' },
];
const POSITIONS = [
    { value: 'slider', label: 'Slider / Hero' },
    { value: 'middle', label: 'Mid-page' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'offer', label: 'Offer / CTA' },
];
const DEVICE_TYPES = [
    { value: 'all', label: 'All Devices' },
    { value: 'desktop', label: 'Desktop Only' },
    { value: 'mobile', label: 'Mobile Only' },
];
export function BannerFormModal({ open, onClose, banner, defaultPageType, defaultPosition }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const mobileFileInputRef = useRef(null);
    const [form, setForm] = useState(emptyForm);
    const [uploading, setUploading] = useState(false);
    const [mobileUploading, setMobileUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [cropTarget, setCropTarget] = useState(null);
    const isEditing = !!banner?.id;
    useEffect(() => {
        if (banner) {
            setForm({
                ...banner,
                startsAt: banner.startsAt ? new Date(banner.startsAt).toISOString().slice(0, 16) : '',
                endsAt: banner.endsAt ? new Date(banner.endsAt).toISOString().slice(0, 16) : '',
            });
        }
        else {
            setForm({
                ...emptyForm,
                pageType: defaultPageType || 'home',
                position: defaultPosition || 'slider',
            });
        }
    }, [banner, defaultPageType, defaultPosition, open]);
    const uploadMutation = useMutation({
        mutationFn: async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await apiClient.post('/admin/upload/banner', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.data.url;
        },
        onError: () => toast.error('Upload failed. Max 5MB, jpg/png/webp/gif only.'),
    });
    const saveMutation = useMutation({
        mutationFn: async (payload) => {
            const body = {
                ...payload,
                startsAt: payload.startsAt ? new Date(payload.startsAt).toISOString() : null,
                endsAt: payload.endsAt ? new Date(payload.endsAt).toISOString() : null,
            };
            if (isEditing) {
                const { data } = await apiClient.patch(`/admin/banners/${banner.id}`, body);
                return data;
            }
            else {
                const { data } = await apiClient.post('/admin/banners', body);
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            toast.success(isEditing ? 'Banner updated!' : 'Banner created!');
            onClose();
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to save banner');
        },
    });
    const handleImageSelected = (e, isMobile) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        // Reset the input so the same file can be selected again
        e.target.value = '';
        const reader = new FileReader();
        reader.onload = () => {
            setCropTarget({ dataUrl: reader.result, isMobile });
        };
        reader.readAsDataURL(file);
    };
    const handleCropComplete = async (croppedBlob, isMobile) => {
        setCropTarget(null);
        if (isMobile) {
            setMobileUploading(true);
        }
        else {
            setUploading(true);
        }
        try {
            const file = new File([croppedBlob], `banner-${isMobile ? 'mobile-' : ''}${Date.now()}.jpg`, {
                type: 'image/jpeg',
            });
            const url = await uploadMutation.mutateAsync(file);
            if (isMobile) {
                setForm((prev) => ({ ...prev, mobileImageUrl: url }));
            }
            else {
                setForm((prev) => ({ ...prev, imageUrl: url }));
            }
        }
        finally {
            if (isMobile) {
                setMobileUploading(false);
            }
            else {
                setUploading(false);
            }
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.imageUrl.trim()) {
            toast.error('Image is required');
            return;
        }
        saveMutation.mutate(form);
    };
    if (!open)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in", children: [_jsxs("div", { className: "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-scale-in", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl", children: [_jsx("h2", { className: "text-lg font-bold text-surface-900", children: isEditing ? 'Edit Banner' : 'Add New Banner' }), _jsx("button", { onClick: onClose, className: "p-2 rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-all", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-5", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Page Type" }), _jsx("select", { value: form.pageType, onChange: (e) => setForm((p) => ({ ...p, pageType: e.target.value })), className: "select", children: PAGE_TYPES.map((pt) => (_jsx("option", { value: pt.value, children: pt.label }, pt.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Position" }), _jsx("select", { value: form.position, onChange: (e) => setForm((p) => ({ ...p, position: e.target.value })), className: "select", children: POSITIONS.map((pos) => (_jsx("option", { value: pos.value, children: pos.label }, pos.value))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Title" }), _jsx("input", { type: "text", value: form.title, onChange: (e) => setForm((p) => ({ ...p, title: e.target.value })), className: "input", placeholder: "Big Sale Weekend" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Subtitle" }), _jsx("input", { type: "text", value: form.subtitle, onChange: (e) => setForm((p) => ({ ...p, subtitle: e.target.value })), className: "input", placeholder: "Up to 40% off on premium phones" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Desktop Image *" }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { onClick: () => form.imageUrl ? setCropTarget({ dataUrl: form.imageUrl, isMobile: false }) : fileInputRef.current?.click(), className: "relative w-32 h-20 rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden group", children: uploading ? (_jsx(Loader2, { className: "w-6 h-6 text-primary animate-spin" })) : form.imageUrl ? (_jsxs(_Fragment, { children: [_jsx("img", { src: form.imageUrl, alt: "Preview", className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(Upload, { className: "w-5 h-5 text-white" }) })] })) : (_jsxs("div", { className: "flex flex-col items-center gap-1", children: [_jsx(ImageIcon, { className: "w-5 h-5 text-surface-400" }), _jsx("span", { className: "text-[10px] text-surface-400", children: "Upload" })] })) }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/jpeg,image/png,image/webp,image/gif", className: "hidden", onChange: (e) => handleImageSelected(e, false) }), form.imageUrl && (_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs text-surface-500 truncate", children: form.imageUrl }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs("button", { type: "button", onClick: () => setPreviewImage(form.imageUrl), className: "text-xs text-primary hover:underline flex items-center gap-1", children: [_jsx(Eye, { className: "w-3 h-3" }), "Preview"] }), _jsxs("button", { type: "button", onClick: () => setCropTarget({ dataUrl: form.imageUrl, isMobile: false }), className: "text-xs text-primary hover:underline flex items-center gap-1", children: [_jsx(Crop, { className: "w-3 h-3" }), "Re-crop"] }), _jsx("button", { type: "button", onClick: () => setForm((p) => ({ ...p, imageUrl: '' })), className: "text-xs text-red-500 hover:underline", children: "Remove" })] })] }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Mobile Image (optional)" }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { onClick: () => form.mobileImageUrl ? setCropTarget({ dataUrl: form.mobileImageUrl, isMobile: true }) : mobileFileInputRef.current?.click(), className: "relative w-20 h-20 rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden group", children: mobileUploading ? (_jsx(Loader2, { className: "w-5 h-5 text-primary animate-spin" })) : form.mobileImageUrl ? (_jsxs(_Fragment, { children: [_jsx("img", { src: form.mobileImageUrl, alt: "Mobile preview", className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(Upload, { className: "w-4 h-4 text-white" }) })] })) : (_jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [_jsx(ImageIcon, { className: "w-4 h-4 text-surface-400" }), _jsx("span", { className: "text-[9px] text-surface-400", children: "Mobile" })] })) }), _jsx("input", { ref: mobileFileInputRef, type: "file", accept: "image/jpeg,image/png,image/webp,image/gif", className: "hidden", onChange: (e) => handleImageSelected(e, true) }), form.mobileImageUrl ? (_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs text-surface-500 truncate", children: form.mobileImageUrl }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs("button", { type: "button", onClick: () => setPreviewImage(form.mobileImageUrl), className: "text-xs text-primary hover:underline flex items-center gap-1", children: [_jsx(Eye, { className: "w-3 h-3" }), "Preview"] }), _jsxs("button", { type: "button", onClick: () => setCropTarget({ dataUrl: form.mobileImageUrl, isMobile: true }), className: "text-xs text-primary hover:underline flex items-center gap-1", children: [_jsx(Crop, { className: "w-3 h-3" }), "Re-crop"] }), _jsx("button", { type: "button", onClick: () => setForm((p) => ({ ...p, mobileImageUrl: '' })), className: "text-xs text-red-500 hover:underline", children: "Remove" })] })] })) : form.imageUrl ? (_jsxs("div", { className: "flex-1", children: [_jsxs("button", { type: "button", onClick: () => setCropTarget({ dataUrl: form.imageUrl, isMobile: true, aspectRatio: 1 }), className: "text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10", children: [_jsx(Smartphone, { className: "w-3.5 h-3.5" }), "Create Mobile Version"] }), _jsx("p", { className: "text-[10px] text-surface-400 mt-1.5", children: "Crops your desktop image into a square mobile banner" })] })) : (_jsx("p", { className: "text-xs text-surface-400 self-center", children: "Upload a desktop image first" }))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Link URL" }), _jsx("input", { type: "url", value: form.linkUrl, onChange: (e) => setForm((p) => ({ ...p, linkUrl: e.target.value })), className: "input", placeholder: "/products or https://" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "CTA Text" }), _jsx("input", { type: "text", value: form.ctaText, onChange: (e) => setForm((p) => ({ ...p, ctaText: e.target.value })), className: "input", placeholder: "Shop Now" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Device Target" }), _jsx("select", { value: form.deviceType, onChange: (e) => setForm((p) => ({ ...p, deviceType: e.target.value })), className: "select", children: DEVICE_TYPES.map((dt) => (_jsx("option", { value: dt.value, children: dt.label }, dt.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Priority (Order)" }), _jsx("input", { type: "number", min: 0, max: 999, value: form.sortOrder, onChange: (e) => setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 })), className: "input" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-surface-400" }), _jsx("span", { className: "text-sm font-medium text-surface-700", children: "Schedule (optional)" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-surface-500 mb-1", children: "Start Date" }), _jsx("input", { type: "datetime-local", value: form.startsAt, onChange: (e) => setForm((p) => ({ ...p, startsAt: e.target.value })), className: "input text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-surface-500 mb-1", children: "End Date" }), _jsx("input", { type: "datetime-local", value: form.endsAt, onChange: (e) => setForm((p) => ({ ...p, endsAt: e.target.value })), className: "input text-sm" })] })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100", children: [_jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: form.isActive, onChange: (e) => setForm((p) => ({ ...p, isActive: e.target.checked })), className: "sr-only peer" }), _jsx("div", { className: "w-10 h-5 bg-surface-300 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-surface-700", children: "Active" }), _jsx("p", { className: "text-xs text-surface-400", children: "Banner will be visible on the frontend" })] })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-surface-100", children: [_jsx("button", { type: "button", onClick: onClose, className: "btn-ghost btn-md", children: "Cancel" }), _jsx("button", { type: "submit", disabled: saveMutation.isPending, className: "btn-primary btn-md min-w-[120px]", children: saveMutation.isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : isEditing ? ('Update Banner') : ('Create Banner') })] })] })] }), cropTarget && (_jsx(ImageCropModal, { open: true, imageUrl: cropTarget.dataUrl, aspectRatio: cropTarget.aspectRatio ?? 16 / 9, onCropComplete: (blob) => handleCropComplete(blob, cropTarget.isMobile), onClose: () => setCropTarget(null) })), previewImage && (_jsx("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in", onClick: () => setPreviewImage(null), children: _jsxs("div", { className: "relative max-w-4xl max-h-[90vh] animate-scale-in", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setPreviewImage(null), className: "absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-surface-50 transition-colors", children: _jsx(X, { className: "w-4 h-4 text-surface-600" }) }), _jsx("img", { src: previewImage, alt: "Banner preview", className: "max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" })] }) }))] }));
}
//# sourceMappingURL=BannerFormModal.js.map