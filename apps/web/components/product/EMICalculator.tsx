'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface EmiPlanResult {
  id: string;
  providerId: string;
  providerName: string;
  providerSlug: string;
  label: string;
  tenureMonths: number;
  annualRate: number;
  processingFee: number;
  minAmount: number;
  emiAmount: number;
  totalInterest: number;
  totalPayment: number;
  effectivePrincipal: number;
}

export function EMICalculator({ price }: { price: number }) {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<EmiPlanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || plans.length > 0 || price <= 0) return;

    setLoading(true);
    setError('');

    fetch(`${API}/public/emi/plans?amount=${Math.round(price)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load EMI plans');
        return res.json();
      })
      .then((json) => {
        setPlans(json.data ?? []);
      })
      .catch((err) => {
        setError(err?.message ?? 'Could not load EMI plans');
      })
      .finally(() => setLoading(false));
  }, [open, price, plans.length]);

  // Group plans by provider
  const groupedPlans = plans.reduce<Record<string, EmiPlanResult[]>>((acc, plan) => {
    const key = plan.providerName || plan.providerSlug;
    if (!acc[key]) acc[key] = [];
    acc[key].push(plan);
    return acc;
  }, {});

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <span>EMI Calculator</span>
          {plans.some(p => Number(p.minAmount) <= price) && (
            <span className="badge-success text-[10px] ml-1">{plans.length} plans</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="p-4 border-t border-surface-100 bg-surface-50/50">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-surface-100 rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-surface-400">EMI plans temporarily unavailable.</p>
              <p className="text-xs text-surface-300 mt-1">Please check back later or visit our store.</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-surface-500">
                {price < 3000
                  ? 'EMI is available on orders above ₹3,000.'
                  : 'No EMI plans available for this amount.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedPlans).map(([providerName, providerPlans]) => (
                <div key={providerName}>
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {providerName}
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-surface-400 text-[10px] uppercase tracking-wider">
                        <th className="text-left pb-2 font-medium">Tenure</th>
                        <th className="text-left pb-2 font-medium">Rate</th>
                        <th className="text-right pb-2 font-medium">Monthly EMI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providerPlans.map((plan) => (
                        <tr key={plan.id} className="border-t border-surface-100/80">
                          <td className="py-2 text-surface-700 font-medium">{plan.label}</td>
                          <td className="py-2 text-surface-500">
                            {plan.annualRate === 0 ? (
                              <span className="text-emerald-600 font-semibold">No Cost</span>
                            ) : (
                              <span>{plan.annualRate}% p.a.</span>
                            )}
                          </td>
                          <td className="py-2 text-right font-bold text-surface-900">
                            ₹{plan.emiAmount.toLocaleString('en-IN')}/mo
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              <div className="space-y-1.5 pt-3 border-t border-surface-100">
                {plans.slice(0, 1).map((plan) => (
                  plan.totalInterest > 0 && (
                    <p key={`info-${plan.id}`} className="text-[11px] text-surface-400 flex items-center gap-1.5">
                      <span>💡</span>
                      Total interest: <span className="font-semibold text-surface-600">₹{plan.totalInterest.toLocaleString('en-IN')}</span>
                      {' · '}Total payment: <span className="font-semibold text-surface-600">₹{plan.totalPayment.toLocaleString('en-IN')}</span>
                    </p>
                  )
                ))}
                <p className="text-[10px] text-surface-400 mt-1">
                  *EMI subject to bank approval. Available on orders ₹3,000+.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
