import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us — Dream Gadgets',
  description: "India's most transparent mobile selling platform.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="text-white py-20 px-4 text-center" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
      }}>
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
            {["10,000+", "4.8 ★", "5+", "2019"].map((v, i) => {
              const labels = ['Devices Sold', 'Customer Rating', 'City Branches', 'Founded'];
              return (
                <div key={labels[i]} className="rounded-2xl p-5 text-center border" style={{
                  backgroundColor: 'rgba(229, 9, 20, 0.05)',
                  borderColor: 'rgba(229, 9, 20, 0.2)'
                }}>
                  <p className="text-2xl font-extrabold" style={{ color: '#E50914' }}>{v}</p>
                  <p className="text-xs text-gray-500 mt-1">{labels[i]}</p>
                </div>
              );
            })}
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

        <div className="rounded-3xl p-10 text-white text-center" style={{
          background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)',
          boxShadow: '0 0 24px rgba(229, 9, 20, 0.3)'
        }}>
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/80 mb-6 text-sm">Sell your old phone or buy a certified refurbished one today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sell" className="px-6 py-3 rounded-full font-bold text-sm btn-red">
              Sell Your Phone
            </Link>
            <Link href="/products" className="px-6 py-3 border border-white/30 text-white rounded-full font-semibold text-sm hover:bg-white/30 transition-colors" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}>
              Buy a Phone
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
