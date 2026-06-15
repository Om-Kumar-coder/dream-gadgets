import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us — Dream Gadgets',
  description: "India's most transparent mobile selling platform.",
};

export default function AboutPage() {
  return (
    <main className="animate-fade-in">
      {/* Hero */}
      <section className="text-white py-20 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto relative">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About Dream Gadgets</h1>
          <p className="text-white/70 text-lg">India&apos;s most transparent mobile selling platform</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        {/* Who We Are */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="heading-md text-surface-900 mb-4">Who We Are</h2>
            <p className="text-surface-600 leading-relaxed mb-4">
              Dream Gadgets is one of the most trusted online platforms in India for selling old mobile phones, buying refurbished mobiles, and mobile phone repairs — all in one place.
            </p>
            <p className="text-surface-600 leading-relaxed">
              We offer a process that is 100% transparent, secure, and fast, enabling you to upgrade your device or earn instant cash without leaving your home.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[["10,000+", "Devices Sold"], ["4.8 ★", "Customer Rating"], ["5+", "City Branches"], ["2019", "Founded"]].map(([value, label]) => (
              <div key={label} className="card p-5 text-center hover:shadow-card-hover transition-all duration-200">
                <p className="text-2xl font-extrabold text-primary">{value}</p>
                <p className="text-xs text-surface-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Mission */}
        <div>
          <h2 className="heading-md text-surface-900 mb-6">Our Mission</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: '🌍', title: 'Sustainability', desc: 'Reduce e-waste by extending the life of devices through refurbishment and resale.' },
              { icon: '🤝', title: 'Transparency', desc: 'No hidden charges, no surprises. What we quote is what you get.' },
              { icon: '⚡', title: 'Speed', desc: 'From quote to payment in under 24 hours. Your time matters.' },
            ].map(m => (
              <div key={m.title} className="card p-6 hover:shadow-card-hover transition-all duration-200">
                <span className="text-3xl mb-3 block">{m.icon}</span>
                <h3 className="font-bold text-surface-900 mb-2">{m.title}</h3>
                <p className="text-sm text-surface-600 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-10 text-white text-center relative overflow-hidden bg-gradient-sell shadow-[0_0_24px_rgba(229,9,20,0.3)]">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="heading-md mb-3">Ready to get started?</h2>
            <p className="text-white/70 mb-6 text-sm">Sell your old phone or buy a certified refurbished one today.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/sell" className="btn-primary btn-lg">
                Sell Your Phone
              </Link>
              <Link href="/products" className="btn-outline text-white border-white/30 hover:bg-white/10 hover:border-white/50 btn-lg">
                Buy a Phone
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
