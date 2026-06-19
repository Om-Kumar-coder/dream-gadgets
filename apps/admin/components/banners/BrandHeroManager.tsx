'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BrandHero {
  slug: string;
  name: string;
  imageUrl: string | null;
}

export function BrandHeroManager() {
  const queryClient = useQueryClient();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['brand-heroes'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/brand-heroes');
      return (data.data || []) as BrandHero[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ slug, imageUrl }: { slug: string; imageUrl: string }) => {
      await apiClient.put(`/admin/brand-heroes/${slug}`, { imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-heroes'] });
      setEditingSlug(null);
      setPreviewUrl('');
      toast.success('Brand hero updated!');
    },
    onError: () => toast.error('Failed to update brand hero'),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await apiClient.post('/admin/upload/banner', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data.url;
    },
    onError: () => toast.error('Upload failed. Max 5MB, images only.'),
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, slug: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setEditingSlug(slug);

    try {
      const url = await uploadMutation.mutateAsync(file);
      // Auto-save after upload
      updateMutation.mutate({ slug, imageUrl: url });
    } catch {
      toast.error('Upload failed');
      setEditingSlug(null);
      setPreviewUrl('');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleRemove = (slug: string) => {
    if (window.confirm('Remove this brand hero image?')) {
      updateMutation.mutate({ slug, imageUrl: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="card p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
        <p className="text-sm text-surface-500">Failed to load brand heroes</p>
        <button onClick={() => refetch()} className="btn-outline btn-sm mt-3">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const heroes = data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Brand Hero Images</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Set custom hero background images for each brand page
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {heroes.map((hero) => {
          const isUploading = uploadMutation.isPending && editingSlug === hero.slug;
          const hasImage = !!hero.imageUrl;

          return (
            <div
              key={hero.slug}
              className="card overflow-hidden group hover:shadow-elevation-2 transition-all"
            >
              {/* Hero Preview */}
              <div className="relative h-36 bg-gradient-to-br from-surface-800 to-surface-900 overflow-hidden">
                {hasImage ? (
                  <img
                    src={hero.imageUrl!}
                    alt={`${hero.name} hero`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-surface-600" />
                  </div>
                )}

                {/* Brand name overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-white font-bold text-sm">{hero.name}</span>
                </div>

                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <label className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                      <Upload className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, hero.slug)}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-surface-400">
                  {hasImage ? 'Custom image set' : 'No custom image'}
                </span>
                {hasImage && (
                  <button
                    onClick={() => handleRemove(hero.slug)}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
