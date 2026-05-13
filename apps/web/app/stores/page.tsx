import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Stores — Dream Gadgets',
  description: 'Find a Dream Gadgets store near you.',
};

const STORES = [
  {
    name: 'Dream Gadgets — Main Branch',
    address: '123 Tech Street, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    phone: '+91 98000 00000',
    hours: 'Mon–Sat: 10am – 8pm',
    emoji: '🏪',
  },
  {
    name: 'Dream Gadgets — Pune',
    address: '45 MG Road, Camp Area',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    phone: '+91 98000 00001',
    hours: 'Mon–Sat: 10am – 8pm',
    emoji: '🏬',
  },
  {
    name: 'Dream Gadgets — Bengaluru',
    address: '78 Brigade Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    phone: '+91 98000 00002',
    hours: 'Mon–Sat: 10am – 8pm',
    emoji: '🏢',
  },
];

export default function StoresPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-violet-700 to-indigo-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3">Our Stores</h1>
        <p className="text-white/80">Visit us at a branch near you</p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORES.map(s => (
            <div key={s.name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <span className="text-4xl mb-4 block">{s.emoji}</span>
              <h2 className="font-bold text-gray-900 mb-1">{s.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{s.address}, {s.city} — {s.pincode}</p>
              <div className="space-y-1.5 text-sm">
                <p className="flex items-center gap-2 text-gray-600">
                  <span>📞</span> {s.phone}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <span>🕐</span> {s.hours}
                </p>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(s.address + ' ' + s.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-xs text-violet-600 font-semibold hover:underline"
              >
                Get Directions →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-violet-50 rounded-2xl p-8 text-center border border-violet-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Can't visit a store?</h2>
          <p className="text-gray-500 text-sm mb-5">No problem! We offer free doorstep pickup across India.</p>
          <a href="/sell" className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors">
            Schedule Pickup →
          </a>
        </div>
      </section>
    </main>
  );
}
