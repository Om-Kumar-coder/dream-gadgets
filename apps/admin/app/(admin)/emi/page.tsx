'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  CreditCard,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Pencil,
  ChevronDown,
  ChevronRight,
  X,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

// ─── Types ──────────────────────────────────────────────────────────────

interface EmiProvider {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  plans: EmiPlan[];
}

interface EmiPlan {
  id: string;
  providerId: string;
  label: string;
  tenureMonths: number;
  minAmount: number;
  maxAmount: number | null;
  annualRate: number;
  processingFee: number;
  isActive: boolean;
  sortOrder: number;
  provider?: { name: string };
}

// ─── Modal State ────────────────────────────────────────────────────────

type ProviderModal = {
  open: boolean;
  edit: EmiProvider | null;
};

type PlanModal = {
  open: boolean;
  edit: EmiPlan | null;
  providerId?: string;
};

const emptyProviderForm = {
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  sortOrder: 0,
};

const emptyPlanForm = {
  providerId: '',
  label: '',
  tenureMonths: 3,
  minAmount: 0,
  maxAmount: '',
  annualRate: 14,
  processingFee: 0,
  sortOrder: 0,
};

// ─── Helpers ────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Provider Form Modal ────────────────────────────────────────────────

function ProviderFormModal({
  modal,
  onClose,
  onSave,
  saving,
}: {
  modal: ProviderModal;
  onClose: () => void;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(
    modal.edit
      ? {
          name: modal.edit.name,
          slug: modal.edit.slug,
          description: modal.edit.description || '',
          logoUrl: modal.edit.logoUrl || '',
          sortOrder: modal.edit.sortOrder,
        }
      : emptyProviderForm,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {modal.edit ? 'Edit EMI Provider' : 'Create EMI Provider'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Provider Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              placeholder="Bajaj Finserv"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className={`input font-mono text-sm ${modal.edit ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
              placeholder="bajaj_finserv"
              disabled={!!modal.edit}
            />
            <p className="text-[10px] text-gray-400 mt-0.5">
              {modal.edit ? 'Slug cannot be changed after creation' : 'Lowercase, underscores, no spaces'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input min-h-[60px] resize-none"
              placeholder="Flexible EMI options..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={form.logoUrl}
                onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                className="input text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="input text-sm"
                min={0}
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline btn-sm">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name || !form.slug}
            className="btn-primary btn-sm"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </span>
            ) : (
              modal.edit ? 'Update Provider' : 'Create Provider'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Form Modal ────────────────────────────────────────────────────

function PlanFormModal({
  modal,
  providers,
  onClose,
  onSave,
  saving,
}: {
  modal: PlanModal;
  providers: EmiProvider[];
  onClose: () => void;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(
    modal.edit
      ? {
          providerId: modal.edit.providerId,
          label: modal.edit.label,
          tenureMonths: modal.edit.tenureMonths,
          minAmount: modal.edit.minAmount,
          maxAmount: modal.edit.maxAmount ? String(modal.edit.maxAmount) : '',
          annualRate: modal.edit.annualRate,
          processingFee: modal.edit.processingFee,
          sortOrder: modal.edit.sortOrder,
        }
      : { ...emptyPlanForm, providerId: modal.providerId || (providers[0]?.id ?? '') },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {modal.edit ? 'Edit EMI Plan' : 'Create EMI Plan'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Provider</label>
            <select
              value={form.providerId}
              onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value }))}
              className="input text-sm"
              disabled={!!modal.providerId}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Label <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="input text-sm"
                placeholder="6 Months"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tenure (Months)
              </label>
              <input
                type="number"
                value={form.tenureMonths}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setForm((f) => ({
                    ...f,
                    tenureMonths: v,
                    label: v > 0 ? `${v} Months` : f.label,
                  }));
                }}
                className="input text-sm"
                min={1}
                max={84}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Min Amount (₹)
              </label>
              <input
                type="number"
                value={form.minAmount}
                onChange={(e) => setForm((f) => ({ ...f, minAmount: Number(e.target.value) }))}
                className="input text-sm"
                min={0}
                step={100}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Max Amount (₹)</label>
              <input
                type="number"
                value={form.maxAmount}
                onChange={(e) => setForm((f) => ({ ...f, maxAmount: e.target.value }))}
                className="input text-sm"
                min={0}
                step={100}
                placeholder="Unlimited"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Annual Rate (%)
              </label>
              <input
                type="number"
                value={form.annualRate}
                onChange={(e) => setForm((f) => ({ ...f, annualRate: Number(e.target.value) }))}
                className="input text-sm"
                min={0}
                max={100}
                step={0.5}
              />
              {form.annualRate === 0 && (
                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">★ No Cost EMI</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Processing Fee (₹)</label>
              <input
                type="number"
                value={form.processingFee}
                onChange={(e) => setForm((f) => ({ ...f, processingFee: Number(e.target.value) }))}
                className="input text-sm"
                min={0}
                step={50}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              className="input text-sm"
              min={0}
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline btn-sm">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.label || !form.providerId}
            className="btn-primary btn-sm"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </span>
            ) : (
              modal.edit ? 'Update Plan' : 'Create Plan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Row (Expandable) ──────────────────────────────────────────────

function PlanRow({
  plan,
  onToggle,
  onEdit,
  onDelete,
  isToggling,
}: {
  plan: EmiPlan;
  onToggle: (id: string) => void;
  onEdit: (plan: EmiPlan) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-surface-100 last:border-b-0 hover:bg-surface-50 transition-colors ${
        !plan.isActive ? 'opacity-60' : ''
      }`}
    >
      <div className="flex-1 grid grid-cols-6 gap-2 text-sm items-center">
        <div className="col-span-2">
          <span className="font-medium text-surface-900">{plan.label}</span>
          <span className="text-xs text-surface-400 ml-2">({plan.tenureMonths}mo)</span>
        </div>
        <div>
          {plan.annualRate === 0 ? (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">No Cost</span>
          ) : (
            <span className="text-surface-600">{Number(plan.annualRate)}% p.a.</span>
          )}
        </div>
        <div className="text-surface-600">
          {formatCurrency(Number(plan.minAmount))}
          {plan.maxAmount ? ` — ${formatCurrency(Number(plan.maxAmount))}` : '+'}
        </div>
        <div className="text-surface-600">
          {Number(plan.processingFee) > 0 ? formatCurrency(Number(plan.processingFee)) : 'Free'}
        </div>
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => onEdit(plan)}
            className="p-1.5 text-surface-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
            title="Edit plan"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggle(plan.id)}
            disabled={isToggling}
            className={`p-1.5 rounded-lg transition-colors ${
              plan.isActive ? 'text-emerald-600 hover:text-amber-500 hover:bg-amber-50' : 'text-surface-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={plan.isActive ? 'Deactivate' : 'Activate'}
          >
            {plan.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete plan "${plan.label}"?`)) onDelete(plan.id);
            }}
            className="p-1.5 text-surface-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            title="Delete plan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Provider Card ──────────────────────────────────────────────────────

function ProviderCard({
  provider,
  onToggleProvider,
  onEditProvider,
  onDeleteProvider,
  onAddPlan,
  onEditPlan,
  onTogglePlan,
  onDeletePlan,
  expanded,
  onToggleExpand,
  isToggling,
}: {
  provider: EmiProvider;
  onToggleProvider: (id: string) => void;
  onEditProvider: (provider: EmiProvider) => void;
  onDeleteProvider: (id: string) => void;
  onAddPlan: (providerId: string) => void;
  onEditPlan: (plan: EmiPlan) => void;
  onTogglePlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  isToggling: boolean;
}) {
  const activePlans = provider.plans?.filter((p) => p.isActive).length ?? 0;
  const totalPlans = provider.plans?.length ?? 0;

  return (
    <div className="card overflow-hidden">
      {/* Provider Header */}
      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-50/50 transition-colors" onClick={onToggleExpand}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            provider.isActive ? 'bg-primary/10' : 'bg-surface-100'
          }`}>
            <CreditCard className={`w-5 h-5 ${provider.isActive ? 'text-primary' : 'text-surface-400'}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-sm ${provider.isActive ? 'text-surface-900' : 'text-surface-400'}`}>
                {provider.name}
              </h3>
              <span className="text-[10px] font-mono text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded">
                {provider.slug}
              </span>
              {!provider.isActive && (
                <span className="text-[10px] font-medium text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded">
                  Inactive
                </span>
              )}
            </div>
            {provider.description && (
              <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{provider.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-surface-400">
            {activePlans}/{totalPlans} plans
          </span>
          <span className="text-[10px] text-surface-400 bg-surface-50 px-2 py-0.5 rounded-lg">
            {formatDate(provider.createdAt)}
          </span>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onToggleProvider(provider.id)}
              disabled={isToggling}
              className={`p-1.5 rounded-lg transition-colors ${
                provider.isActive ? 'text-emerald-600 hover:text-amber-500 hover:bg-amber-50' : 'text-surface-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title={provider.isActive ? 'Deactivate' : 'Activate'}
            >
              {provider.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onEditProvider(provider)}
              className="p-1.5 text-surface-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              title="Edit provider"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete provider "${provider.name}" and all its plans?`)) onDeleteProvider(provider.id);
              }}
              className="p-1.5 text-surface-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Delete provider"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-surface-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-surface-400" />
          )}
        </div>
      </div>

      {/* Plans List */}
      {expanded && (
        <div className="border-t border-surface-100">
          {/* Column Headers */}
          <div className="px-4 py-2 bg-surface-50/50 grid grid-cols-6 gap-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
            <div className="col-span-2">Plan</div>
            <div>Rate</div>
            <div>Amount Range</div>
            <div>Fee</div>
            <div className="text-right">Actions</div>
          </div>

          {(!provider.plans || provider.plans.length === 0) ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-surface-400">No plans yet for this provider.</p>
              <button
                onClick={() => onAddPlan(provider.id)}
                className="text-xs text-primary font-medium hover:underline mt-1"
              >
                + Add first plan
              </button>
            </div>
          ) : (
            <>
              {[...provider.plans]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    onToggle={onTogglePlan}
                    onEdit={onEditPlan}
                    onDelete={onDeletePlan}
                    isToggling={isToggling}
                  />
                ))}
              <div className="px-4 py-3 border-t border-surface-100 bg-surface-50/30">
                <button
                  onClick={() => onAddPlan(provider.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Plan
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────

export default function EmiAdminPage() {
  const qc = useQueryClient();
  const [expandedProviderIds, setExpandedProviderIds] = useState<Set<string>>(new Set());
  const [providerModal, setProviderModal] = useState<ProviderModal>({ open: false, edit: null });
  const [planModal, setPlanModal] = useState<PlanModal>({ open: false, edit: null });
  // Fetch providers with plans
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['emi-providers'],
    queryFn: () =>
      apiClient.get('/admin/emi/providers').then((r) => {
        const payload = r.data?.data ?? r.data ?? [];
        return Array.isArray(payload) ? payload : [];
      }),
  });

  const providers: EmiProvider[] = Array.isArray(data) ? data : [];

  // ── Mutations ─────────────────────────────────────────────────────────

  const createProvider = useMutation({
    mutationFn: (form: any) => apiClient.post('/admin/emi/providers', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emi-providers'] });
      setProviderModal({ open: false, edit: null });
      toast.success('EMI provider created');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create'),
  });

  const updateProvider = useMutation({
    mutationFn: ({ id, ...form }: any) => apiClient.patch(`/admin/emi/providers/${id}`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emi-providers'] });
      setProviderModal({ open: false, edit: null });
      toast.success('Provider updated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  });

  const deleteProvider = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/emi/providers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emi-providers'] });
      toast.success('Provider deleted');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete'),
  });

  const createPlan = useMutation({
    mutationFn: (form: any) =>
      apiClient.post('/admin/emi/plans', {
        ...form,
        maxAmount: form.maxAmount ? Number(form.maxAmount) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emi-providers'] });
      setPlanModal({ open: false, edit: null });
      toast.success('EMI plan created');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create plan'),
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, ...form }: any) =>
      apiClient.patch(`/admin/emi/plans/${id}`, {
        ...form,
        maxAmount: form.maxAmount ? Number(form.maxAmount) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emi-providers'] });
      setPlanModal({ open: false, edit: null });
      toast.success('Plan updated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update plan'),
  });

  const deletePlan = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/emi/plans/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emi-providers'] });
      toast.success('Plan deleted');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete plan'),
  });

  const toggleProviderMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/admin/emi/providers/${id}`, { isActive: !isActive }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['emi-providers'] });
      toast.success(vars.isActive ? 'Deactivated' : 'Activated');
    },
    onError: () => toast.error('Failed to toggle provider status'),
  });

  const togglePlanMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/admin/emi/plans/${id}`, { isActive: !isActive }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['emi-providers'] });
      toast.success(vars.isActive ? 'Deactivated' : 'Activated');
    },
    onError: () => toast.error('Failed to toggle plan status'),
  });

  // ── Stats ─────────────────────────────────────────────────────────────

  const totalProviders = providers.length;
  const totalActiveProviders = providers.filter((p) => p.isActive).length;
  const totalPlans = providers.reduce((sum, p) => sum + (p.plans?.length ?? 0), 0);
  const totalActivePlans = providers.reduce(
    (sum, p) => sum + (p.plans?.filter((pl) => pl.isActive).length ?? 0),
    0,
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">EMI Plans</h1>
          <p className="text-sm text-surface-500">
            Manage EMI providers and their installment plans
          </p>
        </div>
        <button
          onClick={() => setProviderModal({ open: true, edit: null })}
          className="btn-primary btn-md"
        >
          <Plus className="w-4 h-4" />
          Create Provider
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Providers', value: totalProviders, active: totalActiveProviders, icon: Building2, color: 'bg-blue-500' },
          { label: 'Plans', value: totalPlans, active: totalActivePlans, icon: CreditCard, color: 'bg-emerald-500' },
          { label: 'Active Providers', value: totalActiveProviders, icon: ToggleRight, color: 'bg-primary' },
          { label: 'Inactive', value: totalProviders - totalActiveProviders, icon: ToggleLeft, color: 'bg-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-surface-900">{stat.value}</p>
              <p className="text-xs text-surface-400">
                {stat.label}
                {'active' in stat && <span className="ml-1">({stat.active} active)</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Providers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surface-100 animate-pulse rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-100 animate-pulse rounded-lg" />
                  <div className="h-3 w-48 bg-surface-50 animate-pulse rounded-lg" />
                </div>
                <div className="h-4 w-16 bg-surface-50 animate-pulse rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <RefreshCw className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-1">Failed to load EMI data</h3>
          <p className="text-sm text-surface-500 mb-4">Could not fetch EMI providers and plans.</p>
          <button onClick={() => refetch()} className="btn-primary btn-sm">
            Try Again
          </button>
        </div>
      ) : providers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-surface-300" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-1">No EMI Providers</h3>
          <p className="text-sm text-surface-500 mb-5 max-w-xs mx-auto">
            Create your first EMI provider to start offering installment payment options to customers.
          </p>
          <button
            onClick={() => setProviderModal({ open: true, edit: null })}
            className="btn-primary btn-md"
          >
            <Plus className="w-4 h-4" />
            Create Provider
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              expanded={expandedProviderIds.has(provider.id)}
              onToggleExpand={() => {
                setExpandedProviderIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(provider.id)) next.delete(provider.id);
                  else next.add(provider.id);
                  return next;
                });
              }}
              onToggleProvider={(id) => toggleProviderMutation.mutate({ id, isActive: provider.isActive })}
              onEditProvider={(p) => setProviderModal({ open: true, edit: p })}
              onDeleteProvider={(id) => deleteProvider.mutate(id)}
              onAddPlan={(providerId) => setPlanModal({ open: true, edit: null, providerId })}
              onEditPlan={(plan) => setPlanModal({ open: true, edit: plan })}
              onTogglePlan={(id) => {
                const plan = provider.plans?.find((p) => p.id === id);
                if (plan) togglePlanMutation.mutate({ id, isActive: plan.isActive });
              }}
              onDeletePlan={(id) => deletePlan.mutate(id)}
              isToggling={toggleProviderMutation.isPending || togglePlanMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Provider Modal */}
      {providerModal.open && (
        <ProviderFormModal
          modal={providerModal}
          onClose={() => setProviderModal({ open: false, edit: null })}
          onSave={(form) => {
            if (providerModal.edit) {
              const { slug, ...rest } = form;
              updateProvider.mutate({ id: providerModal.edit.id, ...rest });
            } else {
              createProvider.mutate(form);
            }
          }}
          saving={createProvider.isPending || updateProvider.isPending}
        />
      )}

      {/* Plan Modal */}
      {planModal.open && (
        <PlanFormModal
          modal={planModal}
          providers={providers}
          onClose={() => setPlanModal({ open: false, edit: null })}
          onSave={(form) => {
            if (planModal.edit) {
              updatePlan.mutate({ id: planModal.edit.id, ...form });
            } else {
              createPlan.mutate(form);
            }
          }}
          saving={createPlan.isPending || updatePlan.isPending}
        />
      )}
    </div>
  );
}
