'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Save, Trash2, History, Tag, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

const CONDITIONS = [
  { value: 'sealed_pack', label: 'Sealed Pack' },
  { value: 'open_box', label: 'Open Box' },
  { value: 'super_mint', label: 'Super Mint' },
  { value: 'mint', label: 'Mint' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'broken', label: 'Broken' },
];

interface Model {
  id: string;
  name: string;
  brandId?: string;
}

interface GuideRow {
  modelId: string;
  condition: string;
  basePrice: number;
}

interface AuditEntry {
  id: string;
  modelId: string | null;
  modelName: string | null;
  condition: string | null;
  oldPrice: number | null;
  newPrice: number | null;
  action: string;
  updatedByFirstName?: string;
  updatedByLastName?: string;
  createdAt: string;
}

const CURRENCY = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export default function PriceGuidePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['inventory-models'],
    queryFn: async () => {
      const { data } = await apiClient.get('/inventory/models');
      return (data?.data ?? data ?? []) as Model[];
    },
  });

  const { data: guideData } = useQuery({
    queryKey: ['exchange-price-guide'],
    queryFn: async () => {
      const { data } = await apiClient.get('/exchanges/price-guide');
      return (data?.data ?? data ?? []) as GuideRow[];
    },
  });

  const { data: audits } = useQuery({
    queryKey: ['exchange-price-guide-audits'],
    queryFn: async () => {
      const { data } = await apiClient.get('/exchanges/price-guide/audits', { params: { limit: 25 } });
      return (data?.data ?? data ?? []) as AuditEntry[];
    },
    refetchInterval: 30000,
  });

  const modelList = models ?? [];
  const guideRows = guideData ?? [];

  const filteredModels = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return modelList;
    return modelList.filter((m) => m.name.toLowerCase().includes(q));
  }, [modelList, search]);

  const selectedModel = modelList.find((m) => m.id === selectedModelId) ?? null;

  const getPrice = (modelId: string, condition: string): number | null => {
    const row = guideRows.find((r) => r.modelId === modelId && r.condition === condition);
    return row ? Number(row.basePrice) : null;
  };

  const selectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    // Initialize drafts from the guide
    const init: Record<string, string> = {};
    for (const c of CONDITIONS) {
      const p = getPrice(modelId, c.value);
      if (p != null) init[c.value] = String(p);
    }
    setDrafts(init);
  };

  const saveMutation = useMutation({
    mutationFn: async ({ modelId, condition, basePrice }: { modelId: string; condition: string; basePrice: number }) => {
      await apiClient.post('/exchanges/price-guide', { modelId, condition, basePrice });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exchange-price-guide'] });
      qc.invalidateQueries({ queryKey: ['exchange-price-guide-audits'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ modelId, condition }: { modelId: string; condition: string }) => {
      await apiClient.delete(`/exchanges/price-guide/${modelId}/${condition}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exchange-price-guide'] });
      qc.invalidateQueries({ queryKey: ['exchange-price-guide-audits'] });
    },
  });

  const saveAll = async () => {
    if (!selectedModel) return;
    let saved = 0;
    for (const c of CONDITIONS) {
      const raw = drafts[c.value];
      if (raw === undefined || raw === '') continue;
      const num = Number(raw);
      if (!Number.isFinite(num) || num < 0) {
        toast.error(`Invalid price for ${c.label}`);
        return;
      }
      const current = getPrice(selectedModel.id, c.value);
      if (current !== num) {
        await saveMutation.mutateAsync({ modelId: selectedModel.id, condition: c.value, basePrice: num });
        saved++;
      }
    }
    toast.success(saved > 0 ? `Saved ${saved} price${saved > 1 ? 's' : ''}` : 'No changes to save');
  };

  const handleDelete = async (condition: string) => {
    if (!selectedModel) return;
    if (!window.confirm(`Delete the ${condition.replace(/_/g, ' ')} price for ${selectedModel.name}?`)) return;
    await deleteMutation.mutateAsync({ modelId: selectedModel.id, condition });
    toast.success('Price removed');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="heading-sm text-surface-900">Buyback Price Guide</h1>
        <p className="text-sm text-surface-500 mt-1">
          Curated base prices per model + condition used by the public buyback estimate
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model picker */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-surface-900">Select Model</h2>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models..."
              className="input pl-9 text-sm"
            />
          </div>
          <div className="h-[420px] overflow-y-auto space-y-1">
            {modelsLoading ? (
              <div className="flex items-center justify-center py-10 text-surface-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              filteredModels.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selectModel(m.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedModelId === m.id
                      ? 'bg-primary text-white font-medium'
                      : 'text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  {m.name}
                </button>
              ))
            )}
            {!modelsLoading && filteredModels.length === 0 && (
              <p className="text-sm text-surface-400 text-center py-8">No models found</p>
            )}
          </div>
        </div>

        {/* Price editor */}
        <div className="card p-5 lg:col-span-2">
          {!selectedModel ? (
            <div className="flex flex-col items-center justify-center py-24 text-surface-400">
              <TrendingUp className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">Select a model to edit its prices</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-surface-900">{selectedModel.name}</h2>
                  <p className="text-xs text-surface-400">Prices in ₹ — used for buyback estimates</p>
                </div>
                <button
                  onClick={saveAll}
                  disabled={saveMutation.isPending}
                  className="btn-primary btn-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Prices
                </button>
              </div>

              <div className="space-y-2.5">
                {CONDITIONS.map((c) => {
                  const current = getPrice(selectedModel.id, c.value);
                  const draft = drafts[c.value];
                  const changed = draft !== undefined && Number(draft) !== current;
                  return (
                    <div key={c.value} className="flex items-center gap-3">
                      <div className="w-40 shrink-0">
                        <p className="text-sm font-medium text-surface-700">{c.label}</p>
                        <p className="text-[10px] text-surface-400">
                          {current != null ? `current: ₹${CURRENCY.format(current)}` : 'not set'}
                        </p>
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={draft ?? ''}
                        placeholder="₹ 0"
                        onChange={(e) => setDrafts((d) => ({ ...d, [c.value]: e.target.value }))}
                        className={`input text-sm flex-1 ${changed ? 'border-primary ring-2 ring-primary/10' : ''}`}
                      />
                      {current != null && (
                        <button
                          onClick={() => handleDelete(c.value)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-surface-300 hover:text-red-500 transition-colors"
                          title="Delete this price"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-surface-400 mt-4">
                * Blank prices fall back to the seeded value. Changes are logged to the audit trail.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Audit trail */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-surface-900">Change History</h2>
        </div>
        {(audits ?? []).length === 0 ? (
          <p className="text-sm text-surface-400 py-4 text-center">No price changes recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="table-cell text-left">Model</th>
                  <th className="table-cell text-left">Condition</th>
                  <th className="table-cell text-right">Old Price</th>
                  <th className="table-cell text-right">New Price</th>
                  <th className="table-cell text-center">Action</th>
                  <th className="table-cell text-left">By</th>
                  <th className="table-cell text-left">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {(audits ?? []).map((a) => (
                  <tr key={a.id} className="table-row">
                    <td className="table-cell">{a.modelName ?? '—'}</td>
                    <td className="table-cell capitalize">{a.condition?.replace(/_/g, ' ') ?? '—'}</td>
                    <td className="table-cell text-right text-surface-400">
                      {a.oldPrice != null ? `₹${CURRENCY.format(Number(a.oldPrice))}` : '—'}
                    </td>
                    <td className="table-cell text-right font-medium text-primary">
                      {a.newPrice != null ? `₹${CURRENCY.format(Number(a.newPrice))}` : '—'}
                    </td>
                    <td className="table-cell text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.action === 'delete' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {a.action}
                      </span>
                    </td>
                    <td className="table-cell">
                      {[a.updatedByFirstName, a.updatedByLastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="table-cell text-surface-400">
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
