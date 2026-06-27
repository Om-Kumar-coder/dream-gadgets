'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { BannerFormModal, BannerFormData } from './BannerFormModal';
import {
  Plus,
  ImageIcon,
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Pencil,
  Loader2,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  ctaText: string | null;
  pageType: string;
  position: string;
  deviceType: string;
  sortOrder: number;
  isActive: boolean;
  clickCount: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

const PAGE_TABS = [
  { value: 'home', label: '🏠 Home Banners', icon: '🏠' },
  { value: 'shop', label: '🛍️ Shop Banners', icon: '🛍️' },
  { value: 'promotional', label: '🎯 Promotional Banners', icon: '🎯' },
];

const PAGE_LABELS: Record<string, { label: string; class: string }> = {
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

const DEVICE_BADGES: Record<string, { label: string; class: string }> = {
  all: { label: 'All', class: 'badge-neutral' },
  desktop: { label: 'Desktop', class: 'badge-info' },
  mobile: { label: 'Mobile', class: 'badge-primary' },
};

export function BannerManager() {
  const queryClient = useQueryClient();
  const [activePageTab, setActivePageTab] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerFormData | null>(null);
  const [defaultPosition, setDefaultPosition] = useState('slider');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; mobileUrl?: string } | null>(null);

  // Fetch banners
  const { data: bannersData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-banners', activePageTab],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/banners', {
        params: { pageType: activePageTab },
      });
      // The response has { status: 'success', data: [...] }
      return (data.data || data || []) as Banner[];
    },
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
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
    mutationFn: async (id: string) => {
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
    mutationFn: async (banners: { id: string; sortOrder: number }[]) => {
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
      .filter((b: Banner) => b.position === section.value)
      .sort((a: Banner, b: Banner) => a.sortOrder - b.sortOrder),
  }));

  const handleEdit = (banner: Banner) => {
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

  const handleAdd = (position: string) => {
    setEditingBanner(null);
    setDefaultPosition(position);
    setModalOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    if (window.confirm(`Delete "${banner.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(banner.id);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragEnd = (position: string) => {
    if (!draggedId || !dragOverId || draggedId === dragOverId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const sectionBanners = bannersByPosition.find((s) => s.value === position)?.banners || [];
    const draggedIdx = sectionBanners.findIndex((b: Banner) => b.id === draggedId);
    const overIdx = sectionBanners.findIndex((b: Banner) => b.id === dragOverId);
    if (draggedIdx === -1 || overIdx === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...sectionBanners];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(overIdx, 0, moved);

    const updates = reordered.map((b: Banner, i: number) => ({
      id: b.id,
      sortOrder: i,
    }));

    reorderMutation.mutate(updates);
    setDraggedId(null);
    setDragOverId(null);
  };

  const formatDate = (d: string | null) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Banner Management</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Manage banners across all pages — no code changes needed
          </p>
        </div>
        <button onClick={() => { setEditingBanner(null); setModalOpen(true); }} className="btn-primary btn-md">
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Page Type Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl">
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActivePageTab(tab.value)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activePageTab === tab.value
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-sm text-surface-400">Loading banners...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="card p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-surface-900">Failed to load banners</h3>
          <p className="text-surface-500 text-sm mt-1">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button onClick={() => refetch()} className="btn-outline btn-sm mt-4">
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      )}

      {/* Position Sections */}
      {!isLoading && !isError && (
        <div className="space-y-6">
          {bannersByPosition.map((section) => {
            const isEmpty = section.banners.length === 0;
            return (
              <div key={section.value} className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-surface-700">{section.label}</h2>
                    <span className="badge-neutral text-[10px]">{section.banners.length}</span>
                  </div>
                  <button
                    onClick={() => handleAdd(section.value)}
                    className="btn-ghost btn-sm text-primary hover:text-primary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to {section.label}
                  </button>
                </div>

                {isEmpty ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-2">
                      <ImageIcon className="w-6 h-6 text-surface-300" />
                    </div>
                    <p className="text-sm text-surface-400 mb-3">
                      No banners in this {section.label.toLowerCase()} section
                    </p>
                    <button
                      onClick={() => handleAdd(section.value)}
                      className="btn-outline btn-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Banner
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-50">
                    {section.banners.map((banner: Banner) => {
                      const deviceBadge = DEVICE_BADGES[banner.deviceType] || DEVICE_BADGES.all;
                      return (
                        <div
                          key={banner.id}
                          draggable
                          onDragStart={() => handleDragStart(banner.id)}
                          onDragOver={(e) => handleDragOver(e, banner.id)}
                          onDragEnd={() => handleDragEnd(section.value)}
                          className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                            dragOverId === banner.id ? 'bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-surface-50'
                          } ${draggedId === banner.id ? 'opacity-50' : ''} ${
                            !banner.isActive ? 'bg-surface-50/50' : ''
                          }`}
                        >
                          {/* Drag Handle */}
                          <div className="cursor-grab active:cursor-grabbing text-surface-300 hover:text-surface-500">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Image Preview */}
                          <div
                            className="w-20 h-12 shrink-0 rounded-lg bg-surface-100 overflow-hidden cursor-pointer ring-1 ring-transparent hover:ring-primary/30 transition-all"
                            onClick={() =>
                              banner.imageUrl &&
                              setPreviewImage({
                                url: banner.imageUrl,
                                title: banner.title,
                                mobileUrl: banner.mobileImageUrl || undefined,
                              })
                            }
                          >
                            {banner.imageUrl ? (
                              <img
                                src={banner.imageUrl}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-surface-300" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${banner.isActive ? 'text-surface-900' : 'text-surface-400'}`}>
                                {banner.title}
                              </span>
                              {banner.subtitle && (
                                <span className="text-xs text-surface-400 truncate hidden sm:inline">
                                  — {banner.subtitle}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {/* Page badge */}
                              {(() => {
                                const pageInfo = PAGE_LABELS[banner.pageType] || { label: banner.pageType, class: 'badge-neutral' };
                                return (
                                  <span className={pageInfo.class + ' text-[10px]'}>{pageInfo.label}</span>
                                );
                              })()}
                              <span className={deviceBadge.class + ' text-[10px]'}>{deviceBadge.label}</span>
                              {banner.linkUrl && (
                                <span className="text-[10px] text-surface-400 truncate max-w-[200px]">
                                  → {banner.linkUrl}
                                </span>
                              )}
                              {banner.clickCount > 0 && (
                                <span className="text-[10px] text-surface-400">
                                  {banner.clickCount} clicks
                                </span>
                              )}
                              <div className="flex items-center gap-1.5 ml-auto">
                                {(banner.startsAt || banner.endsAt) && (
                                  <span className="text-[10px] text-surface-400">
                                    {banner.startsAt ? formatDate(banner.startsAt) : ''}
                                    {banner.startsAt && banner.endsAt ? ' → ' : ''}
                                    {banner.endsAt ? formatDate(banner.endsAt) : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Priority Badge */}
                          <span className="text-[10px] text-surface-400 font-mono w-6 text-center">
                            #{banner.sortOrder}
                          </span>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleMutation.mutate(banner.id)}
                              className={`p-1.5 rounded-lg transition-all ${
                                banner.isActive
                                  ? 'text-emerald-500 hover:bg-emerald-50'
                                  : 'text-surface-300 hover:bg-surface-100'
                              }`}
                              title={banner.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleEdit(banner)}
                              className="p-1.5 rounded-lg text-surface-400 hover:text-primary hover:bg-primary/5 transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(banner)}
                              className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-surface-50 transition-colors"
            >
              <X className="w-4 h-4 text-surface-600" />
            </button>

            {/* Images */}
            <div className={`grid ${previewImage.mobileUrl ? 'grid-cols-2 gap-3' : 'grid-cols-1'} bg-white rounded-2xl overflow-hidden shadow-2xl`}>
              <div className="relative">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="w-full h-full object-contain max-h-[75vh]"
                />
                {previewImage.mobileUrl && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded-md">
                    Desktop
                  </div>
                )}
              </div>
              {previewImage.mobileUrl && (
                <div className="relative">
                  <img
                    src={previewImage.mobileUrl}
                    alt={`${previewImage.title} (mobile)`}
                    className="w-full h-full object-contain max-h-[75vh]"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded-md">
                    Mobile
                  </div>
                </div>
              )}
            </div>

            {/* Title & dimensions */}
            <div className="mt-2 flex items-center justify-between">
              {previewImage.title && (
                <p className="text-sm text-white/80 truncate">{previewImage.title}</p>
              )}
              <p className="text-xs text-white/50">Click outside to close</p>
            </div>
          </div>
        </div>
      )}

      {/* Banner Form Modal */}
      <BannerFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingBanner(null); }}
        banner={editingBanner}
        defaultPageType={activePageTab}
        defaultPosition={defaultPosition}
      />
    </div>
  );
}
