import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sell Your Phone — Dream Gadgets',
  description: 'Get the best price for your old phone. Doorstep pickup, instant payment.',
};

const DEVICE_TYPES = [
  { icon: '📱', label: 'Mobile Phone', value: 'mobile', desc: 'All brands accepted' },
  { icon: '💻', label: 'Laptop', value: 'laptop', desc: 'Windows & Mac' },
  { icon: '📟', label: 'Tablet', value: 'tablet', desc: 'iPad, Android tablets' },
  { icon: '⌚', label: 'Smartwatch', value: 'smartwatch', desc: 'Apple Watch, Galaxy Watch' },
  { icon: '🎮', label: 'Gaming Console', value: 'gaming', desc: 'PS, Xbox, Nintendo' },
  { icon: '🎧', label: 'Earbuds', value: 'earbuds', desc: 'AirPods, TWS earbuds' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '📋', title: 'Get Instant Quote', desc: 'Enter your device details and get the best price in seconds.' },
  { step: '02', icon: '📅', title: 'Schedule Pickup', desc: 'Choose a convenient time. Our agent comes to your doorstep.' },
  { step: '03', icon: '🔍', title: 'Device Inspection', desc: 'Quick on-spot inspection to verify the condition.' },
  { step: '04', icon: '💸', title: 'Instant Payment', desc: 'Get paid instantly via bank transfer or UPI.' },
];

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo', 'Motorola', 'Google', 'Nokia'];

export default function SellPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-700 to-indigo-700 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Sell Your Old Phone<br /><span className="text-yellow-300">Get Best Price!</span>
          </h1>
          <p className="text-white/80 text-lg mb-8">Highest price guaranteed · Doorstep pickup · Instant payment</p>
          <div className="bg-white rounded-2xl p-6 text-left max-w-lg mx-auto shadow-xl">
            <h2 className="font-bold text-gray-900 mb-4">Get Instant Quote</h2>
            <div className="space-y-3">
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">Select Brand</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input type="text" placeholder="Enter Model Name (e.g. iPhone 13)" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <input type="tel" placeholder="Your Phone Number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl text-sm transition-colors">
                Get My Price →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Device types */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What Do You Want to Sell?</h2>
        <p className="text-gray-500 text-sm mb-8">We buy all kinds of gadgets</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DEVICE_TYPES.map(d => (
            <Link key={d.value} href={`/sell?type=${d.value}`}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white border border-gray-100 hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-center">
              <span className="text-4xl">{d.icon}</span>
              <span className="font-semibold text-gray-900 text-sm">{d.label}</span>
              <span className="text-xs text-gray-400">{d.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 text-sm mt-2">Sell your phone in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {s.icon}
                </div>
                <span className="text-xs font-bold text-violet-400 tracking-widest">STEP {s.step}</span>
                <h3 className="font-bold text-gray-900 mt-1 mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Sell with Dream Gadgets?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: '💰', title: 'Best Price Assured', desc: 'We offer the highest market price for your device, guaranteed.' },
            { icon: '🚗', title: 'Doorstep Pickup', desc: 'Free pickup from your home or office anywhere in India.' },
            { icon: '⚡', title: 'Instant Payment', desc: 'Get paid via bank transfer or UPI within minutes of inspection.' },
            { icon: '🔒', title: 'Secure Data Wipe', desc: 'Complete data erasure before your device is processed.' },
          ].map(b => (
            <div key={b.title} className="flex gap-4 p-5 bg-violet-50 rounded-2xl border border-violet-100">
              <span className="text-3xl shrink-0">{b.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
