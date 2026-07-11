'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Tag, DollarSign, Percent, Calendar, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';
const COUPON_TYPES = [
    { value: 'percentage', label: 'Percentage Off', icon: Percent },
    { value: 'fixed_amount', label: 'Fixed Amount Off', icon: DollarSign },
    { value: 'free_shipping', label: 'Free Shipping', icon: Tag },
    { value: 'bogo', label: 'Buy One Get One (BOGO)', icon: Tag },
];
const couponSchema = z.object({
    code: z.string().min(1, 'Code is required').max(50).transform((v) => v.toUpperCase()),
    type: z.string().min(1, 'Type is required'),
    value: z.coerce.number().min(0, 'Must be non-negative'),
    minOrderAmount: z.coerce.number().min(0).default(0),
    maxDiscount: z.coerce.number().min(0).optional().or(z.literal('')).transform((v) => v === '' ? undefined : v),
    usageLimit: z.coerce.number().int().min(0).default(0),
    perUserLimit: z.coerce.number().int().min(1).default(1),
    startsAt: z.string().optional().or(z.literal('')),
    expiresAt: z.string().optional().or(z.literal('')),
    applicableBrands: z.string().optional(),
    applicableCategories: z.string().optional(),
    freeItemSku: z.string().optional(),
    description: z.string().optional(),
});
export default function NewCouponPage() {
    const router = useRouter();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            value: 0,
            minOrderAmount: 0,
            usageLimit: 0,
            perUserLimit: 1,
        },
    });
    const selectedType = watch('type');
    const mutation = useMutation({
        mutationFn: async (values) => {
            const payload = {
                code: values.code,
                type: values.type,
                value: values.value,
                minOrderAmount: values.minOrderAmount || 0,
                usageLimit: values.usageLimit || 0,
                perUserLimit: values.perUserLimit || 1,
            };
            if (values.maxDiscount)
                payload.maxDiscount = Number(values.maxDiscount);
            if (values.startsAt)
                payload.startsAt = new Date(values.startsAt).toISOString();
            if (values.expiresAt)
                payload.expiresAt = new Date(values.expiresAt).toISOString();
            if (values.applicableBrands)
                payload.applicableBrands = values.applicableBrands;
            if (values.applicableCategories)
                payload.applicableCategories = values.applicableCategories;
            if (values.freeItemSku)
                payload.freeItemSku = values.freeItemSku;
            if (values.description)
                payload.description = values.description;
            const { data } = await apiClient.post('/admin/coupons', payload);
            return data.data;
        },
        onSuccess: () => {
            router.push('/coupons');
        },
    });
    const onSubmit = (values) => mutation.mutate(values);
    return (_jsxs("div", { className: "max-w-3xl space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => router.back(), className: "p-1.5 rounded-lg hover:bg-surface-100 transition-colors", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Create Coupon" }), _jsx("p", { className: "text-sm text-surface-500", children: "Create a new promo code for discounts" })] })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "card p-5 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-surface-800", children: [_jsx(Tag, { className: "w-4 h-4" }), _jsx("h2", { className: "font-medium", children: "Coupon Details" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Code *" }), _jsx("input", { ...register('code'), placeholder: "e.g. SAVE10", className: "input font-mono uppercase", onChange: (e) => { e.target.value = e.target.value.toUpperCase(); } }), errors.code && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.code.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Discount Type *" }), _jsxs("select", { ...register('type'), className: "select", children: [_jsx("option", { value: "", children: "Select type" }), COUPON_TYPES.map((t) => (_jsx("option", { value: t.value, children: t.label }, t.value)))] }), errors.type && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.type.message }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: [selectedType === 'percentage' ? 'Discount %' : 'Discount Value (₹)', " *"] }), _jsx("input", { ...register('value'), type: "number", min: 0, step: selectedType === 'percentage' ? 1 : 0.01, placeholder: selectedType === 'percentage' ? 'e.g. 10' : 'e.g. 500', className: "input" }), errors.value && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.value.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Min Order Amount (\u20B9)" }), _jsx("input", { ...register('minOrderAmount'), type: "number", min: 0, placeholder: "e.g. 1000", className: "input" })] }), selectedType === 'percentage' && (_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Max Discount Cap (\u20B9)" }), _jsx("input", { ...register('maxDiscount'), type: "number", min: 0, placeholder: "e.g. 1000", className: "input" })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Usage Limit (0 = unlimited)" }), _jsx("input", { ...register('usageLimit'), type: "number", min: 0, placeholder: "e.g. 100", className: "input" })] })] })] }), _jsxs("div", { className: "card p-5 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-surface-800", children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsx("h2", { className: "font-medium", children: "Validity Period" })] }), _jsx("p", { className: "text-xs text-surface-400", children: "Leave blank for no time restriction" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Start Date" }), _jsx("input", { ...register('startsAt'), type: "datetime-local", className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Expiry Date" }), _jsx("input", { ...register('expiresAt'), type: "datetime-local", className: "input" })] })] })] }), _jsxs("div", { className: "card p-5", children: [_jsxs("button", { type: "button", onClick: () => setShowAdvanced(!showAdvanced), className: "flex items-center justify-between w-full text-surface-800", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("h2", { className: "font-medium", children: "Advanced Options" })] }), _jsx("span", { className: "text-xs text-primary", children: showAdvanced ? 'Hide' : 'Show' })] }), showAdvanced && (_jsxs("div", { className: "mt-4 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Applicable Brands (comma-separated IDs)" }), _jsx("input", { ...register('applicableBrands'), placeholder: "e.g. brand-uuid-1, brand-uuid-2", className: "input font-mono text-xs" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Applicable Categories" }), _jsx("input", { ...register('applicableCategories'), placeholder: "e.g. charger, case", className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Free Item SKU (for BOGO)" }), _jsx("input", { ...register('freeItemSku'), placeholder: "e.g. APP-CHR-001", className: "input font-mono" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1", children: "Description / Notes" }), _jsx("textarea", { ...register('description'), rows: 2, placeholder: "Internal notes about this coupon\u2026", className: "input resize-none" })] })] }))] }), mutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3", children: mutation.error?.response?.data?.message ??
                            mutation.error?.response?.data?.error?.message ??
                            'Failed to create coupon' })), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", type: "button", onClick: () => router.back(), children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isSubmitting || mutation.isPending, children: mutation.isPending ? 'Creating…' : 'Create Coupon' })] })] })] }));
}
//# sourceMappingURL=page.js.map