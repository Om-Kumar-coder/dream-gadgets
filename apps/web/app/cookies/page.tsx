import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookies Policy — Dream Gadgets',
  description: 'How Dream Gadgets uses cookies and how you can control them. Learn about essential, preference, analytics and authentication cookies used on our website.',
  openGraph: {
    title: 'Cookies Policy — Dream Gadgets',
    description: 'Learn how Dream Gadgets uses cookies and how to manage your cookie preferences.',
  },
};

const SECTIONS = [
  {
    id: 'what-are-cookies',
    title: 'What Are Cookies',
    content: `Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, enhance user experience, and provide information to the website owners.

Cookies typically contain a unique identifier — a string of letters and numbers — that allows websites to recognize your browser when you return. This helps websites remember your preferences, login status, and other settings.`,
  },
  {
    id: 'how-we-use-cookies',
    title: 'How We Use Cookies',
    content: `At Dream Gadgets, we use cookies for the following purposes:`,
    list: [
      {
        title: 'Essential / Strictly Necessary Cookies',
        desc: 'These cookies are required for the website to function properly. They enable core features such as security, network management, and account authentication. Without these cookies, services like checkout and account login cannot function.',
        alwaysOn: true,
      },
      {
        title: 'Preference / Functionality Cookies',
        desc: 'These cookies remember your settings and preferences, such as language, currency, and product wishlist items. They enhance your experience by personalizing content and remembering your choices.',
      },
      {
        title: 'Analytics / Performance Cookies',
        desc: 'These cookies help us understand how visitors interact with our website by collecting anonymous information about page visits, time spent, and error messages. We use this data to improve our website performance and user experience.',
      },
      {
        title: 'Authentication Cookies',
        desc: 'These cookies keep you logged in to your account across pages and sessions. They ensure secure access to your order history, account settings, and personal information.',
      },
    ],
  },
  {
    id: 'managing-cookies',
    title: 'Managing Cookies',
    content: `You have full control over cookies. Most web browsers allow you to manage cookie preferences, including blocking or deleting cookies entirely. Here's how you can manage cookies in popular browsers:`,
    list: [
      { title: 'Google Chrome', desc: 'Settings → Privacy and Security → Cookies and other site data' },
      { title: 'Mozilla Firefox', desc: 'Options → Privacy & Security → Cookies and Site Data' },
      { title: 'Safari', desc: 'Preferences → Privacy → Cookies and website data' },
      { title: 'Microsoft Edge', desc: 'Settings → Cookies and site permissions → Cookies and site data' },
    ],
    note: 'Please note that disabling essential cookies may affect the functionality of our website, including the ability to complete purchases or access your account.',
  },
  {
    id: 'third-party-cookies',
    title: 'Third-Party Cookies',
    content: `We work with trusted third-party services that may set their own cookies on your device:`,
    list: [
      { title: 'Razorpay', desc: 'Payment processing — cookies for transaction security and fraud prevention.' },
      { title: 'Google Analytics', desc: 'Website analytics — cookies to track page visits and user behavior.' },
      { title: 'Cloudflare', desc: 'Content delivery and security — cookies for network performance and DDoS protection.' },
    ],
  },
  {
    id: 'updates',
    title: 'Updates to This Policy',
    content: `We may update this Cookies Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.

If we make material changes, we will notify you through our website or via email.`,
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: `If you have any questions about our use of cookies, please contact us:
• Email: support@dreamgadgets.in
• Phone: +91 98765 43210
• Address: Mumbai, Maharashtra, India`,
  },
];

export default function CookiesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)',
      }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Cookies Policy</h1>
          <p className="text-white/60 text-sm">Last updated: January 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>

              {typeof section.content === 'string' && (
                <div className="text-gray-600 leading-relaxed text-sm space-y-3 whitespace-pre-line">
                  {section.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              {section.list && (
                <div className="mt-4 space-y-4">
                  {section.list.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                            {item.title}
                            {'alwaysOn' in item && item.alwaysOn && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Always Active</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {'note' in section && section.note && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 flex items-start gap-2">
                    <span className="text-amber-500 shrink-0">⚠</span>
                    {section.note}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation links */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/privacy" className="text-sm text-primary hover:underline font-medium">
              Privacy Policy →
            </Link>
            <Link href="/terms" className="text-sm text-primary hover:underline font-medium">
              Terms & Conditions →
            </Link>
            <Link href="/contact" className="text-sm text-primary hover:underline font-medium">
              Contact Us →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
