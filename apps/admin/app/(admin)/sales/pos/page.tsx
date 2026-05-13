'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, X, Plus, Minus, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';

interface BillItem {
  id: string;
  imei: string;
  name: string;
  price: number;
  condition: string;
}

interface PaymentSplit {
  method: string;
  amount: number;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'online', label: 'UPI/NEFT', icon: Smartphone },
  { value: 'exchange', label: 'Exchange', icon: X },
  { value: 'advance', label: 'Advance', icon: Plus },
  { value: 'bajaj_emi', label: 'Bajaj EMI', icon: Minus },
];

const CONDITION_LABELS: Record<string, string> = {
  sealed_pack: 'Sealed',
  open_box: 'Open Box',
  super_mint: 'Super Mint',
  mint: 'Mint',
  good: 'Good',
};

export default function POSPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [payments, setPayments] = useState<PaymentSplit[]>([{ method: 'cash', amount: 0 }]);
  const [clientPhone, setClientPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['inventory-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const { data } = await apiClient.get('/inventory', {
        params: { search: searchQuery, status: 'available', limit: 10 },
      });
      return data.data?.items ?? [];
    },
    enabled: searchQuery.length >= 2,
  });

  const subtotal = billItems.reduce((sum, i) => sum + i.price, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * 18) / 100;
  const total = subtotal - discountAmount + taxAmount;
  const paidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = total - paidAmount;

  const addItem = (item: any) => {
    if (billItems.find((b) => b.id === item.id)) return;
    setBillItems((prev) => [
      ...prev,
      {
        id: item.id,
        imei: item.imei,
        name: `${item.brand?.name ?? item.brand} ${item.model?.name ?? item.model}`,
        price: Number(item.sellingPrice ?? item.totalCost),
        condition: item.condition,
      },
    ]);
    setSearchQuery('');
    // Update last payment amount to match total
    setPayments([{ method: 'cash', amount: 0 }]);
  };

  const removeItem = (id: string) => setBillItems((prev) => prev.filter((i) => i.id !== id));

  const updatePayment = (idx: number, field: 'method' | 'amount', value: string | number) => {
    setPayments((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const addPaymentSplit = () =>
    setPayments((prev) => [...prev, { method: 'cash', amount: 0 }]);

  const removePaymentSplit = (idx: number) =>
    setPayments((prev) => prev.filter((_, i) => i !== idx));

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/sales', {
        branchId: 'default-branch-id', // TODO: Get from user context
        clientId: undefined, // Walk-in sale
        items: billItems.map((i) => ({
          itemId: i.id,
          unitPrice: i.price,
        })),
        payments: payments.map((p) => ({ method: p.method, amount: p.amount })),
        discountAmount: discount > 0 ? (subtotal * discount) / 100 : 0,
        notes,
      });
      return data.data;
    },
    onSuccess: (sale) => {
      toast.success(`Sale created! Invoice: ${sale.invoiceNumber}`);
      router.push('/sales');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create sale');
    },
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left: Item Search + Bill */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">POS Terminal</h1>
          <p className="text-sm text-gray-500">Search items by IMEI, model, or brand</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by IMEI, model, brand…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {isFetching ? (
                <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
              ) : (searchResults ?? []).length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No available items found</div>
              ) : (
                (searchResults ?? []).map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.brand?.name ?? item.brand} {item.model?.name ?? item.model}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{item.imei} · {CONDITION_LABELS[item.condition]}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      ₹{Number(item.sellingPrice ?? item.totalCost).toLocaleString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bill Items */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase grid grid-cols-[1fr_auto_auto] gap-4">
            <span>Item</span>
            <span>Price</span>
            <span></span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {billItems.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                Search and add items to the bill
              </div>
            ) : (
              billItems.map((item) => (
                <div key={item.id} className="px-4 py-3 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{item.imei} · {CONDITION_LABELS[item.condition]}</p>
                  </div>
                  <span className="text-sm font-semibold">₹{item.price.toLocaleString()}</span>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: Payment Panel */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="font-medium text-gray-800">Order Summary</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Client Phone (optional)</label>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Discount (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({discount}%)</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Splits */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-gray-800">Payment</h2>
            <button
              onClick={addPaymentSplit}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Split
            </button>
          </div>

          {payments.map((p, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={p.method}
                onChange={(e) => updatePayment(idx, 'method', e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={p.amount || ''}
                onChange={(e) => updatePayment(idx, 'amount', Number(e.target.value))}
                placeholder="Amount"
                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {payments.length > 1 && (
                <button onClick={() => removePaymentSplit(idx)} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <div className={`text-sm font-medium ${Math.abs(balance) < 0.01 ? 'text-green-600' : 'text-red-500'}`}>
            {Math.abs(balance) < 0.01
              ? '✓ Payment balanced'
              : balance > 0
                ? `Balance due: ₹${balance.toFixed(2)}`
                : `Overpaid by: ₹${Math.abs(balance).toFixed(2)}`}
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
            {(mutation.error as any)?.response?.data?.error?.message ?? 'Failed to create sale'}
          </div>
        )}

        <Button
          onClick={() => mutation.mutate()}
          disabled={billItems.length === 0 || Math.abs(balance) > 0.01 || mutation.isPending}
          isLoading={mutation.isPending}
        >
          {mutation.isPending ? 'Processing…' : `Complete Sale — ₹${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
