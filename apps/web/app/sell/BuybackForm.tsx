'use client';

import { useState, type FormEvent } from 'react';

interface BuybackFormProps {
  brands: string[];
}

interface FormState {
  brand: string;
  modelName: string;
  phone: string;
}

export function BuybackForm({ brands }: BuybackFormProps) {
  const [form, setForm] = useState<FormState>({ brand: '', modelName: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isValid = form.brand && form.modelName.trim() && form.phone.trim().length >= 10;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${apiUrl}/public/buyback/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: form.brand,
          modelName: form.modelName.trim(),
          phone: form.phone.trim(),
          deviceType: 'mobile',
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || 'Failed to submit. Please try again.');
      }

      setSuccess(true);
      setForm({ brand: '', modelName: '', phone: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xl">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
        <p className="text-gray-500 text-sm mb-6">
          Our team will contact you shortly with the best price for your device.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 text-left max-w-lg mx-auto shadow-xl">
      <h2 className="font-bold text-gray-900 mb-4">Get Instant Quote</h2>
      <div className="space-y-3">
        <select
          value={form.brand}
          onChange={(e) => setForm(f => ({ ...f, brand: e.target.value }))}
          className="w-full border border-gray-700 rounded-xl px-4 py-3 text-sm text-white bg-slate-950 focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#E50914' } as React.CSSProperties}
          required
        >
          <option value="" className="text-gray-800">Select Brand</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <input
          type="text"
          value={form.modelName}
          onChange={(e) => setForm(f => ({ ...f, modelName: e.target.value }))}
          placeholder="Enter Model Name (e.g. iPhone 13)"
          className="w-full border border-gray-700 rounded-xl px-4 py-3 text-sm text-white bg-slate-950 focus:outline-none focus:ring-2 placeholder-gray-500"
          style={{ '--tw-ring-color': '#E50914' } as React.CSSProperties}
          required
        />

        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="Your Phone Number"
          className="w-full border border-gray-700 rounded-xl px-4 py-3 text-sm text-white bg-slate-950 focus:outline-none focus:ring-2 placeholder-gray-500"
          style={{ '--tw-ring-color': '#E50914' } as React.CSSProperties}
          required
          minLength={10}
        />

        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Get My Price →'
          )}
        </button>
      </div>
    </form>
  );
}
