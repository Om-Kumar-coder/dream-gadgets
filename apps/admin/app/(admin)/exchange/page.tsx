'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import { Button } from '@dream-gadgets/ui';

const CONDITION_COLORS: Record<string, string> = {
  sealed_pack: 'bg-blue-100 text-blue-700',
  open_box: 'bg-purple-100 text-purple-700',
  super_mint: 'bg-emerald-100 text-emerald-700',
  mint: 'bg-teal-100 text-teal-700',
  good: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  assessed: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
};

const DEVICE_CONDITIONS = [
  { value: 'sealed_pack', label: 'Sealed Pack' },
  { value: 'open_box', label: 'Open Box' },
  { value: 'super_mint', label: 'Super Mint' },
  { value: 'mint', label: 'Mint' },
  { value: 'good', label: 'Good' },
];

function ExchangeForm({
  branches,
  onSubmit,
  onCancel,
  saving,
}: {
  branches: Array<{ id: string; name: string }>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [brand, setBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [imei, setImei] = useState('');
  const [colour, setColour] = useState('');
  const [storage, setStorage] = useState('');
  const [condition, setCondition] = useState('good');
  const [batteryHealth, setBatteryHealth] = useState(100);
  const [exchangePrice, setExchangePrice] = useState(0);
  const [branchId, setBranchId] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ brand, modelName, imei: imei || undefined, colour: colour || undefined, storage: storage || undefined, condition, batteryHealth, exchangePrice, branchId: branchId || undefined, phone: phone || undefined });
      }}
      className="p-6 space-y-4 max-h-[65vh] overflow-y-auto"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Brand <span className="text-red-400">*</span></label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="input text-sm" required placeholder="Samsung" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Model <span className="text-red-400">*</span></label>
          <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} className="input text-sm" required placeholder="Galaxy S24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">IMEI</label>
          <input type="text" value={imei} onChange={(e) => setImei(e.target.value)} className="input text-sm" placeholder="15-digit IMEI" maxLength={15} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Colour</label>
          <input type="text" value={colour} onChange={(e) => setColour(e.target.value)} className="input text-sm" placeholder="Black" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Storage</label>
          <input type="text" value={storage} onChange={(e) => setStorage(e.target.value)} className="input text-sm" placeholder="128GB" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Condition <span className="text-red-400">*</span></label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input text-sm" required>
            {DEVICE_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Battery Health (%)</label>
          <input type="number" value={batteryHealth} onChange={(e) => setBatteryHealth(Number(e.target.value))} className="input text-sm" min={0} max={100} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Exchange Price (₹) <span className="text-red-400">*</span></label>
          <input type="number" value={exchangePrice} onChange={(e) => setExchangePrice(Number(e.target.value))} className="input text-sm" min={0} step={100} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input text-sm" placeholder="10-digit phone" maxLength={10} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Store Branch</label>
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="input text-sm">
            <option value="">—</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
        <button type="button" onClick={onCancel} className="btn-outline btn-sm">Cancel</button>
        <button type="submit" disabled={saving || !brand || !modelName} className="btn-primary btn-sm">
          {saving ? 'Creating...' : 'Create Exchange'}
        </button>
      </div>
    </form>
  );
}

type Exchange = {
  id: string;
  brand: string;
  model: string;
  imei: string | null;
  colour: string | null;
  storage: string | null;
  condition: string;
  batteryHealth: number | null;
  exchangePrice: number;
  status: string;
  createdAt: string;
};

export default function ExchangePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // Fetch available inventory items for exchange
  const { data: branchesData } = useQuery({
    queryKey: ['branches-list'],
    queryFn: async () => {
      const { data } = await apiClient.get('/public/branches');
      return data?.data ?? data ?? [];
    },
  });
  const branches: Array<{ id: string; name: string }> = Array.isArray(branchesData) ? branchesData : [];

  const createExchange = useMutation({
    mutationFn: (form: any) => apiClient.post('/exchanges', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exchanges'] });
      setShowCreate(false);
      toast.success('Exchange created');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create exchange'),
  });

  const columns: ColumnDef<Exchange, any>[] = [
    {
      accessorKey: 'device',
      header: 'Device',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.brand} {row.original.model}</p>
          <p className="text-xs text-surface-400">
            {row.original.storage ?? '—'} · {row.original.colour ?? '—'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'imei',
      header: 'IMEI',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.imei ?? '—'}</span>,
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            CONDITION_COLORS[row.original.condition] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.condition?.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'batteryHealth',
      header: 'Battery',
      cell: ({ row }) => (
        <span className="text-xs">{row.original.batteryHealth ? `${row.original.batteryHealth}%` : '—'}</span>
      ),
    },
    {
      accessorKey: 'exchangePrice',
      header: 'Exchange Price',
      cell: ({ row }) => (
        <span className="font-medium">₹{Number(row.original.exchangePrice).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            STATUS_COLORS[row.original.status] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-surface-500 text-xs">
          {row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Exchange Devices</h1>
          <p className="text-sm text-surface-500">Manage exchange devices</p>
        </div>
        <Button variant="default" size="md" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          New Exchange
        </Button>
      </div>

      {/* Create Exchange Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <h3 className="font-semibold text-surface-900">New Exchange</h3>
              <button onClick={() => setShowCreate(false)} className="text-surface-400 hover:text-surface-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ExchangeForm
              branches={branches}
              onSubmit={(form) => createExchange.mutate(form)}
              onCancel={() => setShowCreate(false)}
              saving={createExchange.isPending}
            />
          </div>
        </div>
      )}

      <DataTable<Exchange, any>
        columns={columns}
        queryKey={['exchanges', search]}
        apiEndpoint="/exchanges"
        enableSorting={true}
        enableFilters={true}
        enablePagination={true}
        pageSize={20}
        renderNoResults={() => (
          <div className="py-12 text-center">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-500">No exchange records found</p>
            <button
              onClick={() => setSearch('')}
              className="text-blue-600 hover:underline text-sm mt-2"
            >
              Clear search
            </button>
          </div>
        )}
      />
    </div>
  );
}
