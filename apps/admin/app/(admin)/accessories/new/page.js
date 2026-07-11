'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Package, DollarSign, Tag, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';
import { useAdminAuthStore } from '@/store/auth.store';
const ACCESSORY_CATEGORIES = [
    { value: 'charger', label: 'Charger' },
    { value: 'case', label: 'Case' },
    { value: 'screen_guard', label: 'Screen Guard' },
    { value: 'earphones', label: 'Earphones' },
    { value: 'cable', label: 'Cable' },
    { value: 'power_bank', label: 'Power Bank' },
    { value: 'stand', label: 'Stand' },
    { value: 'cleaning_kit', label: 'Cleaning Kit' },
    { value: 'tempered_glass', label: 'Tempered Glass' },
    { value: 'adapter', label: 'Adapter' },
];
const accessorySchema = z.object({
    sku: z.string().min(1, 'SKU is required').max(50),
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    brandId: z.string().optional(),
    purchasePrice: z.coerce.number().min(0, 'Price must be non-negative'),
    sellingPrice: z.coerce.number().min(0).optional(),
    stockQuantity: z.coerce.number().int().min(0).default(0),
    reorderLevel: z.coerce.number().int().min(1).default(10),
    hsnCode: z.string().optional(),
    taxRate: z.coerce.number().min(0).max(100).default(18),
    notes: z.string().optional(),
    branchId: z.string().optional(),
});
export default function NewAccessoryPage() {
    const router = useRouter();
    const { user } = useAdminAuthStore();
    const branchId = user?.branchId ?? '';
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(accessorySchema),
        defaultValues: {
            stockQuantity: 0,
            reorderLevel: 10,
            taxRate: 18,
            branchId: branchId || undefined,
        },
    });
    // Load brands for optional link
    const { data: brandsData } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const { data } = await apiClient.get('/inventory/brands');
            return data.data ?? [];
        },
    });
    const mutation = useMutation({
        mutationFn: async (values) => {
            const { data } = await apiClient.post('/accessories', {
                ...values,
                sellingPrice: values.sellingPrice || undefined,
                description: values.description || undefined,
                brandId: values.brandId || undefined,
                hsnCode: values.hsnCode || undefined,
                notes: values.notes || undefined,
                branchId: values.branchId || undefined,
            });
            return data.data;
        },
        onSuccess: () => {
            router.push('/accessories');
        },
    });
    const onSubmit = (values) => mutation.mutate(values);
    const brands = brandsData ?? [];
    return (_jsxs("div", { className: "max-w-3xl space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => router.back(), className: "p-1.5 rounded-lg hover:bg-surface-100 transition-colors", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Add Accessory" }), _jsx("p", { className: "text-sm text-surface-500", children: "Add a new non-IMEI item to inventory" })] })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "card p-5 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-surface-800", children: [_jsx(Package, { className: "w-4 h-4" }), _jsx("h2", { className: "font-medium", children: "Item Details" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "SKU *" }), _jsx("input", { ...register('sku'), placeholder: "e.g. APP-CHR-001", className: "input font-mono" }), errors.sku && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.sku.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Name *" }), _jsx("input", { ...register('name'), placeholder: "e.g. 20W USB-C Fast Charger", className: "input" }), errors.name && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.name.message }))] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Description" }), _jsx("textarea", { ...register('description'), rows: 2, placeholder: "Brief description of the accessory\u2026", className: "input resize-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Category *" }), _jsxs("select", { ...register('category'), className: "select", children: [_jsx("option", { value: "", children: "Select category" }), ACCESSORY_CATEGORIES.map((c) => (_jsx("option", { value: c.value, children: c.label }, c.value)))] }), errors.category && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.category.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Brand (optional)" }), _jsxs("select", { ...register('brandId'), className: "select", children: [_jsx("option", { value: "", children: "No brand" }), brands.map((b) => (_jsx("option", { value: b.id, children: b.name }, b.id)))] })] })] })] }), _jsxs("div", { className: "card p-5 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-surface-800", children: [_jsx(DollarSign, { className: "w-4 h-4" }), _jsx("h2", { className: "font-medium", children: "Pricing & Tax" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Purchase Price (\u20B9) *" }), _jsx("input", { ...register('purchasePrice'), type: "number", min: 0, step: 0.01, placeholder: "e.g. 500", className: "input" }), errors.purchasePrice && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.purchasePrice.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Selling Price (\u20B9)" }), _jsx("input", { ...register('sellingPrice'), type: "number", min: 0, step: 0.01, placeholder: "e.g. 999", className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Tax Rate (%)" }), _jsx("input", { ...register('taxRate'), type: "number", min: 0, max: 100, className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "HSN Code" }), _jsx("input", { ...register('hsnCode'), placeholder: "e.g. 850440", className: "input font-mono" })] })] })] }), _jsxs("div", { className: "card p-5 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-surface-800", children: [_jsx(Tag, { className: "w-4 h-4" }), _jsx("h2", { className: "font-medium", children: "Stock & Reorder" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Initial Stock Quantity" }), _jsx("input", { ...register('stockQuantity'), type: "number", min: 0, className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Reorder Level" }), _jsx("input", { ...register('reorderLevel'), type: "number", min: 1, className: "input" }), _jsx("p", { className: "text-[10px] text-surface-400 mt-0.5", children: "Alert when stock drops below this" })] })] })] }), _jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "flex items-center gap-2 text-surface-800 mb-3", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("h2", { className: "font-medium", children: "Notes" })] }), _jsx("textarea", { ...register('notes'), rows: 3, placeholder: "Any additional notes\u2026", className: "textarea" })] }), mutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3", children: mutation.error?.response?.data?.message ??
                            mutation.error?.response?.data?.error?.message ??
                            'Failed to save accessory' })), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", type: "button", onClick: () => router.back(), children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isSubmitting || mutation.isPending, children: mutation.isPending ? 'Saving…' : 'Save Accessory' })] })] })] }));
}
//# sourceMappingURL=page.js.map