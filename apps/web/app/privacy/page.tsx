import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Dream Gadgets',
  description: 'Our privacy policy explains how Dream Gadgets collects, uses, stores, and protects your personal information. Learn about your data rights.',
  openGraph: {
    title: 'Privacy Policy — Dream Gadgets',
    description: 'Learn how Dream Gadgets handles your personal data, your rights, and our security measures to protect your information.',
  },
};

const SECTIONS = [
  {
    id: 'information-collected',
    title: '1. Information We Collect',
    content: `We collect information that you provide directly to us, as well as information that is automatically collected when you use our website and services.`,
    list: [
      {
        title: 'Information You Provide',
        desc: 'Name, phone number, email address, shipping address, billing information, device IMEI numbers, device condition details, and payment details (processed securely through Razorpay).',
      },
      {
        title: 'Account Information',
        desc: 'When you create an account, we collect your name, email address, phone number, and encrypted password. You may also add profile details such as address book and order preferences.',
      },
      {
        title: 'Device Information',
        desc: 'When selling a device, we collect information about the device including brand, model, IMEI number, condition assessment, and photographs you upload for inspection.',
      },
      {
        title: 'Automatically Collected',
        desc: 'IP address, browser type, operating system, referring URLs, device type, pages visited, time spent on pages, and other usage data through cookies and analytics tools.',
      },
    ],
  },
  {
    id: 'how-we-use-data',
    title: '2. How We Use Your Information',
    content: `We use the collected information for the following purposes:`,
    list: [
      { title: 'Order Processing', desc: 'To process and fulfill your orders, send order confirmations, arrange shipping, and process returns and refunds.' },
      { title: 'Account Management', desc: 'To create and maintain your account, authenticate your identity, and provide customer support.' },
      { title: 'Communication', desc: 'To send order updates, shipping notifications, payment confirmations, and respond to your inquiries.' },
      { title: 'Service Improvement', desc: 'To analyze usage patterns, improve our website, optimize product listings, and enhance user experience.' },
      { title: 'Marketing (with consent)', desc: 'With your explicit consent, we may send promotional offers, product recommendations, and company news via email or SMS.' },
      { title: 'Fraud Prevention', desc: 'To verify transactions, prevent fraudulent activities, and ensure the security of our platform.' },
    ],
  },
  {
    id: 'data-sharing',
    title: '3. Data Sharing & Disclosure',
    content: `We do not sell your personal information to third parties. We may share your data only in the following circumstances:`,
    list: [
      { title: 'Service Providers', desc: 'We share information with trusted partners who help us operate our business — courier partners (for shipping), Razorpay (for payment processing), and cloud infrastructure providers (for data hosting).' },
      { title: 'Legal Compliance', desc: 'We may disclose information if required by law, court order, or governmental regulation, or to protect our legal rights.' },
      { title: 'Business Transfers', desc: 'In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of the business transaction. You will be notified of any such change.' },
    ],
  },
  {
    id: 'data-security',
    title: '4. Data Security',
    content: `We implement comprehensive security measures to protect your personal information:

• All payment data is processed through Razorpay's PCI-DSS compliant infrastructure
• Data transmission is encrypted using TLS/SSL protocols
• Access to personal data is restricted to authorized personnel only
• We conduct regular security audits and vulnerability assessments
• Passwords are hashed and salted using industry-standard algorithms
• We maintain strict access controls and monitoring systems

While we take every precaution to protect your data, no method of electronic storage or transmission is 100% secure. We continuously update our security practices to stay ahead of emerging threats.`,
  },
  {
    id: 'data-retention',
    title: '5. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide you with our services. We may retain certain data longer for legal, accounting, or fraud prevention purposes:

• Order information: 7 years (as required by tax regulations)
• Account information: Until account deletion
• Communication records: 2 years
• Device inspection photos: 1 year

After the retention period, your data is securely deleted or anonymized for analytical purposes.`,
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    content: `Under applicable data protection laws, you have the following rights regarding your personal information:`,
    list: [
      { title: 'Right to Access', desc: 'Request a copy of the personal data we hold about you.' },
      { title: 'Right to Rectification', desc: 'Correct any inaccurate or incomplete personal data.' },
      { title: 'Right to Erasure', desc: 'Request deletion of your personal data, subject to legal retention requirements.' },
      { title: 'Right to Restrict Processing', desc: 'Limit how we use your personal data in certain circumstances.' },
      { title: 'Right to Data Portability', desc: 'Receive your personal data in a structured, commonly used format.' },
      { title: 'Right to Withdraw Consent', desc: 'Withdraw your consent for marketing communications at any time.' },
    ],
    note: 'To exercise any of these rights, please contact us at support@dreamgadgets.in or visit your account settings page. We will respond to your request within 30 days.',
  },
  {
    id: 'contact',
    title: '7. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices:

• Email: support@dreamgadgets.in
• Phone: +91 98765 43210
• Address: Mumbai, Maharashtra, India

We are committed to resolving any privacy concerns promptly and transparently.`,
  },
];

export default function PrivacyPage() {
  return (
    <main>
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)',
      }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-white/60 text-sm">Last updated: January 2025</p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-gray-50 rounded-2xl p-5 mb-10">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Table of Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SECTIONS.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="text-sm text-gray-600 hover:text-primary hover:underline">
                {section.title}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>

              <div className="text-gray-600 leading-relaxed text-sm space-y-3 whitespace-pre-line">
                {section.content.split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {section.list && (
                <div className="mt-4 space-y-3">
                  {section.list.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {'note' in section && section.note && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 leading-relaxed">{section.note}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/cookies" className="text-sm text-primary hover:underline font-medium">
              Cookies Policy →
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
