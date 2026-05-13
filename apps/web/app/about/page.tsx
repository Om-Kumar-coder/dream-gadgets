import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us — Dream Gadgets',
  description: "India's most transparent mobile selling platform.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-violet-700 to-indigo-700 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About Dream Gadgets</h1>
          <p className="text-white/80 text-lg">India's most transparent mobile selling platform</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Dream Gadgets is one of the most trusted online platforms in India for selling old mobile phones, buying refurbished mobiles, and mobile phone repairs — all in one place.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We offer a process that is 100% transparent, secure, and fast, enabling you to upgrade your device or earn instant cash without leaving your home.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: '10,000+', l: 'Devices Sold' },
              { v: '4.8 ★', l: 'Customer Rating' },
              { v: '5+', l: 'City Branches' },
              { v: '2019', l: 'Founded' },
            ].map(s => (
              <div key={s.l} className="bg-violet-50 rounded-2xl p-5 text-center border border-violet-100">
                <p className="text-2xl font-extrabold text-violet-600">{s.v}</p>
                <p className="text-xs text-gray-500 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: '🌍', title: 'Sustainability', desc: 'Reduce e-waste by extending the life of devices through refurbishment and resale.' },
              { icon: '🤝', title: 'Transparency', desc: 'No hidden charges, no surprises. What we quote is what you get.' },
              { icon: '⚡', title: 'Speed', desc: 'From quote to payment in under 24 hours. Your time matters.' },
            ].map(m => (
              <div key={m.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <span className="text-3xl mb-3 block">{m.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{m.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/80 mb-6 text-sm">Sell your old phone or buy a certified refurbished one today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sell" className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-full font-bold text-sm hover:bg-yellow-300 transition-colors">
              Sell Your Phone
            </Link>
            <Link href="/products" className="px-6 py-3 bg-white/20 border border-white/30 text-white rounded-full font-semibold text-sm hover:bg-white/30 transition-colors">
              Buy a Phone
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
