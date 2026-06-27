'use client';

import { useState } from 'react';
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

type AccessoryForm = z.infer<typeof accessorySchema>;

export default function NewAccessoryPage() {
  const router = useRouter();
  const { user } = useAdminAuthStore();
  const branchId = user?.branchId ?? '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccessoryForm>({
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
    mutationFn: async (values: AccessoryForm) => {
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

  const onSubmit = (values: AccessoryForm) => mutation.mutate(values);

  const brands: any[] = brandsData ?? [];

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
          <h1 className="heading-sm text-surface-900">Add Accessory</h1>
          <p className="text-sm text-surface-500">
            Add a new non-IMEI item to inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-surface-800">
            <Package className="w-4 h-4" />
            <h2 className="font-medium">Item Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                SKU *
              </label>
              <input
                {...register('sku')}
                placeholder="e.g. APP-CHR-001"
                className="input font-mono"
              />
              {errors.sku && (
                <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Name *
              </label>
              <input
                {...register('name')}
                placeholder="e.g. 20W USB-C Fast Charger"
                className="input"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={2}
                placeholder="Brief description of the accessory…"
                className="input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Category *
              </label>
              <select {...register('category')} className="select">
                <option value="">Select category</option>
                {ACCESSORY_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Brand (optional)
              </label>
              <select {...register('brandId')} className="select">
                <option value="">No brand</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-surface-800">
            <DollarSign className="w-4 h-4" />
            <h2 className="font-medium">Pricing & Tax</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Purchase Price (₹) *
              </label>
              <input
                {...register('purchasePrice')}
                type="number"
                min={0}
                step={0.01}
                placeholder="e.g. 500"
                className="input"
              />
              {errors.purchasePrice && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.purchasePrice.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Selling Price (₹)
              </label>
              <input
                {...register('sellingPrice')}
                type="number"
                min={0}
                step={0.01}
                placeholder="e.g. 999"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Tax Rate (%)
              </label>
              <input
                {...register('taxRate')}
                type="number"
                min={0}
                max={100}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                HSN Code
              </label>
              <input
                {...register('hsnCode')}
                placeholder="e.g. 850440"
                className="input font-mono"
              />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-surface-800">
            <Tag className="w-4 h-4" />
            <h2 className="font-medium">Stock & Reorder</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Initial Stock Quantity
              </label>
              <input
                {...register('stockQuantity')}
                type="number"
                min={0}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                Reorder Level
              </label>
              <input
                {...register('reorderLevel')}
                type="number"
                min={1}
                className="input"
              />
              <p className="text-[10px] text-surface-400 mt-0.5">
                Alert when stock drops below this
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-5">
          <div className="flex items-center gap-2 text-surface-800 mb-3">
            <FileText className="w-4 h-4" />
            <h2 className="font-medium">Notes</h2>
          </div>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Any additional notes…"
            className="textarea"
          />
        </div>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {(mutation.error as any)?.response?.data?.message ??
              (mutation.error as any)?.response?.data?.error?.message ??
              'Failed to save accessory'}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Accessory'}
          </Button>
        </div>
      </form>
    </div>
  );
}
