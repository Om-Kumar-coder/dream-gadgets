'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { BannerFormModal } from './BannerFormModal';
import { Plus, ImageIcon, Eye, EyeOff, Trash2, GripVertical, Pencil, Loader2, AlertTriangle, RefreshCw, X, } from 'lucide-react';
import toast from 'react-hot-toast';
const PAGE_TABS = [
    { value: 'home', label: '🏠 Home Banners', icon: '🏠' },
    { value: 'shop', label: '🛍️ Shop Banners', icon: '🛍️' },
    { value: 'promotional', label: '🎯 Promotional Banners', icon: '🎯' },
];
const PAGE_LABELS = {
    home: { label: 'Home', class: 'badge-primary' },
    shop: { label: 'Shop', class: 'badge-info' },
    promotional: { label: 'Promo', class: 'badge-warning' },
};
const POSITION_SECTIONS = [
    { value: 'slider', label: 'Hero Slider' },
    { value: 'middle', label: 'Mid-page Banners' },
    { value: 'bottom', label: 'Bottom Banners' },
    { value: 'offer', label: 'Offer / CTA Banners' },
];
const DEVICE_BADGES = {
    all: { label: 'All', class: 'badge-neutral' },
    desktop: { label: 'Desktop', class: 'badge-info' },
    mobile: { label: 'Mobile', class: 'badge-primary' },
};
export function BannerManager() {
    const queryClient = useQueryClient();
    const [activePageTab, setActivePageTab] = useState('home');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [defaultPosition, setDefaultPosition] = useState('slider');
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    // Fetch banners
    const { data: bannersData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['admin-banners', activePageTab],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/banners', {
                params: { pageType: activePageTab },
            });
            // The response has { status: 'success', data: [...] }
            return (data.data || data || []);
        },
    });
    // Toggle mutation
    const toggleMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.patch(`/admin/banners/${id}/toggle`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            toast.success('Banner toggled');
        },
        onError: () => toast.error('Failed to toggle banner'),
    });
    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.delete(`/admin/banners/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            toast.success('Banner deleted');
        },
        onError: () => toast.error('Failed to delete banner'),
    });
    // Reorder mutation
    const reorderMutation = useMutation({
        mutationFn: async (banners) => {
            await apiClient.patch('/admin/banners-order', { banners });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
        },
        onError: () => toast.error('Failed to reorder banners'),
    });
    const banners = bannersData || [];
    const bannersByPosition = POSITION_SECTIONS.map((section) => ({
        ...section,
        banners: banners
            .filter((b) => b.position === section.value)
            .sort((a, b) => a.sortOrder - b.sortOrder),
    }));
    const handleEdit = (banner) => {
        setEditingBanner({
            id: banner.id,
            title: banner.title,
            subtitle: banner.subtitle || '',
            imageUrl: banner.imageUrl,
            mobileImageUrl: banner.mobileImageUrl || '',
            linkUrl: banner.linkUrl || '',
            ctaText: banner.ctaText || '',
            pageType: banner.pageType,
            position: banner.position,
            deviceType: banner.deviceType,
            sortOrder: banner.sortOrder,
            isActive: banner.isActive,
            startsAt: banner.startsAt || '',
            endsAt: banner.endsAt || '',
        });
        setModalOpen(true);
    };
    const handleAdd = (position) => {
        setEditingBanner(null);
        setDefaultPosition(position);
        setModalOpen(true);
    };
    const handleDelete = (banner) => {
        if (window.confirm(`Delete "${banner.title}"? This cannot be undone.`)) {
            deleteMutation.mutate(banner.id);
        }
    };
    const handleDragStart = (id) => {
        setDraggedId(id);
    };
    const handleDragOver = (e, id) => {
        e.preventDefault();
        setDragOverId(id);
    };
    const handleDragEnd = (position) => {
        if (!draggedId || !dragOverId || draggedId === dragOverId) {
            setDraggedId(null);
            setDragOverId(null);
            return;
        }
        const sectionBanners = bannersByPosition.find((s) => s.value === position)?.banners || [];
        const draggedIdx = sectionBanners.findIndex((b) => b.id === draggedId);
        const overIdx = sectionBanners.findIndex((b) => b.id === dragOverId);
        if (draggedIdx === -1 || overIdx === -1) {
            setDraggedId(null);
            setDragOverId(null);
            return;
        }
        const reordered = [...sectionBanners];
        const [moved] = reordered.splice(draggedIdx, 1);
        reordered.splice(overIdx, 0, moved);
        const updates = reordered.map((b, i) => ({
            id: b.id,
            sortOrder: i,
        }));
        reorderMutation.mutate(updates);
        setDraggedId(null);
        setDragOverId(null);
    };
    const formatDate = (d) => {
        if (!d)
            return null;
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Banner Management" }), _jsx("p", { className: "text-sm text-surface-500 mt-0.5", children: "Manage banners across all pages \u2014 no code changes needed" })] }), _jsxs("button", { onClick: () => { setEditingBanner(null); setModalOpen(true); }, className: "btn-primary btn-md", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Banner"] })] }), _jsx("div", { className: "flex gap-1 bg-surface-100 p-1 rounded-xl", children: PAGE_TABS.map((tab) => (_jsx("button", { onClick: () => setActivePageTab(tab.value), className: `flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activePageTab === tab.value
                        ? 'bg-white text-surface-900 shadow-sm'
                        : 'text-surface-500 hover:text-surface-700'}`, children: tab.label }, tab.value))) }), isLoading && (_jsxs("div", { className: "card p-12 flex flex-col items-center justify-center gap-3", children: [_jsx(Loader2, { className: "w-6 h-6 text-primary animate-spin" }), _jsx("p", { className: "text-sm text-surface-400", children: "Loading banners..." })] })), isError && (_jsxs("div", { className: "card p-8 flex flex-col items-center justify-center text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3", children: _jsx(AlertTriangle, { className: "w-6 h-6 text-red-500" }) }), _jsx("h3", { className: "text-base font-semibold text-surface-900", children: "Failed to load banners" }), _jsx("p", { className: "text-surface-500 text-sm mt-1", children: error instanceof Error ? error.message : 'An unexpected error occurred' }), _jsxs("button", { onClick: () => refetch(), className: "btn-outline btn-sm mt-4", children: [_jsx(RefreshCw, { className: "w-3.5 h-3.5" }), "Try Again"] })] })), !isLoading && !isError && (_jsx("div", { className: "space-y-6", children: bannersByPosition.map((section) => {
                    const isEmpty = section.banners.length === 0;
                    return (_jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "px-5 py-4 border-b border-surface-100 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h2", { className: "text-sm font-semibold text-surface-700", children: section.label }), _jsx("span", { className: "badge-neutral text-[10px]", children: section.banners.length })] }), _jsxs("button", { onClick: () => handleAdd(section.value), className: "btn-ghost btn-sm text-primary hover:text-primary", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), "Add to ", section.label] })] }), isEmpty ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-2", children: _jsx(ImageIcon, { className: "w-6 h-6 text-surface-300" }) }), _jsxs("p", { className: "text-sm text-surface-400 mb-3", children: ["No banners in this ", section.label.toLowerCase(), " section"] }), _jsxs("button", { onClick: () => handleAdd(section.value), className: "btn-outline btn-sm", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), "Add First Banner"] })] })) : (_jsx("div", { className: "divide-y divide-surface-50", children: section.banners.map((banner) => {
                                    const deviceBadge = DEVICE_BADGES[banner.deviceType] || DEVICE_BADGES.all;
                                    return (_jsxs("div", { draggable: true, onDragStart: () => handleDragStart(banner.id), onDragOver: (e) => handleDragOver(e, banner.id), onDragEnd: () => handleDragEnd(section.value), className: `flex items-center gap-4 px-5 py-3.5 transition-colors ${dragOverId === banner.id ? 'bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-surface-50'} ${draggedId === banner.id ? 'opacity-50' : ''} ${!banner.isActive ? 'bg-surface-50/50' : ''}`, children: [_jsx("div", { className: "cursor-grab active:cursor-grabbing text-surface-300 hover:text-surface-500", children: _jsx(GripVertical, { className: "w-4 h-4" }) }), _jsx("div", { className: "w-20 h-12 shrink-0 rounded-lg bg-surface-100 overflow-hidden cursor-pointer ring-1 ring-transparent hover:ring-primary/30 transition-all", onClick: () => banner.imageUrl &&
                                                    setPreviewImage({
                                                        url: banner.imageUrl,
                                                        title: banner.title,
                                                        mobileUrl: banner.mobileImageUrl || undefined,
                                                    }), children: banner.imageUrl ? (_jsx("img", { src: banner.imageUrl, alt: banner.title, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(ImageIcon, { className: "w-5 h-5 text-surface-300" }) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-sm font-medium ${banner.isActive ? 'text-surface-900' : 'text-surface-400'}`, children: banner.title }), banner.subtitle && (_jsxs("span", { className: "text-xs text-surface-400 truncate hidden sm:inline", children: ["\u2014 ", banner.subtitle] }))] }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [(() => {
                                                                const pageInfo = PAGE_LABELS[banner.pageType] || { label: banner.pageType, class: 'badge-neutral' };
                                                                return (_jsx("span", { className: pageInfo.class + ' text-[10px]', children: pageInfo.label }));
                                                            })(), _jsx("span", { className: deviceBadge.class + ' text-[10px]', children: deviceBadge.label }), banner.linkUrl && (_jsxs("span", { className: "text-[10px] text-surface-400 truncate max-w-[200px]", children: ["\u2192 ", banner.linkUrl] })), banner.clickCount > 0 && (_jsxs("span", { className: "text-[10px] text-surface-400", children: [banner.clickCount, " clicks"] })), _jsx("div", { className: "flex items-center gap-1.5 ml-auto", children: (banner.startsAt || banner.endsAt) && (_jsxs("span", { className: "text-[10px] text-surface-400", children: [banner.startsAt ? formatDate(banner.startsAt) : '', banner.startsAt && banner.endsAt ? ' → ' : '', banner.endsAt ? formatDate(banner.endsAt) : ''] })) })] })] }), _jsxs("span", { className: "text-[10px] text-surface-400 font-mono w-6 text-center", children: ["#", banner.sortOrder] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => toggleMutation.mutate(banner.id), className: `p-1.5 rounded-lg transition-all ${banner.isActive
                                                            ? 'text-emerald-500 hover:bg-emerald-50'
                                                            : 'text-surface-300 hover:bg-surface-100'}`, title: banner.isActive ? 'Deactivate' : 'Activate', children: banner.isActive ? _jsx(Eye, { className: "w-4 h-4" }) : _jsx(EyeOff, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleEdit(banner), className: "p-1.5 rounded-lg text-surface-400 hover:text-primary hover:bg-primary/5 transition-all", title: "Edit", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(banner), className: "p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-all", title: "Delete", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, banner.id));
                                }) }))] }, section.value));
                }) })), previewImage && (_jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in", onClick: () => setPreviewImage(null), children: _jsxs("div", { className: "relative max-w-4xl max-h-[90vh] w-full animate-scale-in", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setPreviewImage(null), className: "absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-surface-50 transition-colors", children: _jsx(X, { className: "w-4 h-4 text-surface-600" }) }), _jsxs("div", { className: `grid ${previewImage.mobileUrl ? 'grid-cols-2 gap-3' : 'grid-cols-1'} bg-white rounded-2xl overflow-hidden shadow-2xl`, children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: previewImage.url, alt: previewImage.title, className: "w-full h-full object-contain max-h-[75vh]" }), previewImage.mobileUrl && (_jsx("div", { className: "absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded-md", children: "Desktop" }))] }), previewImage.mobileUrl && (_jsxs("div", { className: "relative", children: [_jsx("img", { src: previewImage.mobileUrl, alt: `${previewImage.title} (mobile)`, className: "w-full h-full object-contain max-h-[75vh]" }), _jsx("div", { className: "absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded-md", children: "Mobile" })] }))] }), _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [previewImage.title && (_jsx("p", { className: "text-sm text-white/80 truncate", children: previewImage.title })), _jsx("p", { className: "text-xs text-white/50", children: "Click outside to close" })] })] }) })), _jsx(BannerFormModal, { open: modalOpen, onClose: () => { setModalOpen(false); setEditingBanner(null); }, banner: editingBanner, defaultPageType: activePageTab, defaultPosition: defaultPosition })] }));
}
//# sourceMappingURL=BannerManager.js.map