'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Save, Eye, EyeOff, X, ExternalLink } from 'lucide-react';

interface AnnouncementBarValue {
  text: string;
  isActive: boolean;
  linkUrl?: string;
  linkText?: string;
  bgColor?: string;
  textColor?: string;
  dismissible?: boolean;
}

const DEFAULT_VALUE: AnnouncementBarValue = {
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

  const [form, setForm] = useState<AnnouncementBarValue>(DEFAULT_VALUE);
  const [previewVisible, setPreviewVisible] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcement-bar'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/settings/announcement_bar');
      return data.data as { value: AnnouncementBarValue };
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
    mutationFn: (value: AnnouncementBarValue) =>
      apiClient.patch('/admin/settings/announcement_bar', {
        key: 'announcement_bar',
        value,
        description: 'Site-wide announcement bar',
      }),
    onSuccess: () => {
      toast.success('Announcement bar saved');
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['admin-announcement-bar'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save');
    },
  });

  const update = (partial: Partial<AnnouncementBarValue>) => {
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

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Announcement Bar</h1>
          <p className="text-sm text-surface-500 mt-1">
            Configure the global announcement bar shown at the top of every page
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !dirty}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Live Preview */}
      <div className="card p-0 overflow-hidden border border-surface-200">
        <div className="px-4 py-2 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-surface-500" />
            <span className="text-xs font-medium text-surface-600">Preview</span>
          </div>
          <button
            onClick={() => setPreviewVisible(!previewVisible)}
            className="text-xs text-surface-500 hover:text-surface-700"
          >
            {previewVisible ? 'Hide preview' : 'Show preview'}
          </button>
        </div>
        {previewVisible && (
          <div className="relative" style={previewStyle}>
            <div className="max-w-7xl mx-auto px-4 py-2.5 text-center text-sm flex items-center justify-center gap-2 flex-wrap">
              <span>{form.text || 'Your announcement message here'}</span>
              {form.linkUrl && (
                <a
                  href={form.linkUrl}
                  className="inline-flex items-center gap-1 underline font-medium hover:opacity-80"
                  style={{ color: form.textColor || '#ffffff' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {form.linkText || 'Learn more'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {form.dismissible && (
                <button className="ml-2 opacity-60 hover:opacity-100" disabled>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
        {!previewVisible && (
          <div className="p-8 text-center text-sm text-surface-400">
            Click &ldquo;Show preview&rdquo; to see a live preview of your announcement bar
          </div>
        )}
      </div>

      {/* Form */}
      <div className="card p-6 space-y-5">
        {/* Active toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-surface-900">Enable Announcement Bar</label>
            <p className="text-xs text-surface-500">Show the bar on all public pages</p>
          </div>
          <button
            onClick={() => update({ isActive: !form.isActive })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.isActive ? 'bg-primary' : 'bg-surface-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                form.isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <hr className="border-surface-200" />

        {/* Message text */}
        <div>
          <label className="block text-sm font-medium text-surface-900 mb-1.5">
            Announcement Text
          </label>
          <input
            type="text"
            value={form.text}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="e.g., 🚀 Free shipping on orders over ₹999"
            className="input w-full"
          />
        </div>

        {/* Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-900 mb-1.5">
              Link URL
            </label>
            <input
              type="text"
              value={form.linkUrl || ''}
              onChange={(e) => update({ linkUrl: e.target.value })}
              placeholder="e.g., /products or https://..."
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-900 mb-1.5">
              Link Text
            </label>
            <input
              type="text"
              value={form.linkText || ''}
              onChange={(e) => update({ linkText: e.target.value })}
              placeholder="Learn more"
              className="input w-full"
            />
          </div>
        </div>

        <hr className="border-surface-200" />

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-surface-900 mb-2">Background Color</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => update({ bgColor: preset.bg, textColor: preset.text })}
                className={`w-8 h-8 rounded-full ring-2 ring-offset-1 transition-all ${
                  form.bgColor === preset.bg ? 'ring-primary scale-110' : 'ring-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: preset.bg }}
                title={`${preset.label} (${preset.bg})`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-surface-500">BG:</label>
              <input
                type="color"
                value={form.bgColor || '#0f172a'}
                onChange={(e) => update({ bgColor: e.target.value })}
                className="w-9 h-9 rounded cursor-pointer border border-surface-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-surface-500">Text:</label>
              <input
                type="color"
                value={form.textColor || '#ffffff'}
                onChange={(e) => update({ textColor: e.target.value })}
                className="w-9 h-9 rounded cursor-pointer border border-surface-200"
              />
            </div>
          </div>
        </div>

        <hr className="border-surface-200" />

        {/* Dismissible */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-surface-900">Dismissible</label>
            <p className="text-xs text-surface-500">Allow users to close the bar (remembered via localStorage)</p>
          </div>
          <button
            onClick={() => update({ dismissible: !form.dismissible })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.dismissible !== false ? 'bg-primary' : 'bg-surface-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                form.dismissible !== false ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dismissed state preview */}
      <div className="card p-4 bg-surface-50 border border-dashed border-surface-300">
        <div className="flex items-center gap-2 text-xs text-surface-500">
          <EyeOff className="w-3.5 h-3.5" />
          <span>
            When dismissed, the bar is hidden using <code className="bg-surface-200 px-1 py-0.5 rounded text-[10px]">localStorage</code>.
            Users can see it again by clearing their browser data, or the bar reappears if the announcement text changes.
          </span>
        </div>
      </div>
    </div>
  );
}
