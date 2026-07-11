'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Scan, Upload, Lightbulb, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';
import { useAdminAuthStore } from '@/store/auth.store';
const purchaseSchema = z.object({
    imei: z.string().length(15, 'IMEI must be 15 digits').regex(/^\d+$/, 'IMEI must be numeric'),
    brandId: z.string().uuid('Select a valid brand'),
    modelId: z.string().uuid('Select a valid model'),
    colour: z.string().optional(),
    storage: z.string().optional(),
    boxType: z.enum(['with_box', 'without_box', 'accessories_only']),
    condition: z.enum(['sealed_pack', 'open_box', 'super_mint', 'mint', 'good']),
    purchasePrice: z.coerce.number().positive('Purchase price must be positive'),
    taxRate: z.coerce.number().min(0).max(100).default(18),
    batteryHealth: z.coerce.number().min(0).max(100).optional(),
    vendorName: z.string().min(1, 'Vendor name is required'),
    purchaseDate: z.string().min(1, 'Purchase date is required'),
    notes: z.string().optional(),
});
export default function NewPurchasePage() {
    const router = useRouter();
    const { user } = useAdminAuthStore();
    const branchId = user?.branchId ?? '';
    const [priceSuggestion, setPriceSuggestion] = useState(null);
    const [photoFiles, setPhotoFiles] = useState([]);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(purchaseSchema),
        defaultValues: { taxRate: 18, boxType: 'with_box', condition: 'good' },
    });
    const watchedBrandId = watch('brandId');
    const watchedModelId = watch('modelId');
    const watchedCondition = watch('condition');
    // Load brands
    const { data: brandsData } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const { data } = await apiClient.get('/inventory/brands');
            return data.data ?? [];
        },
    });
    // Load models for selected brand
    const { data: modelsData } = useQuery({
        queryKey: ['models', watchedBrandId],
        queryFn: async () => {
            const { data } = await apiClient.get('/inventory/models', {
                params: { brandId: watchedBrandId },
            });
            return data.data ?? [];
        },
        enabled: !!watchedBrandId,
    });
    // Price suggestion
    const { refetch: fetchSuggestion } = useQuery({
        queryKey: ['price-suggestion', watchedModelId, watchedCondition],
        queryFn: async () => {
            const { data } = await apiClient.get('/inventory/price-suggestion', {
                params: { modelId: watchedModelId, condition: watchedCondition },
            });
            setPriceSuggestion(data.data?.median ?? null);
            return data.data;
        },
        enabled: false,
    });
    const mutation = useMutation({
        mutationFn: async (values) => {
            const taxAmount = (values.purchasePrice * values.taxRate) / 100;
            const { data } = await apiClient.post('/inventory', {
                imei: values.imei,
                brandId: values.brandId,
                modelId: values.modelId,
                colour: values.colour || undefined,
                storage: values.storage || undefined,
                boxType: values.boxType,
                condition: values.condition,
                purchasePrice: values.purchasePrice,
                taxRate: values.taxRate,
                taxAmount,
                batteryHealth: values.batteryHealth || undefined,
                notes: values.notes || undefined,
                branchId: branchId || undefined,
                vendorName: values.vendorName,
                purchaseDate: values.purchaseDate,
            });
            return data.data;
        },
        onSuccess: () => router.push('/inventory'),
    });
    const onSubmit = (values) => mutation.mutate(values);
    const brands = brandsData ?? [];
    const models = modelsData ?? [];
    return (_jsxs("div", { className: "max-w-3xl space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => router.back(), className: "p-1.5 rounded-lg hover:bg-surface-100 transition-colors", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "New Purchase Entry" }), _jsx("p", { className: "text-sm text-surface-500", children: "Record a new device acquisition" })] })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "card p-5 space-y-4", children: [_jsx("h2", { className: "font-medium text-surface-800", children: "Vendor Details" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Vendor Name *" }), _jsx("input", { ...register('vendorName'), className: "input" }), errors.vendorName && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.vendorName.message })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Purchase Date *" }), _jsx("input", { ...register('purchaseDate'), type: "date", className: "input" }), errors.purchaseDate && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.purchaseDate.message })] })] })] }), _jsxs("div", { className: "card p-5 space-y-4", children: [_jsx("h2", { className: "font-medium text-surface-800", children: "Device Details" }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "IMEI * (15 digits)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { ...register('imei'), placeholder: "e.g. 356938035643809", maxLength: 15, className: "input flex-1 font-mono" }), _jsxs("button", { type: "button", className: "btn-outline btn-md", children: [_jsx(Scan, { className: "w-4 h-4" }), " Scan"] })] }), errors.imei && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.imei.message })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Brand *" }), _jsxs("select", { ...register('brandId'), className: "select", children: [_jsx("option", { value: "", children: "Select brand" }), brands.map((b) => _jsx("option", { value: b.id, children: b.name }, b.id))] }), errors.brandId && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.brandId.message })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Model *" }), _jsxs("select", { ...register('modelId'), disabled: !watchedBrandId, className: "select disabled:opacity-50", children: [_jsx("option", { value: "", children: "Select model" }), models.map((m) => _jsx("option", { value: m.id, children: m.name }, m.id))] }), errors.modelId && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.modelId.message })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Colour" }), _jsx("input", { ...register('colour'), placeholder: "e.g. Space Black", className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Storage" }), _jsx("input", { ...register('storage'), placeholder: "e.g. 256GB", className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Box Type *" }), _jsxs("select", { ...register('boxType'), className: "select", children: [_jsx("option", { value: "with_box", children: "With Box" }), _jsx("option", { value: "without_box", children: "Without Box" }), _jsx("option", { value: "accessories_only", children: "Accessories Only" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Condition *" }), _jsxs("select", { ...register('condition'), className: "select", children: [_jsx("option", { value: "sealed_pack", children: "Sealed Pack" }), _jsx("option", { value: "open_box", children: "Open Box" }), _jsx("option", { value: "super_mint", children: "Super Mint" }), _jsx("option", { value: "mint", children: "Mint" }), _jsx("option", { value: "good", children: "Good" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Battery Health (%)" }), _jsx("input", { ...register('batteryHealth'), type: "number", min: 0, max: 100, placeholder: "e.g. 87", className: "input" })] })] })] }), _jsxs("div", { className: "card p-5 space-y-4", children: [_jsx("h2", { className: "font-medium text-surface-800", children: "Pricing" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Purchase Price (\u20B9) *" }), _jsx("input", { ...register('purchasePrice'), type: "number", min: 0, placeholder: "e.g. 45000", className: "input" }), errors.purchasePrice && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.purchasePrice.message })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Tax Rate (%)" }), _jsx("input", { ...register('taxRate'), type: "number", min: 0, max: 100, className: "input" })] })] }), _jsxs("button", { type: "button", onClick: () => fetchSuggestion(), className: "flex items-center gap-2 text-sm text-primary hover:text-primary-hover", children: [_jsx(Lightbulb, { className: "w-4 h-4" }), "Get price suggestion for this model + condition"] }), priceSuggestion !== null && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700", children: ["Suggested selling price: ", _jsxs("strong", { children: ["\u20B9", priceSuggestion.toLocaleString()] })] }))] }), _jsxs("div", { className: "card p-5 space-y-3", children: [_jsx("h2", { className: "font-medium text-surface-800", children: "Photos (up to 10)" }), _jsxs("label", { className: "flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors", children: [_jsx(Upload, { className: "w-5 h-5 text-gray-400" }), _jsx("span", { className: "text-sm text-gray-500", children: photoFiles.length > 0 ? `${photoFiles.length} file(s) selected` : 'Click to upload device photos' }), _jsx("input", { type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: (e) => setPhotoFiles(Array.from(e.target.files ?? []).slice(0, 10)) })] })] }), _jsxs("div", { className: "card p-5", children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Notes" }), _jsx("textarea", { ...register('notes'), rows: 3, placeholder: "Any additional notes\u2026", className: "textarea" })] }), mutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3", children: mutation.error?.response?.data?.message ??
                            mutation.error?.response?.data?.error?.message ??
                            'Failed to save purchase' })), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", type: "button", onClick: () => router.back(), children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isSubmitting || mutation.isPending, children: mutation.isPending ? 'Saving…' : 'Save Purchase' })] })] })] }));
}
//# sourceMappingURL=page.js.map