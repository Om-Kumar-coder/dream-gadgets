import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Dream Gadgets',
  description: 'Get in touch with Dream Gadgets.',
};

export default function ContactPage() {
  return (
    <main>
      <section className="text-white py-16 px-4 text-center" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
      }}>
        <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
        <p className="text-white/80">We're here to help. Reach out anytime.</p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Form */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                  <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                  <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                <input type="tel" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': '#E50914' } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': '#E50914' } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
                <textarea rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none" style={{ '--tw-ring-color': '#E50914' } as React.CSSProperties} />
              </div>
              <button type="submit" className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all" style={{
                backgroundColor: '#E50914',
                boxShadow: '0 0 12px rgba(229, 9, 20, 0.4)'
              }} onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#C40812';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 18px rgba(255, 45, 45, 0.6)';
              }} onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#E50914';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(229, 9, 20, 0.4)';
              }}>
                Send Message →
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Get in touch</h2>
            {[
              { icon: '📍', title: 'Address', detail: '123 Tech Street, Andheri West, Mumbai — 400053' },
              { icon: '📞', title: 'Phone', detail: '+91 98000 00000' },
              { icon: '✉️', title: 'Email', detail: 'support@dreamgadgets.in' },
              { icon: '🕐', title: 'Working Hours', detail: 'Monday – Saturday: 10am to 8pm' },
            ].map(i => (
              <div key={i.title} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-2xl shrink-0">{i.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{i.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{i.detail}</p>
                </div>
              </div>
            ))}

            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <p className="font-semibold text-gray-900 text-sm mb-1">💬 WhatsApp Support</p>
              <p className="text-xs text-gray-500 mb-3">Chat with us directly on WhatsApp for quick help.</p>
              <a
                href="https://wa.me/919800000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
