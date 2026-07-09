'use client';

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
] as const;

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

type CouponForm = z.infer<typeof couponSchema>;

export default function NewCouponPage() {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponForm>({
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
    mutationFn: async (values: CouponForm) => {
      const payload: any = {
        code: values.code,
        type: values.type,
        value: values.value,
        minOrderAmount: values.minOrderAmount || 0,
        usageLimit: values.usageLimit || 0,
        perUserLimit: values.perUserLimit || 1,
      };

      if (values.maxDiscount) payload.maxDiscount = Number(values.maxDiscount);
      if (values.startsAt) payload.startsAt = new Date(values.startsAt).toISOString();
      if (values.expiresAt) payload.expiresAt = new Date(values.expiresAt).toISOString();
      if (values.applicableBrands) payload.applicableBrands = values.applicableBrands;
      if (values.applicableCategories) payload.applicableCategories = values.applicableCategories;
      if (values.freeItemSku) payload.freeItemSku = values.freeItemSku;
      if (values.description) payload.description = values.description;

      const { data } = await apiClient.post('/admin/coupons', payload);
      return data.data;
    },
    onSuccess: () => {
      router.push('/coupons');
    },
  });

  const onSubmit = (values: CouponForm) => mutation.mutate(values);

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="heading-sm text-surface-900">Create Coupon</h1>
          <p className="text-sm text-surface-500">
            Create a new promo code for discounts
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-surface-800">
            <Tag className="w-4 h-4" />
            <h2 className="font-medium">Coupon Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Code *
              </label>
              <input
                {...register('code')}
                placeholder="e.g. SAVE10"
                className="input font-mono uppercase"
                onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }}
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Discount Type *
              </label>
              <select {...register('type')} className="select">
                <option value="">Select type</option>
                {COUPON_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                {selectedType === 'percentage' ? 'Discount %' : 'Discount Value (₹)'} *
              </label>
              <input
                {...register('value')}
                type="number"
                min={0}
                step={selectedType === 'percentage' ? 1 : 0.01}
                placeholder={selectedType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                className="input"
              />
              {errors.value && (
                <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Min Order Amount (₹)
              </label>
              <input
                {...register('minOrderAmount')}
                type="number"
                min={0}
                placeholder="e.g. 1000"
                className="input"
              />
            </div>
            {selectedType === 'percentage' && (
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">
                  Max Discount Cap (₹)
                </label>
                <input
                  {...register('maxDiscount')}
                  type="number"
                  min={0}
                  placeholder="e.g. 1000"
                  className="input"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Usage Limit (0 = unlimited)
              </label>
              <input
                {...register('usageLimit')}
                type="number"
                min={0}
                placeholder="e.g. 100"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Validity */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-surface-800">
            <Calendar className="w-4 h-4" />
            <h2 className="font-medium">Validity Period</h2>
          </div>
          <p className="text-xs text-surface-400">Leave blank for no time restriction</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Start Date
              </label>
              <input
                {...register('startsAt')}
                type="datetime-local"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Expiry Date
              </label>
              <input
                {...register('expiresAt')}
                type="datetime-local"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Advanced (collapsible) */}
        <div className="card p-5">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-surface-800"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <h2 className="font-medium">Advanced Options</h2>
            </div>
            <span className="text-xs text-primary">{showAdvanced ? 'Hide' : 'Show'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    Applicable Brands (comma-separated IDs)
                  </label>
                  <input
                    {...register('applicableBrands')}
                    placeholder="e.g. brand-uuid-1, brand-uuid-2"
                    className="input font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    Applicable Categories
                  </label>
                  <input
                    {...register('applicableCategories')}
                    placeholder="e.g. charger, case"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">
                    Free Item SKU (for BOGO)
                  </label>
                  <input
                    {...register('freeItemSku')}
                    placeholder="e.g. APP-CHR-001"
                    className="input font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">
                  Description / Notes
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Internal notes about this coupon…"
                  className="input resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {(mutation.error as any)?.response?.data?.message ??
              (mutation.error as any)?.response?.data?.error?.message ??
              'Failed to create coupon'}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </div>
  );
}
