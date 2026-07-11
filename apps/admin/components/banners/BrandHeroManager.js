'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Upload, Image as ImageIcon, Loader2, AlertTriangle, RefreshCw, } from 'lucide-react';
import toast from 'react-hot-toast';
export function BrandHeroManager() {
    const queryClient = useQueryClient();
    const [editingSlug, setEditingSlug] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['brand-heroes'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/brand-heroes');
            return (data.data || []);
        },
    });
    const updateMutation = useMutation({
        mutationFn: async ({ slug, imageUrl }) => {
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
        mutationFn: async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await apiClient.post('/admin/upload/banner', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.data.url;
        },
        onError: () => toast.error('Upload failed. Max 5MB, images only.'),
    });
    const handleFileSelect = async (e, slug) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        // Show preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setEditingSlug(slug);
        try {
            const url = await uploadMutation.mutateAsync(file);
            // Auto-save after upload
            updateMutation.mutate({ slug, imageUrl: url });
        }
        catch {
            toast.error('Upload failed');
            setEditingSlug(null);
            setPreviewUrl('');
        }
        finally {
            URL.revokeObjectURL(objectUrl);
        }
    };
    const handleRemove = (slug) => {
        if (window.confirm('Remove this brand hero image?')) {
            updateMutation.mutate({ slug, imageUrl: '' });
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "card p-12 flex items-center justify-center", children: _jsx(Loader2, { className: "w-6 h-6 text-primary animate-spin" }) }));
    }
    if (isError) {
        return (_jsxs("div", { className: "card p-8 flex flex-col items-center justify-center text-center", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-red-500 mb-2" }), _jsx("p", { className: "text-sm text-surface-500", children: "Failed to load brand heroes" }), _jsxs("button", { onClick: () => refetch(), className: "btn-outline btn-sm mt-3", children: [_jsx(RefreshCw, { className: "w-3.5 h-3.5" }), " Retry"] })] }));
    }
    const heroes = data || [];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Brand Hero Images" }), _jsx("p", { className: "text-sm text-surface-500 mt-0.5", children: "Set custom hero background images for each brand page" })] }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: heroes.map((hero) => {
                    const isUploading = uploadMutation.isPending && editingSlug === hero.slug;
                    const hasImage = !!hero.imageUrl;
                    return (_jsxs("div", { className: "card overflow-hidden group hover:shadow-elevation-2 transition-all", children: [_jsxs("div", { className: "relative h-36 bg-gradient-to-br from-surface-800 to-surface-900 overflow-hidden", children: [hasImage ? (_jsx("img", { src: hero.imageUrl, alt: `${hero.name} hero`, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(ImageIcon, { className: "w-10 h-10 text-surface-600" }) })), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3", children: _jsx("span", { className: "text-white font-bold text-sm", children: hero.name }) }), _jsx("div", { className: "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: isUploading ? (_jsx(Loader2, { className: "w-6 h-6 text-white animate-spin" })) : (_jsxs("label", { className: "cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors", children: [_jsx(Upload, { className: "w-5 h-5 text-white" }), _jsx("input", { type: "file", accept: "image/jpeg,image/png,image/webp", className: "hidden", onChange: (e) => handleFileSelect(e, hero.slug) })] })) })] }), _jsxs("div", { className: "p-3 flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-surface-400", children: hasImage ? 'Custom image set' : 'No custom image' }), hasImage && (_jsx("button", { onClick: () => handleRemove(hero.slug), className: "text-xs text-red-500 hover:text-red-700 hover:underline", children: "Remove" }))] })] }, hero.slug));
                }) })] }));
}
//# sourceMappingURL=BrandHeroManager.js.map