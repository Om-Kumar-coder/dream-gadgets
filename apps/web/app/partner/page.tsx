'use client';

import { useState } from 'react';
import Link from 'next/link';

const PARTNER_TYPES = [
  {
    icon: '🏪',
    title: 'Retail Partner',
    desc: 'Open a franchise or partner store and sell certified refurbished devices in your area. Get access to our inventory, training, and marketing support.',
    benefits: ['Exclusive inventory access', 'Store branding support', 'Marketing materials', 'Training program'],
  },
  {
    icon: '🔧',
    title: 'Service Partner',
    desc: 'Provide device inspection, repair, and quality certification services. Join our network of trusted service centers across India.',
    benefits: ['Certification training', 'Regular service volume', 'Spare parts support', 'Quality tools'],
  },
  {
    icon: '📦',
    title: 'Bulk Supplier',
    desc: 'Supply devices in bulk to Dream Gadgets for refurbishment and resale. We offer competitive pricing and reliable payment terms.',
    benefits: ['Bulk pricing', 'Quick payments', 'Pickup service', 'Long-term contracts'],
  },
  {
    icon: '🤝',
    title: 'Affiliate Partner',
    desc: 'Earn commissions by referring customers to Dream Gadgets. Join our affiliate program and earn up to 5% on every successful sale.',
    benefits: ['Competitive commissions', 'Real-time tracking', 'Marketing assets', 'Monthly payouts'],
  },
];

export default function PartnerPage() {
  const [form, setForm] = useState({ name: '', businessName: '', email: '', phone: '', partnerType: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.partnerType) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${apiUrl}/public/partner/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok && res.status !== 404) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit inquiry.');
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="animate-fade-in">
        <section className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="heading-md text-surface-900 mb-2">Inquiry Submitted!</h1>
          <p className="text-surface-500 text-sm mb-8">
            Thank you for your interest in partnering with Dream Gadgets. Our partnerships team will review your inquiry and reach out within 2 business days.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="btn-secondary btn-md">Go Home</Link>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', businessName: '', email: '', phone: '', partnerType: '', message: '' }); }}
              className="btn-outline btn-md"
            >
              Submit Another
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="animate-fade-in">
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-3">Become a Partner</h1>
          <p className="text-white/70 text-sm max-w-xl mx-auto">
            Join India&apos;s most transparent mobile selling platform. Whether you&apos;re a retailer, service center, supplier, or affiliate — grow your business with Dream Gadgets.
          </p>
        </div>
      </section>

      {/* Partner Types */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {PARTNER_TYPES.map((p) => (
            <div key={p.title} className="card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
              <span className="text-4xl mb-3 block">{p.icon}</span>
              <h3 className="font-bold text-surface-900 text-lg mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
              <p className="text-sm text-surface-600 leading-relaxed mb-4">{p.desc}</p>
              <ul className="space-y-1.5">
                {p.benefits.map((b) => (
                  <li key={b} className="text-xs text-surface-500 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: Stats */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="heading-md text-surface-900">Why Partner With Us?</h2>
            <div className="space-y-4">
              {[
                { stat: '50,000+', label: 'Happy Customers' },
                { stat: '200+', label: 'Partner Locations' },
                { stat: '₹50Cr+', label: 'Partner Payouts' },
                { stat: '95%', label: 'Satisfaction Rate' },
              ].map((s) => (
                <div key={s.label} className="card p-4 flex items-center justify-between hover:shadow-card-hover transition-all">
                  <span className="text-sm text-surface-600">{s.label}</span>
                  <span className="text-lg font-bold text-primary">{s.stat}</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-xs text-surface-700 leading-relaxed">
                <strong>Trusted by businesses across India.</strong> Our partner network spans retail stores, service centers, and bulk suppliers in over 100 cities. Join the network and be part of India&apos;s circular economy.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3 card p-6">
            <h3 className="font-bold text-surface-900 text-lg mb-1">Partner Inquiry Form</h3>
            <p className="text-sm text-surface-500 mb-6">Fill out the form and our partnerships team will contact you within 2 business days.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-surface-500 mb-1 font-medium">Full Name *</label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="input-field" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1 font-medium">Business Name</label>
                  <input type="text" value={form.businessName}
                    onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    className="input-field" placeholder="Your business name" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-surface-500 mb-1 font-medium">Email Address *</label>
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="input-field" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1 font-medium">Phone Number *</label>
                  <input type="tel" required value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input-field" placeholder="10-digit mobile number" minLength={10} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-surface-500 mb-1 font-medium">Partner Type *</label>
                <select required value={form.partnerType}
                  onChange={(e) => setForm((f) => ({ ...f, partnerType: e.target.value }))}
                  className="input-field">
                  <option value="">Select partner type...</option>
                  {PARTNER_TYPES.map((p) => (
                    <option key={p.title} value={p.title}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-surface-500 mb-1 font-medium">Message (optional)</label>
                <textarea rows={3} value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="input-field resize-none" placeholder="Tell us about your business..." />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button type="submit" disabled={submitting} className="btn-primary btn-lg w-full">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Inquiry →'
                )}
              </button>

              <p className="text-xs text-surface-400 text-center">
                By submitting, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
