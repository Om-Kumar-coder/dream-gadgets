import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Stores — Dream Gadgets Kolkata',
  description: 'Visit Dream Gadgets stores in Chetla, Jadavpur, and Champahati. Buy/sell/exchange certified used phones, laptops, and gadgets.',
};

const STORES = [
  {
    name: 'Dream Gadgets — Chetla (Main Branch)',
    address: '29A, Pitambar Ghatak Lane, Chetla',
    area: 'Near Chetla Police Station, Opp. CIT Market, Alipore',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700027',
    phone: '+91 82820 11193',
    whatsapp: '8282011193',
    hours: '12:30 PM – 9:30 PM',
    instagram: '@dream_gadgets_kolkata',
    emoji: '🏪',
    mapQuery: '29A Pitambar Ghatak Lane Chetla Kolkata',
  },
  {
    name: 'Dream Gadgets 2.0 — Jadavpur',
    address: '17, Sukanta Setu, Sulekha More, Jadavpur',
    area: 'Jadavpur',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700032',
    phone: '+91 90383 12344',
    whatsapp: '9038312344',
    hours: '2:00 PM – 10:00 PM',
    instagram: '@dreamgadgets_kolkata_2.0',
    emoji: '🏬',
    mapQuery: '17 Sukanta Setu Sulekha More Jadavpur Kolkata',
  },
  {
    name: 'Dream Gadgets 3.0 — Champahati',
    address: 'Champahati Station Road',
    area: 'Near Nilmanikar Vidyalaya, South 24 Parganas',
    city: 'Champahati',
    state: 'West Bengal',
    pincode: '743330',
    phone: '+91 82820 11194',
    whatsapp: '8282011194',
    hours: '12:30 PM – 9:30 PM',
    instagram: '@dreamgadgets_kolkata_3.0',
    emoji: '🏢',
    mapQuery: 'Champahati Station Road Nilmanikar Vidyalaya West Bengal',
  },
];

export default function StoresPage() {
  return (
    <main className="animate-fade-in">
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Our Stores</h1>
          <p className="text-white/70">Visit us at a branch near you in Kolkata & South 24 Parganas</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORES.map(s => (
            <div key={s.name} className="card p-6 hover:shadow-card-hover transition-all flex flex-col group">
              <span className="text-4xl mb-4 block">{s.emoji}</span>
              <h2 className="font-bold text-surface-900 mb-1 group-hover:text-primary transition-colors">{s.name}</h2>
              <p className="text-sm text-surface-500 mb-1">{s.address}</p>
              <p className="text-xs text-surface-400 mb-3">{s.area}</p>
              <p className="text-xs text-surface-400 mb-3">{s.city}, {s.state} — {s.pincode}</p>
              
              <div className="space-y-1.5 text-sm mb-4 flex-1">
                <p className="flex items-center gap-2 text-surface-600">
                  <span>📞</span> {s.phone}
                </p>
                <p className="flex items-center gap-2 text-surface-600">
                  <span>🕐</span> {s.hours}
                </p>
                <a
                  href={`https://instagram.com/${s.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-pink-600 hover:underline"
                >
                  <span>📸</span> {s.instagram}
                </a>
                <a
                  href={`https://wa.me/91${s.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-600 hover:underline"
                >
                  <span>💬</span> WhatsApp
                </a>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(s.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-auto text-xs text-primary font-semibold hover:underline"
              >
                Get Directions →
              </a>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 card p-8 text-center bg-gradient-brand-subtle border-primary/20">
          <h2 className="heading-sm text-surface-900 mb-2">Can&apos;t visit a store?</h2>
          <p className="text-surface-500 text-sm mb-5">No problem! We offer free doorstep pickup across Kolkata and nearby areas.</p>
          <a href="/sell" className="btn-primary btn-lg">
            Schedule Pickup →
          </a>
        </div>
      </section>

      {/* Common Info */}
      <section className="bg-surface-50 border-t border-surface-100 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-sm text-surface-900 mb-4">Common Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {[
              { label: '📧 Email', value: 'dreamgadgetskolkata@gmail.com', href: 'mailto:dreamgadgetskolkata@gmail.com' },
              { label: '🌐 Website', value: 'dreamgadgets.co', href: 'https://dreamgadgets.co' },
              { label: '📺 YouTube', value: '@dream_gadgets', href: 'https://youtube.com/@dream_gadgets' },
              { label: '👍 Facebook', value: 'Dream Gadgets Kolkata', href: 'https://facebook.com/DreamGadgets.Kolkata' },
            ].map((item) => (
              <div key={item.label} className="card p-4 hover:shadow-card-hover transition-all">
                <p className="font-semibold text-surface-900">{item.label}</p>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                  {item.value}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
