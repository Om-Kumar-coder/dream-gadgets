import type { Metadata } from 'next';
import Link from 'next/link';
import { SellWizard } from '../../components/sell/SellWizard';
import { ScrollReveal } from '../../components/ui/ScrollReveal';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';
import { StaticOfferBanner, StaticMidBanner } from '../../components/banner/StaticPageBanners';

export const metadata: Metadata = {
  title: 'Sell Your Phone — Dream Gadgets',
  description: 'Get the best price for your old phone. Free doorstep pickup, instant payment via bank transfer or UPI. Sell in 60 seconds.',
  openGraph: {
    title: 'Sell Your Phone — Dream Gadgets',
    description: 'Get the best price for your old phone. Free doorstep pickup, instant payment. Sell in 60 seconds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sell Your Phone — Dream Gadgets',
    description: 'Get the best price for your old phone. Doorstep pickup, instant payment.',
  },
};

const HOW_IT_WORKS = [
  { step: '01', icon: '💰', title: 'Get Instant Quote', desc: 'Select your device and condition to get the best price instantly.' },
  { step: '02', icon: '📅', title: 'Schedule Pickup', desc: 'Choose a convenient time. Our agent comes to your doorstep.' },
  { step: '03', icon: '🔍', title: 'Device Inspection', desc: 'Quick on-spot inspection to verify the condition.' },
  { step: '04', icon: '⚡', title: 'Instant Payment', desc: 'Get paid instantly via bank transfer or UPI.' },
];

const BENEFITS = [
  { icon: '💰', title: 'Best Price Assured', desc: 'We offer the highest market price for your device, guaranteed.' },
  { icon: '🚚', title: 'Free Doorstep Pickup', desc: 'Free pickup from your home or office anywhere in India.' },
  { icon: '⚡', title: 'Instant Payment', desc: 'Get paid via bank transfer or UPI within minutes of inspection.' },
  { icon: '🛡️', title: 'Secure Data Wipe', desc: 'Complete data erasure before your device is processed.' },
  { icon: '⭐', title: '1M+ Happy Customers', desc: 'Trusted by millions across India for selling their devices.' },
  { icon: '📞', title: 'Dedicated Support', desc: 'Our team is available 7 days a week to assist you.' },
];

export default function SellPage() {
  return (
    <main>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Sell Your Phone', url: '/sell' },
      ]} />
      <JsonLd data={webPageSchema('Sell Your Phone — Dream Gadgets', 'Get the best price for your old phone. Doorstep pickup, instant payment.', [
        { name: 'Home', url: '/' },
        { name: 'Sell Your Phone', url: '/sell' },
      ])} />
      {/* ════════════════════════════════════
          HERO
          ════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-950 via-surface-900 to-primary/20 py-20 md:py-24 px-4 text-center">
        <div className="absolute inset-0 noise-bg" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/10">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-soft" />
            Sell in 60 Seconds
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4">
            Sell Your Old Phone<br />
            <span className="text-gradient-brand">Get Best Price Today!</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg mb-6 max-w-xl mx-auto">
            Highest price guaranteed · Free doorstep pickup · Instant payment
          </p>
          <div className="flex items-center justify-center gap-6 md:gap-10 text-xs text-white/50">
            <span className="flex items-center gap-1.5">⭐ 4.8 Rating</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5">🏆 1M+ Customers</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5">📍 Pan India</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          WIZARD
          ════════════════════════════════════ */}
      <section className="container-narrow -mt-8 relative z-10 pb-16 md:pb-20">
        <SellWizard />
      </section>

      {/* ════════════════════════════════════
          STATS BAR
          ════════════════════════════════════ */}
      <section className="bg-surface-50 border-y border-surface-100">
        <div className="container-narrow py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { v: '10,000+', l: 'Phones Sold' },
              { v: '4.8 ★', l: 'Customer Rating' },
              { v: '50+', l: 'Cities Covered' },
              { v: '100%', l: 'Secure Payments' },
            ].map(s => (
              <div key={s.l}>
                <p className="text-2xl md:text-3xl font-extrabold text-primary">{s.v}</p>
                <p className="text-xs text-surface-500 mt-0.5 font-medium">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════ */}
      <section className="section-pad container-page">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle mx-auto">Sell your phone in 4 simple steps</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((s, i) => (
            <ScrollReveal key={s.step} delay={i * 100}>
              <div className="how-it-works-step bg-white border border-surface-100 hover:shadow-elevation-3 hover:-translate-y-1.5 transition-all duration-300">
                <div className="how-it-works-icon bg-primary/10 text-primary">
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <span className="text-xs font-bold text-primary tracking-widest">STEP {s.step}</span>
                <h3 className="font-bold text-surface-900">{s.title}</h3>
                <p className="text-xs text-surface-500 leading-relaxed">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          BENEFITS
          ════════════════════════════════════ */}
      <section className="bg-surface-50 section-pad">
        <div className="container-narrow">
          <ScrollReveal>
            <h2 className="section-title text-center mb-10">Why Sell with Dream Gadgets?</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <ScrollReveal key={b.title} delay={i * 80} slideLeft={i % 2 === 0} slideRight={i % 2 === 1}>
                <div className="card-hover flex gap-4 p-5">
                  <span className="text-2xl shrink-0 mt-0.5">{b.icon}</span>
                  <div>
                    <h3 className="font-bold text-surface-900 mb-1 text-sm">{b.title}</h3>
                    <p className="text-sm text-surface-500">{b.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          MID-PAGE PROMOTIONAL BANNER
          ════════════════════════════════════ */}
      <StaticMidBanner />

      {/* ════════════════════════════════════
          FAQ
          ════════════════════════════════════ */}
      <section className="section-pad container-narrow">
        <h2 className="section-title text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: 'How is the price calculated?', a: 'We analyze current market data, device condition, and recent sales to give you the best possible price.' },
            { q: 'How long does the process take?', a: 'From quote to payment, the entire process takes less than 24 hours. Same-day pickup available in select cities.' },
            { q: 'What documents are required?', a: 'A valid government ID (Aadhaar, PAN, or Driving License) and the original invoice (if available).' },
            { q: 'What if I change my mind?', a: 'You can cancel anytime before inspection. No questions asked.' },
          ].map(faq => (
            <details key={faq.q} className="group bg-white border border-surface-100 rounded-2xl overflow-hidden hover:border-surface-200 transition-colors">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-semibold text-surface-900 hover:bg-surface-50 transition-colors">
                {faq.q}
                <svg className="w-4 h-4 text-surface-400 group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-4 pb-4 text-sm text-surface-500">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          BRANDS
          ════════════════════════════════════ */}
      <section className="bg-surface-50 section-pad-sm">
        <div className="container-narrow text-center">
          <p className="text-xs text-surface-400 font-bold uppercase tracking-wider mb-5">We Accept All Major Brands</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {['Apple', 'Samsung', 'OnePlus', 'Oppo', 'Vivo', 'Xiaomi', 'Realme', 'Motorola', 'Google', 'Nokia', 'Nothing', 'Asus', 'LG', 'Sony'].map(b => (
              <span key={b} className="text-sm text-surface-600 bg-white border border-surface-200 px-4 py-2 rounded-full font-medium hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all cursor-default">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          PROMOTIONAL OFFER BANNER
          ════════════════════════════════════ */}
      <StaticOfferBanner />
    </main>
  );
}
