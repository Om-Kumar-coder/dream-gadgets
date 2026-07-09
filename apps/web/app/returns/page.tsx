import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Return & Refund Policy — Dream Gadgets',
  description: 'Our 7-day return policy for certified refurbished phones. Learn about eligibility, return process, refund timeline, and conditions.',
  openGraph: {
    title: 'Return & Refund Policy — Dream Gadgets',
    description: 'Hassle-free 7-day return policy on all certified refurbished phones from Dream Gadgets.',
  },
};

const SECTIONS = [
  {
    id: 'overview',
    title: 'Return & Refund Overview',
    content: `At Dream Gadgets, customer satisfaction is our priority. We offer a 7-day return policy on all certified refurbished phones purchased through our platform. If you're not completely satisfied with your purchase, we're here to help.`,
    highlight: true,
  },
  {
    id: 'eligibility',
    title: '1. Return Eligibility',
    content: `To be eligible for a return, the following conditions must be met:`,
    list: [
      { icon: '✅', title: 'Return Window', desc: 'Return request must be initiated within 7 calendar days from the date of delivery.' },
      { icon: '✅', title: 'Same Condition', desc: 'The device must be in the same condition as received — no physical damage, scratches, or signs of misuse.' },
      { icon: '✅', title: 'Complete Package', desc: 'All original accessories must be included: charger, cable, SIM ejector tool, and packaging box (if provided).' },
      { icon: '✅', title: 'No Tampering', desc: 'The device must not show signs of tampering, unauthorized repairs, or attempted disassembly.' },
      { icon: '✅', title: 'Accounts Removed', desc: 'All accounts (iCloud, Google, etc.) and personal data must be removed from the device.' },
      { icon: '✅', title: 'Find My iPhone Off', desc: 'Apple devices must have "Find My iPhone" disabled. Android devices must have FRP disabled.' },
    ],
  },
  {
    id: 'process',
    title: '2. Return Process',
    content: `Returning a product is simple and hassle-free:`,
    steps: [
      { step: '1', title: 'Initiate Return', desc: 'Contact our support team via phone, email, or WhatsApp within 7 days of delivery.' },
      { step: '2', title: 'Get Approval', desc: 'Our team will verify your order details and confirm return eligibility within 24 hours.' },
      { step: '3', title: 'Free Pickup', desc: 'We will arrange a free pickup from your address. Our courier partner will collect the device.' },
      { step: '4', title: 'Inspection', desc: 'The returned device undergoes a quality inspection at our facility (1-2 business days).' },
      { step: '5', title: 'Refund Initiated', desc: 'Once the device passes inspection, your refund is processed within 24 hours.' },
    ],
  },
  {
    id: 'refund-timeline',
    title: '3. Refund Timeline & Method',
    content: `Refunds are processed after the returned device passes our quality inspection.`,
    list: [
      { icon: '⏱️', title: 'Processing Time', desc: '5-7 business days from the date the returned device passes inspection.' },
      { icon: '💳', title: 'Refund Method', desc: 'Amount is credited back to the original payment method (credit card, debit card, UPI, net banking).' },
      { icon: '📱', title: 'UPI Refunds', desc: 'UPI payments are refunded to the same UPI ID within 24-48 hours of processing.' },
      { icon: '🏦', title: 'Bank Transfer', desc: 'For net banking, refunds reflect in 3-5 business days after processing.' },
    ],
    note: 'Refund timelines depend on your bank/payment provider. Dream Gadgets initiates the refund within 24 hours of inspection clearance.',
  },
  {
    id: 'non-returnable',
    title: '4. Non-Returnable Items',
    content: `The following items and situations are NOT eligible for return:`,
    list: [
      { icon: '❌', title: 'Non-returnable Items', desc: 'Accessories purchased separately (chargers, cables, cases, screen protectors), devices marked as "final sale" or "as-is".' },
      { icon: '❌', title: 'Physical Damage', desc: 'Devices with cracks, dents, scratches, liquid damage, or other physical damage caused after delivery.' },
      { icon: '❌', title: 'Accounts Not Removed', desc: 'Devices with active iCloud, Google, or other account locks (FRP locked).' },
      { icon: '❌', title: 'Unauthorized Repairs', desc: 'Devices that have been opened, repaired, or modified by anyone other than Dream Gadgets.' },
      { icon: '❌', title: 'Missing Accessories', desc: 'Returns without all original accessories may be rejected or subject to a deduction.' },
    ],
  },
  {
    id: 'warranty',
    title: '5. Warranty Coverage',
    content: `All certified refurbished phones come with a warranty that covers manufacturing defects.`,
    list: [
      { icon: '🛡️', title: 'Covered', desc: 'Hardware malfunctions, charging port issues, camera defects, speaker/mic failures, battery draining abnormally, motherboard failures.' },
      { icon: '⚠️', title: 'Not Covered', desc: 'Accidental damage, liquid damage, screen breakage, normal battery degradation, software issues caused by user modifications, and cosmetic wear.' },
    ],
    note: 'Warranty duration varies by device. Check the warranty period mentioned on the product page. Warranty is non-transferable.',
  },
  {
    id: 'support',
    title: '6. Need Help?',
    content: `Our support team is available to assist you with returns, refunds, and warranty claims.`,
    contact: true,
  },
];

export default function ReturnsPage() {
  return (
    <main className="animate-fade-in">
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Return & Refund Policy</h1>
          <p className="text-white/60 text-sm">Last updated: January 2025</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-10">
          {SECTIONS.map((section) => {
            if (section.highlight) {
              return (
                <div key={section.id} className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                  <p className="text-surface-800 leading-relaxed text-sm">{section.content}</p>
                </div>
              );
            }

            if (section.contact) {
              return (
                <div key={section.id} id={section.id} className="card p-6 text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <h2 className="heading-sm text-surface-900 mb-2">{section.title}</h2>
                  <p className="text-sm text-surface-600 mb-4">{section.content}</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="tel:+919876543210" className="btn-secondary btn-md">Call +91 98765 43210</a>
                    <a href="mailto:support@dreamgadgets.in" className="btn-outline btn-md">Email Support</a>
                    <a href="/contact" className="btn-outline btn-md">Contact Form</a>
                  </div>
                </div>
              );
            }

            return (
              <div key={section.id} id={section.id}>
                <h2 className="heading-sm text-surface-900 mb-4">{section.title}</h2>
                {section.content && (
                  <p className="text-surface-600 leading-relaxed text-sm mb-4">{section.content}</p>
                )}

                {section.list && (
                  <div className="space-y-3">
                    {section.list.map((item, i) => (
                      <div key={i} className="card p-4 hover:shadow-card-hover transition-all">
                        <div className="flex items-start gap-3">
                          <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                          <div>
                            <h3 className="font-semibold text-surface-900 text-sm">{item.title}</h3>
                            <p className="text-sm text-surface-600 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.steps && (
                  <div className="space-y-3">
                    {section.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-4 card p-4 hover:shadow-card-hover transition-all">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {step.step}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h3 className="font-semibold text-surface-900 text-sm">{step.title}</h3>
                          <p className="text-sm text-surface-600">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {'note' in section && section.note && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-700 leading-relaxed">{section.note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="divider mt-12 pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/terms" className="text-sm text-primary hover:underline font-medium">Terms & Conditions →</Link>
            <Link href="/cancellation" className="text-sm text-primary hover:underline font-medium">Cancellation Policy →</Link>
            <Link href="/privacy" className="text-sm text-primary hover:underline font-medium">Privacy Policy →</Link>
            <Link href="/contact" className="text-sm text-primary hover:underline font-medium">Contact Us →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
