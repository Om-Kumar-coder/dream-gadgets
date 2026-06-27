'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Search,
  X,
  Plus,
  Banknote,
  CreditCard,
  Smartphone,
  WifiOff,
  Wifi,
  RefreshCw,
  Database,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@dream-gadgets/ui';
import { toast } from 'react-hot-toast';
import { useAdminAuthStore } from '@/store/auth.store';
import { useOfflinePOS } from '@/lib/offline/useOfflinePOS';

interface BillItem {
  id: string;
  imei: string;
  name: string;
  price: number;
  condition: string;
  storage?: string;
  colour?: string;
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
  { value: 'bajaj_emi', label: 'Bajaj EMI', icon: Smartphone },
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
  const { user } = useAdminAuthStore();
  const branchId = user?.branchId ?? '';
  const offlinePOS = useOfflinePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [payments, setPayments] = useState<PaymentSplit[]>([{ method: 'cash', amount: 0 }]);
  const [clientPhone, setClientPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [offlineSaleQueued, setOfflineSaleQueued] = useState(false);
  const [cacheProgress, setCacheProgress] = useState<string | null>(null);
  const [accessoryResults, setAccessoryResults] = useState<any[]>([]);
  const [isSearchingAccessories, setIsSearchingAccessories] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search — works both online and offline
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await offlinePOS.searchItems(searchQuery);
        setSearchResults(results.map((r) => r.item));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, offlinePOS.searchItems]);

  // Search accessories separately
  useEffect(() => {
    if (searchQuery.length < 2) {
      setAccessoryResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (offlinePOS.isOnline) {
        setIsSearchingAccessories(true);
        try {
          const { data } = await apiClient.get('/accessories', {
            params: { search: searchQuery, limit: 10 },
          });
          setAccessoryResults(data.data ?? []);
        } catch {
          setAccessoryResults([]);
        } finally {
          setIsSearchingAccessories(false);
        }
      } else {
        setAccessoryResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, offlinePOS.isOnline]);

  const subtotal = billItems.reduce((sum, i) => sum + i.price, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * 18) / 100;
  const total = subtotal - discountAmount + taxAmount;
  const paidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = total - paidAmount;

  const addItem = useCallback(
    (item: any) => {
      if (billItems.find((b) => b.id === item.id || (item.isAccessory && b.id === `acc-${item.id}`))) {
        toast.error('Item already in bill');
        return;
      }
      setBillItems((prev) => [
        ...prev,
        {
          id: item.isAccessory ? `acc-${item.id}` : item.id,
          imei: item.isAccessory ? item.sku : item.imei,
          name: item.isAccessory ? item.name : (item.itemName || `${item.brandName ?? ''} ${item.modelName ?? ''}`),
          price: Number(item.sellingPrice ?? item.totalCost ?? 0),
          condition: item.condition,
          storage: item.storage,
          colour: item.colour,
        },
      ]);
      setSearchQuery('');
      setPayments([{ method: 'cash', amount: 0 }]);
    },
    [billItems],
  );

  const removeItem = useCallback((id: string) => {
    setBillItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updatePayment = useCallback(
    (idx: number, field: 'method' | 'amount', value: string | number) => {
      setPayments((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
      );
    },
    [],
  );

  const addPaymentSplit = useCallback(
    () => setPayments((prev) => [...prev, { method: 'cash', amount: 0 }]),
    [],
  );

  const removePaymentSplit = useCallback(
    (idx: number) => setPayments((prev) => prev.filter((_, i) => i !== idx)),
    [],
  );

  const saleMutation = useMutation({
    mutationFn: async () => {
      // Separate phone items from accessory items
      const phoneItems = billItems.filter((i) => !i.id.startsWith('acc-'));
      const accItems = billItems.filter((i) => i.id.startsWith('acc-'));

      const salePayload = {
        branchId: branchId || undefined,
        items: phoneItems.map((i) => ({
          itemId: i.id,
          unitPrice: i.price,
        })),
        accessoryItems: accItems.map((i) => ({
          accessoryId: i.id.replace('acc-', ''),
          quantity: 1,
          unitPrice: i.price,
        })),
        payments: payments
          .filter((p) => p.amount > 0)
          .map((p) => ({ method: p.method, amount: p.amount })),
        discountAmount: discount > 0 ? (subtotal * discount) / 100 : 0,
        notes,
      };

      // Use the offline-aware submission
      const result = await offlinePOS.submitSale(salePayload);

      if (result.queued) {
        setOfflineSaleQueued(true);
        return { invoiceNumber: 'QUEUED', queued: true };
      }

      return { invoiceNumber: result.invoiceNumber, queued: false };
    },
    onSuccess: (result) => {
      if (result.queued) {
        toast.success('Sale queued — will sync when back online');
        setOfflineSaleQueued(true);
        // Clear the bill but stay on POS page
        setBillItems([]);
        setPayments([{ method: 'cash', amount: 0 }]);
        setDiscount(0);
        setNotes('');
        setClientPhone('');
      } else {
        toast.success(`Sale created! Invoice: ${result.invoiceNumber}`);
        router.push('/sales');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create sale');
    },
  });

  const handleCacheInventory = async () => {
    setCacheProgress('Caching inventory for offline use…');
    const count = await offlinePOS.cacheInventory();
    if (count > 0) {
      setCacheProgress(`Cached ${count} items for offline use ✓`);
      setTimeout(() => setCacheProgress(null), 3000);
    } else {
      setCacheProgress('No items to cache or network error');
      setTimeout(() => setCacheProgress(null), 3000);
    }
  };

  const handleClearBill = useCallback(() => {
    setBillItems([]);
    setPayments([{ method: 'cash', amount: 0 }]);
    setDiscount(0);
    setNotes('');
    setClientPhone('');
    setOfflineSaleQueued(false);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] animate-fade-in">
      {/* Offline Status Bar */}
      {!offlinePOS.isOnline && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="flex-1">
            You are offline — searching from local cache ({offlinePOS.cachedItemCount} items).
            Sales will be queued and synced automatically.
          </span>
          {offlinePOS.pendingSyncCount > 0 && (
            <span className="badge-warning text-xs">
              {offlinePOS.pendingSyncCount} pending
            </span>
          )}
        </div>
      )}

      {/* Online status info */}
      {offlinePOS.isOnline && offlinePOS.cachedItemCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-700">
          <Database className="w-3.5 h-3.5" />
          <span>{offlinePOS.cachedItemCount} items cached for offline</span>
          {offlinePOS.pendingSyncCount > 0 && (
            <span className="badge-warning text-[10px] ml-auto">
              {offlinePOS.pendingSyncCount} pending sync
            </span>
          )}
          <button onClick={handleCacheInventory} className="btn-ghost btn-sm text-xs ml-auto">
            <RefreshCw className="w-3 h-3" />
            Refresh Cache
          </button>
        </div>
      )}

      {/* Cache progress toast */}
      {cacheProgress && (
        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          {cacheProgress}
        </div>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Item Search + Bill */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-sm text-surface-900">
                POS Terminal
                {!offlinePOS.isOnline && (
                  <span className="ml-2 text-xs text-amber-500 font-normal">(Offline Mode)</span>
                )}
              </h1>
              <p className="text-sm text-surface-500">
                {offlinePOS.isOnline
                  ? 'Search items by IMEI, model, or brand'
                  : 'Searching from local cache'}
              </p>
            </div>
            {billItems.length > 0 && (
              <button onClick={handleClearBill} className="btn-ghost btn-sm text-xs">
                <X className="w-3.5 h-3.5" />
                Clear Bill
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                offlinePOS.isOnline
                  ? 'Search by IMEI, model, brand, or accessory…'
                  : 'Search cached inventory…'
              }
              className="input pl-9"
            />
            {searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 card shadow-lg z-10 max-h-64 overflow-y-auto p-0">
                {isSearching ? (
                  <div className="px-4 py-3 text-sm text-surface-400 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Searching…
                  </div>
                ) : searchResults.length === 0 && accessoryResults.length === 0 && !isSearchingAccessories ? (
                  <div className="px-4 py-3 text-sm text-surface-400">
                    {offlinePOS.isOnline
                      ? 'No items or accessories found'
                      : 'No items in local cache. Try refreshing the cache when online.'}
                  </div>
                ) : (
                  <>
                    {isSearchingAccessories && (
                      <div className="px-4 py-3 text-sm text-surface-400 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Searching accessories…
                      </div>
                    )}
                    {searchResults.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => addItem(item)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 text-left border-b border-surface-100 last:border-0 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.brandName ?? item.brand?.name ?? ''}{' '}
                            {item.modelName ?? item.model?.name ?? ''}
                          </p>
                          <p className="text-xs text-surface-400 font-mono">
                            {item.imei} ·{' '}
                            {CONDITION_LABELS[item.condition] || item.condition}
                            {item.storage ? ` · ${item.storage}` : ''}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary shrink-0 ml-2">
                          ₹{Number(item.sellingPrice ?? item.totalCost ?? 0).toLocaleString()}
                        </span>
                      </button>
                    ))}
                    {accessoryResults.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-surface-50 text-[10px] font-semibold uppercase tracking-wider text-surface-400 flex items-center gap-1.5 border-b border-surface-100">
                          <Package className="w-3 h-3" />
                          Accessories
                        </div>
                        {accessoryResults.map((item: any) => (
                          <button
                            key={`acc-${item.id}`}
                            onClick={() => addItem({ ...item, isAccessory: true })}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 text-left border-b border-surface-100 last:border-0 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-surface-400">
                                {item.sku} · {item.category?.replace('_', ' ')}
                                {item.brand?.name ? ` · ${item.brand.name}` : ''}
                                {item.stockQuantity > 0
                                  ? ` · Stock: ${item.stockQuantity}`
                                  : ' · Out of stock'}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-primary shrink-0 ml-2">
                              ₹{Number(item.sellingPrice ?? item.purchasePrice ?? 0).toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bill Items */}
          <div className="flex-1 card overflow-hidden flex flex-col p-0 min-h-0">
            <div className="px-4 py-3 border-b border-surface-100 text-xs font-medium text-surface-500 uppercase grid grid-cols-[1fr_auto_auto] gap-4">
              <span>Item</span>
              <span>Price</span>
              <span></span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-surface-100">
              {billItems.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-surface-400">
                  Search and add items to the bill
                </div>
              ) : (
                billItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 grid grid-cols-[1fr_auto_auto] gap-4 items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-surface-400 font-mono truncate">
                        {item.imei} · {CONDITION_LABELS[item.condition] || item.condition}
                        {item.storage ? ` · ${item.storage}` : ''}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      ₹{item.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-surface-400 hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Payment Panel */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto shrink-0">
          <div className="card p-4 space-y-3">
            <h2 className="font-medium text-surface-800">Order Summary</h2>

            <div>
              <label className="block text-xs text-surface-500 mb-1">
                Client Phone (optional)
              </label>
              <input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="9876543210"
                className="input"
              />
            </div>

            <div>
              <label className="block text-xs text-surface-500 mb-1">Discount (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="input"
              />
            </div>

            <div className="space-y-1.5 text-sm border-t border-surface-100 pt-3">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal ({billItems.length} item{billItems.length !== 1 ? 's' : ''})</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({discount}%)</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-surface-600">
                <span>GST (18%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-surface-900 text-base border-t border-surface-100 pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Splits */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-surface-800">Payment</h2>
              <button
                onClick={addPaymentSplit}
                className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Split
              </button>
            </div>

            {payments.map((p, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={p.method}
                  onChange={(e) => updatePayment(idx, 'method', e.target.value)}
                  className="select flex-1"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  value={p.amount || ''}
                  onChange={(e) => updatePayment(idx, 'amount', Number(e.target.value))}
                  placeholder="Amount"
                  className="input w-24"
                />
                {payments.length > 1 && (
                  <button
                    onClick={() => removePaymentSplit(idx)}
                    className="text-surface-400 hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <div
              className={`text-sm font-medium ${
                Math.abs(balance) < 0.01
                  ? 'text-emerald-600'
                  : balance > 0
                    ? balance < total
                      ? 'text-amber-600'
                      : 'text-red-500'
                    : 'text-red-500'
              }`}
            >
              {Math.abs(balance) < 0.01 ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Payment balanced
                </span>
              ) : balance > 0 ? (
                `Balance due: ₹${balance.toFixed(2)}`
              ) : (
                `Overpaid by: ₹${Math.abs(balance).toFixed(2)}`
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-surface-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input resize-none min-h-[60px]"
              placeholder={offlinePOS.isOnline ? '' : 'Will be saved and synced later'}
            />
          </div>

          {/* Error display */}
          {saleMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                {(saleMutation.error as any)?.response?.data?.error?.message ??
                  (saleMutation.error as any)?.response?.data?.message ??
                  (saleMutation.error as any)?.message ??
                  'Failed to create sale'}
              </span>
            </div>
          )}

          {/* Offline sale queued message */}
          {offlineSaleQueued && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-3 py-2 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                Sale queued for sync ({offlinePOS.pendingSyncCount} pending).
                It will be processed when back online.
              </span>
            </div>
          )}

          <Button
            onClick={() => saleMutation.mutate()}
            disabled={
              billItems.length === 0 ||
              Math.abs(balance) > 0.01 ||
              saleMutation.isPending
            }
            isLoading={saleMutation.isPending}
          >
            {saleMutation.isPending ? (
              'Processing…'
            ) : !offlinePOS.isOnline ? (
              `Queue Sale — ₹${total.toFixed(2)}`
            ) : (
              `Complete Sale — ₹${total.toFixed(2)}`
            )}
          </Button>

          {/* Quick actions when offline */}
          {!offlinePOS.isOnline && offlinePOS.cachedItemCount === 0 && (
            <div className="text-center">
              <button
                onClick={handleCacheInventory}
                className="btn-outline btn-sm text-xs"
              >
                <Database className="w-3 h-3" />
                Cache Inventory for Offline
              </button>
              <p className="text-[10px] text-surface-400 mt-1">
                Do this when online to enable offline search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
