import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Sell / Buyback — Get The Best Price For Your Phone | Dream Gadgets',
  description: 'Sell your old phone at the best price. Get an instant online estimate, doorstep pickup, and instant payment. Certified & transparent — Dream Gadgets Kolkata.',
};

const STEPS = [
  {
    icon: '📱',
    title: 'Tell us about your phone',
    desc: 'Pick your brand, model, and condition. It takes under a minute.',
  },
  {
    icon: '💰',
    title: 'Get an instant estimate',
    desc: 'Our price engine calculates a fair market price on the spot — no haggling.',
  },
  {
    icon: '🚪',
    title: 'Doorstep pickup or visit a store',
    desc: 'We pick up for free across India, or drop by any of our 7 Kolkata stores.',
  },
  {
    icon: '⚡',
    title: 'Get paid instantly',
    desc: 'Inspect with you, confirm the price, and pay immediately — cash or UPI.',
  },
];

const HIGHLIGHTS = [
  { icon: '🛡️', title: '100% Transparent', desc: 'The quoted price is the paid price — no last-minute deductions.' },
  { icon: '🔒', title: 'Data Safe', desc: 'We wipe your data on the spot. Your privacy stays yours.' },
  { icon: '♻️', title: 'Eco-Friendly', desc: 'Your phone gets a second life instead of ending up as e-waste.' },
  { icon: '🤝', title: 'Trusted Since 2020', desc: 'One of Kolkata’s most trusted mobile sellers and buyers.' },
];

export default function BuybackPage() {
  return (
    <main className="animate-fade-in">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Sell / Buyback', url: '/buyback' },
      ]} />

      {/* Hero */}
      <section className="text-white py-16 px-4 relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 rounded-full text-xs font-bold text-primary-foreground mb-5">
            💰 Best Price Guaranteed
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Sell Your Phone.<br />
            <span className="text-gradient-brand">Get Paid Instantly.</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Get a real price for your old phone in 30 seconds. Free doorstep pickup, on-the-spot inspection,
            and instant payment — no pressure, no drama.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/30"
            >
              Get My Price Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/stores"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm hover:bg-white/20 active:scale-[0.97] transition-all border border-white/10"
            >
              Visit A Store
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-10 pt-6 border-t border-white/10">
            {[
              ['10K+', 'Phones Bought'],
              ['₹30K+', 'Avg. Payout'],
              ['4.8★', 'Customer Rating'],
            ].map(([num, label]) => (
              <div key={label}>
                <p className="text-xl font-bold">{num}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-surface-50 border-y border-surface-100">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HIGHLIGHTS.map(h => (
              <div key={h.title} className="flex gap-4">
                <span className="text-3xl shrink-0">{h.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 mb-1">{h.title}</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="commonHdn">
          <h3><span>How</span> It Works</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card p-6 relative overflow-hidden">
              <span className="absolute -top-2 -right-1 text-7xl font-extrabold text-surface-50 select-none">
                {i + 1}
              </span>
              <span className="text-4xl mb-4 block">{s.icon}</span>
              <h4 className="text-sm font-bold text-surface-900 mb-2">{s.title}</h4>
              <p className="text-xs text-surface-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/30"
          >
            Start Selling Now
          </Link>
        </div>
      </section>

      {/* Mini FAQ */}
      <section className="bg-surface-50 border-t border-surface-100 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="commonHdn">
            <h3><span>Common</span> Questions</h3>
          </div>
          <div className="space-y-3">
            {[
              ['How is my price calculated?', 'We use current resale market data, your device model, storage, condition, screen, and battery health to compute a fair price instantly.'],
              ['How do I get paid?', 'Cash, UPI, or bank transfer — the choice is yours. Payment happens the moment the inspection is done.'],
              ['What if my phone is damaged?', 'No problem — we still buy it. The estimate adjusts for condition, and we’ll show you exactly how the price was calculated.'],
              ['Is my data safe?', 'Yes. We perform a full factory reset in front of you and remove the SIM card before you hand the device over.'],
            ].map(([q, a]) => (
              <details key={q} className="group bg-white rounded-2xl border border-surface-100 p-5">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-surface-900 list-none">
                  {q}
                  <svg className="w-4 h-4 text-surface-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-surface-500 leading-relaxed mt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
