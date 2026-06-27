'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { X, Upload, Calendar, Image as ImageIcon, Loader2, Eye, Crop, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageCropModal } from './ImageCropModal';

export interface BannerFormData {
  id?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  ctaText: string;
  pageType: string;
  position: string;
  deviceType: string;
  sortOrder: number;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

interface BannerFormModalProps {
  open: boolean;
  onClose: () => void;
  banner?: BannerFormData | null;
  defaultPageType?: string;
  defaultPosition?: string;
}

const emptyForm: BannerFormData = {
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

export function BannerFormModal({ open, onClose, banner, defaultPageType, defaultPosition }: BannerFormModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<BannerFormData>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [mobileUploading, setMobileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<{ dataUrl: string; isMobile: boolean; aspectRatio?: number } | null>(null);

  const isEditing = !!banner?.id;

  useEffect(() => {
    if (banner) {
      setForm({
        ...banner,
        startsAt: banner.startsAt ? new Date(banner.startsAt).toISOString().slice(0, 16) : '',
        endsAt: banner.endsAt ? new Date(banner.endsAt).toISOString().slice(0, 16) : '',
      });
    } else {
      setForm({
        ...emptyForm,
        pageType: defaultPageType || 'home',
        position: defaultPosition || 'slider',
      });
    }
  }, [banner, defaultPageType, defaultPosition, open]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
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
    mutationFn: async (payload: BannerFormData) => {
      const body = {
        ...payload,
        startsAt: payload.startsAt ? new Date(payload.startsAt).toISOString() : null,
        endsAt: payload.endsAt ? new Date(payload.endsAt).toISOString() : null,
      };
      if (isEditing) {
        const { data } = await apiClient.patch(`/admin/banners/${banner.id}`, body);
        return data;
      } else {
        const { data } = await apiClient.post('/admin/banners', body);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success(isEditing ? 'Banner updated!' : 'Banner created!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save banner');
    },
  });

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be selected again
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      setCropTarget({ dataUrl: reader.result as string, isMobile });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob, isMobile: boolean) => {
    setCropTarget(null);

    if (isMobile) {
      setMobileUploading(true);
    } else {
      setUploading(true);
    }

    try {
      const file = new File([croppedBlob], `banner-${isMobile ? 'mobile-' : ''}${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      const url = await uploadMutation.mutateAsync(file);
      if (isMobile) {
        setForm((prev) => ({ ...prev, mobileImageUrl: url }));
      } else {
        setForm((prev) => ({ ...prev, imageUrl: url }));
      }
    } finally {
      if (isMobile) {
        setMobileUploading(false);
      } else {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      toast.error('Image is required');
      return;
    }
    saveMutation.mutate(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-surface-900">
            {isEditing ? 'Edit Banner' : 'Add New Banner'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Page Type & Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Page Type</label>
              <select
                value={form.pageType}
                onChange={(e) => setForm((p) => ({ ...p, pageType: e.target.value }))}
                className="select"
              >
                {PAGE_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Position</label>
              <select
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                className="select"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="input"
              placeholder="Big Sale Weekend"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Subtitle</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              className="input"
              placeholder="Up to 40% off on premium phones"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Desktop Image *</label>
            <div className="flex items-start gap-4">
              <div
                onClick={() => form.imageUrl ? setCropTarget({ dataUrl: form.imageUrl, isMobile: false }) : fileInputRef.current?.click()}
                className="relative w-32 h-20 rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden group"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : form.imageUrl ? (
                  <>
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="w-5 h-5 text-surface-400" />
                    <span className="text-[10px] text-surface-400">Upload</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleImageSelected(e, false)}
              />
              {form.imageUrl && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-surface-500 truncate">{form.imageUrl}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(form.imageUrl)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropTarget({ dataUrl: form.imageUrl, isMobile: false })}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Crop className="w-3 h-3" />
                      Re-crop
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, imageUrl: '' }))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Mobile Image (optional)</label>
            <div className="flex items-start gap-4">
              <div
                onClick={() => form.mobileImageUrl ? setCropTarget({ dataUrl: form.mobileImageUrl, isMobile: true }) : mobileFileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden group"
              >
                {mobileUploading ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : form.mobileImageUrl ? (
                  <>
                    <img src={form.mobileImageUrl} alt="Mobile preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-0.5">
                    <ImageIcon className="w-4 h-4 text-surface-400" />
                    <span className="text-[9px] text-surface-400">Mobile</span>
                  </div>
                )}
              </div>
              <input
                ref={mobileFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleImageSelected(e, true)}
              />
              {form.mobileImageUrl ? (
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-surface-500 truncate">{form.mobileImageUrl}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(form.mobileImageUrl)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropTarget({ dataUrl: form.mobileImageUrl, isMobile: true })}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Crop className="w-3 h-3" />
                      Re-crop
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, mobileImageUrl: '' }))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : form.imageUrl ? (
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => setCropTarget({ dataUrl: form.imageUrl, isMobile: true, aspectRatio: 1 })}
                    className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Create Mobile Version
                  </button>
                  <p className="text-[10px] text-surface-400 mt-1.5">
                    Crops your desktop image into a square mobile banner
                  </p>
                </div>
              ) : (
                <p className="text-xs text-surface-400 self-center">Upload a desktop image first</p>
              )}
            </div>
          </div>

          {/* Link & CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Link URL</label>
              <input
                type="url"
                value={form.linkUrl}
                onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
                className="input"
                placeholder="/products or https://"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">CTA Text</label>
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))}
                className="input"
                placeholder="Shop Now"
              />
            </div>
          </div>

          {/* Device Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Device Target</label>
              <select
                value={form.deviceType}
                onChange={(e) => setForm((p) => ({ ...p, deviceType: e.target.value }))}
                className="select"
              >
                {DEVICE_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Priority (Order)</label>
              <input
                type="number"
                min={0}
                max={999}
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                className="input"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-surface-400" />
              <span className="text-sm font-medium text-surface-700">Schedule (optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-surface-500 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                  className="input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-surface-300 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
            <div>
              <span className="text-sm font-medium text-surface-700">Active</span>
              <p className="text-xs text-surface-400">Banner will be visible on the frontend</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-100">
            <button type="button" onClick={onClose} className="btn-ghost btn-md">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="btn-primary btn-md min-w-[120px]"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                'Update Banner'
              ) : (
                'Create Banner'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Image Crop Modal */}
      {cropTarget && (
        <ImageCropModal
          open
          imageUrl={cropTarget.dataUrl}
          aspectRatio={cropTarget.aspectRatio ?? 16 / 9}
          onCropComplete={(blob) => handleCropComplete(blob, cropTarget.isMobile)}
          onClose={() => setCropTarget(null)}
        />
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-surface-50 transition-colors"
            >
              <X className="w-4 h-4 text-surface-600" />
            </button>
            <img
              src={previewImage}
              alt="Banner preview"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
