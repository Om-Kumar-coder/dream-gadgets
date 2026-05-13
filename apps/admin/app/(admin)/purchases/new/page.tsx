'use client';

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

type PurchaseForm = z.infer<typeof purchaseSchema>;

export default function NewPurchasePage() {
  const router = useRouter();
  const { user } = useAdminAuthStore();
  const branchId = user?.branchId ?? '';
  const [priceSuggestion, setPriceSuggestion] = useState<number | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseForm>({
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
    mutationFn: async (values: PurchaseForm) => {
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

  const onSubmit = (values: PurchaseForm) => mutation.mutate(values);

  const brands: any[] = brandsData ?? [];
  const models: any[] = modelsData ?? [];

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Purchase Entry</h1>
          <p className="text-sm text-gray-500">Record a new device acquisition</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Vendor Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-medium text-gray-800">Vendor Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendor Name *</label>
              <input {...register('vendorName')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.vendorName && <p className="text-red-500 text-xs mt-1">{errors.vendorName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Date *</label>
              <input {...register('purchaseDate')} type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate.message}</p>}
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-medium text-gray-800">Device Details</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">IMEI * (15 digits)</label>
            <div className="flex gap-2">
              <input {...register('imei')} placeholder="e.g. 356938035643809" maxLength={15}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Scan className="w-4 h-4" /> Scan
              </button>
            </div>
            {errors.imei && <p className="text-red-500 text-xs mt-1">{errors.imei.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand *</label>
              <select {...register('brandId')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select brand</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Model *</label>
              <select {...register('modelId')} disabled={!watchedBrandId}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                <option value="">Select model</option>
                {models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              {errors.modelId && <p className="text-red-500 text-xs mt-1">{errors.modelId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Colour</label>
              <input {...register('colour')} placeholder="e.g. Space Black"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Storage</label>
              <input {...register('storage')} placeholder="e.g. 256GB"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Box Type *</label>
              <select {...register('boxType')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="with_box">With Box</option>
                <option value="without_box">Without Box</option>
                <option value="accessories_only">Accessories Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Condition *</label>
              <select {...register('condition')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="sealed_pack">Sealed Pack</option>
                <option value="open_box">Open Box</option>
                <option value="super_mint">Super Mint</option>
                <option value="mint">Mint</option>
                <option value="good">Good</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Battery Health (%)</label>
              <input {...register('batteryHealth')} type="number" min={0} max={100} placeholder="e.g. 87"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-medium text-gray-800">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Price (₹) *</label>
              <input {...register('purchasePrice')} type="number" min={0} placeholder="e.g. 45000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.purchasePrice && <p className="text-red-500 text-xs mt-1">{errors.purchasePrice.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tax Rate (%)</label>
              <input {...register('taxRate')} type="number" min={0} max={100}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="button" onClick={() => fetchSuggestion()}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
            <Lightbulb className="w-4 h-4" />
            Get price suggestion for this model + condition
          </button>
          {priceSuggestion !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700">
              Suggested selling price: <strong>₹{priceSuggestion.toLocaleString()}</strong>
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-medium text-gray-800">Photos (up to 10)</h2>
          <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              {photoFiles.length > 0 ? `${photoFiles.length} file(s) selected` : 'Click to upload device photos'}
            </span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []).slice(0, 10))} />
          </label>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea {...register('notes')} rows={3} placeholder="Any additional notes…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {(mutation.error as any)?.response?.data?.message ??
             (mutation.error as any)?.response?.data?.error?.message ??
             'Failed to save purchase'}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Purchase'}
          </Button>
        </div>
      </form>
    </div>
  );
}
