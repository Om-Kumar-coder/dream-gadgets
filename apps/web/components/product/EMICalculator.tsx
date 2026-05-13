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
    <div className="border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/50">
        <span>EMI Calculator</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="p-3 border-t bg-muted/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left pb-2">Tenure</th>
                <th className="text-left pb-2">Rate</th>
                <th className="text-right pb-2">Monthly EMI</th>
              </tr>
            </thead>
            <tbody>
              {EMI_PLANS.map(plan => (
                <tr key={plan.months} className="border-t">
                  <td className="py-2">{plan.months} months</td>
                  <td className="py-2">{plan.rate}% p.a.</td>
                  <td className="py-2 text-right font-medium">
                    ₹{calcEMI(price, plan.rate, plan.months).toLocaleString('en-IN')}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-2">*EMI subject to bank approval. Bajaj Finserv EMI available in-store.</p>
        </div>
      )}
    </div>
  );
}
