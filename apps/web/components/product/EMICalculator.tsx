'use client';
import { useState } from 'react';

const EMI_PLANS = [
  { months: 3, rate: 14 },
  { months: 6, rate: 14 },
  { months: 9, rate: 15 },
  { months: 12, rate: 16 },
  { months: 18, rate: 17 },
  { months: 24, rate: 18 },
];

function calcEMI(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

export function EMICalculator({ price }: { price: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <span>EMI Calculator</span>
        </div>
        <svg className={`w-4 h-4 text-surface-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="p-4 border-t border-surface-100 bg-surface-50/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-surface-500 text-xs uppercase tracking-wider">
                <th className="text-left pb-2 font-medium">Tenure</th>
                <th className="text-left pb-2 font-medium">Rate</th>
                <th className="text-right pb-2 font-medium">Monthly EMI</th>
              </tr>
            </thead>
            <tbody>
              {EMI_PLANS.map(plan => (
                <tr key={plan.months} className="border-t border-surface-100">
                  <td className="py-2 text-surface-700">{plan.months} months</td>
                  <td className="py-2 text-surface-700">{plan.rate}% p.a.</td>
                  <td className="py-2 text-right font-semibold text-surface-900">
                    ₹{calcEMI(price, plan.rate, plan.months).toLocaleString('en-IN')}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-surface-400 mt-3">*EMI subject to bank approval. Bajaj Finserv EMI available in-store.</p>
        </div>
      )}
    </div>
  );
}
