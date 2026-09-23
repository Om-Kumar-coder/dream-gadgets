'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

export interface Address {
  id: string;
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
  isDefault: boolean;
}

const EMPTY_FORM = {
  fullName: '',
  mobile: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  addressType: 'home' as Address['addressType'],
  isDefault: false,
};

type FormState = typeof EMPTY_FORM;
type AddressFormField = Exclude<keyof FormState, 'addressType' | 'isDefault'>;

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const INDIAN_PINCODE = /^[1-9]\d{5}$/;
const MAX_LEN: Record<string, number> = {
  fullName: 120,
  addressLine1: 200,
  addressLine2: 200,
  landmark: 120,
  city: 100,
  state: 100,
};

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.fullName.trim()) e.fullName = 'Full name is required';
  else if (f.fullName.length > 120) e.fullName = 'Name is too long';
  if (!f.mobile.trim()) e.mobile = 'Mobile number is required';
  else if (!INDIAN_MOBILE.test(f.mobile.replace(/\D/g, ''))) e.mobile = 'Enter a valid 10-digit Indian mobile number';
  if (!f.addressLine1.trim()) e.addressLine1 = 'Address line 1 is required';
  if (!f.city.trim()) e.city = 'City is required';
  if (!f.state.trim()) e.state = 'State is required';
  if (!f.pincode.trim()) e.pincode = 'Pincode is required';
  else if (!INDIAN_PINCODE.test(f.pincode)) e.pincode = 'Enter a valid 6-digit Indian pincode';
  return e;
}

function toForm(a: Address): FormState {
  return {
    fullName: a.fullName,
    mobile: a.mobile,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2 ?? '',
    landmark: a.landmark ?? '',
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    addressType: a.addressType,
    isDefault: a.isDefault,
  };
}

/** Shared hook for the address list — used by the account page and checkout. */
export function useAddresses(enabled: boolean) {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => apiClient.get('/public/account/addresses').then(r => (r.data?.data ?? []) as Address[]),
    enabled,
    retry: 1,
    staleTime: 30_000,
  });
}

export function formatAddressOneLine(a: Address): string {
  return [a.addressLine1, a.addressLine2, a.landmark, a.city, `${a.state} - ${a.pincode}`]
    .filter(Boolean)
    .join(', ');
}

interface Props {
  /** When provided, clicking an address selects it instead of only managing it. */
  selectable?: boolean;
  selectedId?: string | null;
  onSelect?: (a: Address) => void;
}

export function AddressBook({ selectable, selectedId, onSelect }: Props) {
  const queryClient = useQueryClient();
  const { data: addresses = [], isLoading } = useAddresses(true);
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  function startAdd() {
    setEditing('new');
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError('');
  }

  function startEdit(a: Address) {
    setEditing(a);
    setForm(toForm(a));
    setFieldErrors({});
    setError('');
  }

  function updateField(key: keyof FormState, value: string | boolean) {
    setForm(p => ({ ...p, [key]: value }));
    setFieldErrors(prev => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setError('');
    try {
      const payload = {
        fullName: form.fullName.trim(),
        mobile: form.mobile.replace(/\D/g, ''),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        landmark: form.landmark.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode,
        addressType: form.addressType,
        isDefault: form.isDefault,
      };
      if (editing === 'new') {
        await apiClient.post('/public/account/addresses', payload);
      } else if (editing) {
        await apiClient.patch(`/public/account/addresses/${editing.id}`, payload);
      }
      setEditing(null);
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Could not save the address'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError('');
    try {
      await apiClient.delete(`/public/account/addresses/${id}`);
      setConfirmDeleteId(null);
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Could not delete the address'));
    }
  }

  async function handleSetDefault(id: string) {
    setError('');
    try {
      await apiClient.patch(`/public/account/addresses/${id}/default`);
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Could not set the default address'));
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-28 bg-surface-100 animate-pulse rounded-xl" />)}
      </div>
    );
  }

  /* ── Add / Edit form ── */
  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-surface-900">
            {editing === 'new' ? 'Add New Address' : 'Edit Address'}
          </h3>
          <button type="button" onClick={() => setEditing(null)} className="text-xs text-surface-400 hover:text-surface-600">
            Cancel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([{
            key: 'fullName', label: 'Full Name', placeholder: 'John Doe', required: true, span: true,
          }, {
            key: 'mobile', label: 'Mobile Number', placeholder: '98765 43210', required: true, span: true,
          }, {
            key: 'addressLine1', label: 'Address Line 1', placeholder: 'House no, building, street', required: true, span: true,
          }, {
            key: 'addressLine2', label: 'Address Line 2', placeholder: 'Area, colony (optional)', required: false, span: true,
          }, {
            key: 'landmark', label: 'Landmark', placeholder: 'Near… (optional)', required: false, span: true,
          }, {
            key: 'city', label: 'City', placeholder: 'Kolkata', required: true, span: false,
          }, {
            key: 'state', label: 'State', placeholder: 'West Bengal', required: true, span: false,
          }, {
            key: 'pincode', label: 'Pincode', placeholder: '700001', required: true, span: false,
          }] as Array<{
            key: AddressFormField;
            label: string;
            placeholder: string;
            required: boolean;
            span: boolean;
          }>).map(f => (
            <div key={f.key} className={f.span ? 'sm:col-span-2' : ''}>
              <label htmlFor={`addr-${f.key}`} className="block text-xs font-semibold text-surface-700 mb-1.5">
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              <input
                id={`addr-${f.key}`}
                type={f.key === 'mobile' ? 'tel' : 'text'}
                inputMode={f.key === 'mobile' || f.key === 'pincode' ? 'numeric' : undefined}
                maxLength={f.key === 'mobile' ? 12 : f.key === 'pincode' ? 6 : MAX_LEN[f.key] ?? 100}
                value={form[f.key]}
                onChange={e => updateField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={`input ${fieldErrors[f.key] ? 'input-error' : ''}`}
              />
              {fieldErrors[f.key] && <p className="text-xs text-red-500 mt-1">{fieldErrors[f.key]}</p>}
            </div>
          ))}
        </div>

        <div>
          <span className="block text-xs font-semibold text-surface-700 mb-1.5">Address Type</span>
          <div className="flex gap-2">
            {(['home', 'work', 'other'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => updateField('addressType', t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  form.addressType === t
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={e => updateField('isDefault', e.target.checked)}
            className="w-4 h-4 accent-[var(--color-primary,theme(colors.primary.DEFAULT))]"
          />
          <span className="text-sm text-surface-600">Set as my default address</span>
        </label>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary btn-md">
            {saving ? 'Saving…' : editing === 'new' ? 'Add Address' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => setEditing(null)} className="btn-ghost btn-md">Cancel</button>
        </div>
      </form>
    );
  }

  /* ── List view ── */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-surface-900">Saved Addresses</h3>
        <button onClick={startAdd} className="btn-secondary btn-sm">
          + Add Address
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-surface-200 rounded-2xl">
          <div className="w-14 h-14 mx-auto bg-surface-50 rounded-full flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-surface-900 mb-1">No addresses saved</h4>
          <p className="text-xs text-surface-400 mb-4">Add an address for faster checkout.</p>
          <button onClick={startAdd} className="btn-primary btn-sm">Add Your First Address</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addresses.map(a => {
            const selected = selectable && selectedId === a.id;
            return (
              <div
                key={a.id}
                className={`relative rounded-2xl border p-4 transition-all ${
                  selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-surface-200 bg-white hover:border-surface-300'
                } ${selectable ? 'cursor-pointer' : ''}`}
                onClick={selectable ? () => onSelect?.(a) : undefined}
                role={selectable ? 'radio' : undefined}
                aria-checked={selectable ? selected : undefined}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-surface-100 text-surface-600">
                    {a.addressType}
                  </span>
                  {a.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">DEFAULT</span>
                  )}
                </div>

                <p className="text-sm font-bold text-surface-900">{a.fullName} <span className="font-normal text-surface-400">• {a.mobile}</span></p>
                <p className="text-xs text-surface-500 mt-1 leading-relaxed">{formatAddressOneLine(a)}</p>

                {selectable ? (
                  selected && <p className="text-xs text-primary font-semibold mt-2">✓ Delivering to this address</p>
                ) : (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-surface-100">
                    <button onClick={e => { e.stopPropagation(); startEdit(a); }} className="text-xs font-semibold text-primary hover:underline">Edit</button>
                    {!a.isDefault && (
                      <button onClick={e => { e.stopPropagation(); handleSetDefault(a.id); }} className="text-xs font-semibold text-surface-500 hover:text-primary">Set Default</button>
                    )}
                    {confirmDeleteId === a.id ? (
                      <span className="flex items-center gap-2 ml-auto">
                        <button onClick={e => { e.stopPropagation(); handleDelete(a.id); }} className="text-xs font-semibold text-red-600">Confirm</button>
                        <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(null); }} className="text-xs text-surface-400">Cancel</button>
                      </span>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(a.id); }} className="text-xs text-red-400 hover:text-red-600 ml-auto">Delete</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
