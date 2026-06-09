import type { Metadata } from 'next';
import Link from 'next/link';

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
    <main>
      <section className="text-white py-16 px-4 text-center" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
      }}>
        <h1 className="text-4xl font-extrabold mb-3">Our Stores</h1>
        <p className="text-white/80">Visit us at a branch near you in Kolkata & South 24 Parganas</p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORES.map(s => (
            <div key={s.name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow flex flex-col">
              <span className="text-4xl mb-4 block">{s.emoji}</span>
              <h2 className="font-bold text-gray-900 mb-1">{s.name}</h2>
              <p className="text-sm text-gray-500 mb-1">{s.address}</p>
              <p className="text-xs text-gray-400 mb-3">{s.area}</p>
              <p className="text-xs text-gray-400 mb-3">{s.city}, {s.state} — {s.pincode}</p>
              
              <div className="space-y-1.5 text-sm mb-4 flex-1">
                <p className="flex items-center gap-2 text-gray-600">
                  <span>📞</span> {s.phone}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
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
                className="inline-block mt-auto text-xs text-red-600 font-semibold hover:underline"
              >
                Get Directions →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl p-8 text-center border" style={{ backgroundColor: 'rgba(229, 9, 20, 0.06)', borderColor: 'rgba(229, 9, 20, 0.2)' }}>
          <h2 className="text-xl font-bold text-white mb-2">Can&apos;t visit a store?</h2>
          <p className="text-gray-400 text-sm mb-5">No problem! We offer free doorstep pickup across Kolkata and nearby areas.</p>
          <a href="/sell" className="inline-block px-6 py-3 rounded-xl font-semibold text-sm btn-red transition-all">
            Schedule Pickup →
          </a>
        </div>
      </section>

      {/* Common Info */}
      <section className="bg-gray-50 border-t border-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Common Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-gray-900">📧 Email</p>
              <a href="mailto:dreamgadgetskolkata@gmail.com" className="text-primary hover:underline">
                dreamgadgetskolkata@gmail.com
              </a>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-gray-900">🌐 Website</p>
              <a href="https://dreamgadgets.co" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                dreamgadgets.co
              </a>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-gray-900">📺 YouTube</p>
              <a href="https://youtube.com/@dream_gadgets" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                @dream_gadgets
              </a>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-gray-900">👍 Facebook</p>
              <a href="https://facebook.com/DreamGadgets.Kolkata" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Dream Gadgets Kolkata
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
