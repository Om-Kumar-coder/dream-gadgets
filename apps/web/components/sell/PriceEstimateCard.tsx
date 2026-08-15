'use client';

import { useState, useEffect, useRef } from 'react';

interface PriceEstimateCardProps {
  brand: string;
  modelName: string;
  condition: string;
  screenCondition?: string;
  bodyCondition?: string;
  batteryHealth?: string;
  functionalIssues?: string;
  estimatedPrice: number | null;
  onUpdate: (data: Partial<{ estimatedPrice: number | null }>) => void;
}

interface EstimateResponse {
  estimatedPrice: number | null;
  dataSource: 'price_guide' | 'historical_sales' | 'no_data';
  confidence: 'high' | 'medium' | 'low' | 'none';
  modelName?: string;
  brand?: string;
  condition?: string;
  baseValue?: number | null;
  basePrice?: number;
  conditionMultiplier?: number;
  adjustments?: {
    screen: number;
    body: number;
    battery: number;
    functional: number;
  };
  sampleCount?: number;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function pct(factor: number | undefined): string {
  if (factor == null) return '-';
  return `${Math.round(factor * 100)}%`;
}

export function PriceEstimateCard({
  brand,
  modelName,
  condition,
  screenCondition,
  bodyCondition,
  batteryHealth,
  functionalIssues,
  estimatedPrice,
  onUpdate,
}: PriceEstimateCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [animatedPrice, setAnimatedPrice] = useState(0);
  const requestSeq = useRef(0);

  // Fetch server-side estimate whenever device or assessment changes
  useEffect(() => {
    if (!condition || !modelName) return;

    const seq = ++requestSeq.current;
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    fetch(`${API}/public/buyback/estimate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        brand,
        modelName,
        condition,
        ...(screenCondition ? { screenCondition } : {}),
        ...(bodyCondition ? { bodyCondition } : {}),
        ...(batteryHealth ? { batteryHealth } : {}),
        ...(functionalIssues ? { functionalIssues } : {}),
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || 'Failed to get estimate');
        }
        return res.json();
      })
      .then((json) => {
        if (seq !== requestSeq.current) return; // stale response
        const data: EstimateResponse = json?.data ?? json;
        setEstimate(data);
        onUpdate({ estimatedPrice: data.estimatedPrice });
      })
      .catch((err: any) => {
        if (seq !== requestSeq.current) return;
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Something went wrong. Please try again.');
      })
      .finally(() => {
        clearTimeout(timer);
        if (seq === requestSeq.current) setLoading(false);
      });

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [brand, modelName, condition, screenCondition, bodyCondition, batteryHealth, functionalIssues, onUpdate]);

  // Animate price counting up
  useEffect(() => {
    if (estimatedPrice === null) return;
    const duration = 800;
    const start = performance.now();
    const from = 0;
    const to = estimatedPrice;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPrice(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [estimatedPrice]);

  const maxPrice = estimatedPrice ? Math.round(estimatedPrice * 1.3) : null;
  const adjustments = estimate?.adjustments;
  const hasAdjustments = adjustments && Object.values(adjustments).some((f) => f < 1);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm text-surface-900 mb-1">Your Price Estimate</h3>
        <p className="text-sm text-surface-500">Based on current market value and device condition</p>
      </div>

      {/* Device summary */}
      <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-2xl border border-surface-100">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl ring-1 ring-primary/20">
          📱
        </div>
        <div>
          <p className="font-semibold text-surface-900">{brand} {modelName}</p>
          <p className="text-sm text-surface-500 capitalize">{condition.replace(/_/g, ' ')} condition</p>
        </div>
      </div>

      {/* Price card */}
      {loading ? (
        <div className="h-32 bg-surface-100 rounded-2xl animate-pulse" />
      ) : error ? (
        <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-surface-700 font-medium mb-1">Couldn&apos;t fetch the estimate right now</p>
          <p className="text-sm text-surface-500">{error}</p>
          <p className="text-xs text-surface-400 mt-2">You can still continue — our team will quote the final price after inspection.</p>
        </div>
      ) : estimatedPrice ? (
        <div className="relative text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20 animate-scale-in overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <p className="text-sm text-surface-500 mb-2">Estimated Price</p>
          <div className="text-5xl sm:text-6xl font-extrabold text-primary mb-2 tracking-tight">
            ₹{animatedPrice.toLocaleString('en-IN')}
          </div>
          {maxPrice && (
            <p className="text-sm text-surface-500">
              Devices like this sell for up to <span className="font-semibold text-surface-700">₹{maxPrice.toLocaleString('en-IN')}</span>
            </p>
          )}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-surface-400">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {estimate?.dataSource === 'historical_sales' ? (
              <span>Based on {estimate?.sampleCount ?? 0} recent {estimate?.sampleCount === 1 ? 'sale' : 'sales'} at our stores</span>
            ) : estimate?.confidence === 'high' ? (
              <span>Based on current market value</span>
            ) : (
              <span>Based on current market value</span>
            )}
          </div>
        </div>
      ) : estimate?.dataSource === 'no_data' ? (
        <div className="text-center p-8 bg-surface-50 rounded-2xl border border-surface-100">
          <p className="text-surface-700 font-semibold mb-1">Instant quote not available for this model yet</p>
          <p className="text-sm text-surface-500">
            No problem! Submit your details and our team will call you with the best price within 24 hours.
          </p>
        </div>
      ) : (
        <div className="text-center p-8 bg-surface-50 rounded-2xl border border-surface-100">
          <p className="text-surface-400">Select a condition to see your estimated price</p>
        </div>
      )}

      {/* Price breakdown */}
      {estimatedPrice && estimate?.baseValue != null && (
        <div className="space-y-2 text-sm animate-fade-in-up">
          <p className="font-semibold text-surface-700">Price Breakdown</p>
          <div className="bg-surface-50 rounded-xl p-4 space-y-2 border border-surface-100">
            <div className="flex justify-between">
              <span className="text-surface-500">Base value ({estimate?.modelName ?? modelName})</span>
              <span className="font-medium text-surface-900">₹{Number(estimate.baseValue).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Condition adjustment</span>
              <span className="font-medium text-emerald-600">{pct(estimate.conditionMultiplier)}</span>
            </div>
            {hasAdjustments && (
              <>
                {adjustments && adjustments.screen < 1 && (
                  <div className="flex justify-between">
                    <span className="text-surface-500">Screen ({screenCondition})</span>
                    <span className="font-medium text-emerald-600">{pct(adjustments.screen)}</span>
                  </div>
                )}
                {adjustments && adjustments.body < 1 && (
                  <div className="flex justify-between">
                    <span className="text-surface-500">Body ({bodyCondition})</span>
                    <span className="font-medium text-emerald-600">{pct(adjustments.body)}</span>
                  </div>
                )}
                {adjustments && adjustments.battery < 1 && (
                  <div className="flex justify-between">
                    <span className="text-surface-500">Battery ({batteryHealth})</span>
                    <span className="font-medium text-emerald-600">{pct(adjustments.battery)}</span>
                  </div>
                )}
                {adjustments && adjustments.functional < 1 && (
                  <div className="flex justify-between">
                    <span className="text-surface-500">Functional issues</span>
                    <span className="font-medium text-emerald-600">{pct(adjustments.functional)}</span>
                  </div>
                )}
              </>
            )}
            <div className="border-t border-surface-200 pt-2 flex justify-between font-bold">
              <span className="text-surface-900">Your estimated price</span>
              <span className="text-primary">₹{estimatedPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <p className="text-xs text-surface-400">*Final price determined after in-person inspection</p>
        </div>
      )}
    </div>
  );
}
