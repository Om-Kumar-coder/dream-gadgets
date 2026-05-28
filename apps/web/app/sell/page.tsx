import type { Metadata } from 'next';
import Link from 'next/link';
import { SellWizard } from '../../components/sell/SellWizard';

export const metadata: Metadata = {
  title: 'Sell Your Phone — Dream Gadgets',
  description: 'Get the best price for your old phone. Doorstep pickup, instant payment. Sell in 60 seconds.',
};

const HOW_IT_WORKS = [
  { step: '01', icon: '📋', title: 'Get Instant Quote', desc: 'Select your device and condition to get the best price instantly.' },
  { step: '02', icon: '📅', title: 'Schedule Pickup', desc: 'Choose a convenient time. Our agent comes to your doorstep.' },
  { step: '03', icon: '🔍', title: 'Device Inspection', desc: 'Quick on-spot inspection to verify the condition.' },
  { step: '04', icon: '💸', title: 'Instant Payment', desc: 'Get paid instantly via bank transfer or UPI.' },
];

const BENEFITS = [
  { icon: '💰', title: 'Best Price Assured', desc: 'We offer the highest market price for your device, guaranteed.' },
  { icon: '🚗', title: 'Free Doorstep Pickup', desc: 'Free pickup from your home or office anywhere in India.' },
  { icon: '⚡', title: 'Instant Payment', desc: 'Get paid via bank transfer or UPI within minutes of inspection.' },
  { icon: '🔒', title: 'Secure Data Wipe', desc: 'Complete data erasure before your device is processed.' },
  { icon: '🏆', title: '1M+ Happy Customers', desc: 'Trusted by millions across India for selling their devices.' },
  { icon: '📞', title: 'Dedicated Support', desc: 'Our team is available 7 days a week to assist you.' },
];

export default function SellPage() {
  return (
    <main>
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
      }}>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            ✦ Sell in 60 Seconds
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-3 leading-tight">
            Sell Your Old Phone<br />
            <span className="text-primary">Get Best Price Today!</span>
          </h1>
          <p className="text-white/70 text-base mb-2">Highest price guaranteed · Free doorstep pickup · Instant payment</p>
          <div className="flex items-center justify-center gap-6 text-xs text-white/50 mt-4">
            <span>⭐ 4.8 Rating</span>
            <span>🏆 1M+ Customers</span>
            <span>📍 Pan India</span>
          </div>
        </div>
      </section>

      {/* Wizard Section */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 pb-16">
        <SellWizard />
      </section>

      {/* Stats bar */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { v: '10,000+', l: 'Phones Sold' },
            { v: '4.8 ★', l: 'Customer Rating' },
            { v: '50+', l: 'Cities Covered' },
            { v: '100%', l: 'Secure Payments' },
          ].map(s => (
            <div key={s.l}>
              <p className="text-2xl font-extrabold text-primary">{s.v}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-500 text-sm mt-2">Sell your phone in 4 simple steps</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(s => (
            <div key={s.step} className="how-it-works-step bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1">
              <div className="how-it-works-icon bg-primary/10">
                {s.icon}
              </div>
              <span className="text-xs font-bold text-primary tracking-widest">STEP {s.step}</span>
              <h3 className="font-bold text-gray-900">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Sell with Dream Gadgets?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(b => (
              <div key={b.title} className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow">
                <span className="text-3xl shrink-0">{b.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: 'How is the price calculated?', a: 'We analyze current market data, device condition, and recent sales to give you the best possible price.' },
            { q: 'How long does the process take?', a: 'From quote to payment, the entire process takes less than 24 hours. Same-day pickup available in select cities.' },
            { q: 'What documents are required?', a: 'A valid government ID (Aadhaar, PAN, or Driving License) and the original invoice (if available).' },
            { q: 'What if I change my mind?', a: 'You can cancel anytime before inspection. No questions asked.' },
          ].map(faq => (
            <details key={faq.q} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                {faq.q}
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-500">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="bg-gray-50 px-4 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-gray-400 mb-4">WE ACCEPT ALL MAJOR BRANDS</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Apple', 'Samsung', 'OnePlus', 'Oppo', 'Vivo', 'Xiaomi', 'Realme', 'Motorola', 'Google', 'Nokia', 'Nothing', 'Asus', 'LG', 'Sony'].map(b => (
              <span key={b} className="text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-full font-medium">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
