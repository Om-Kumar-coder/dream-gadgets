import type { Metadata } from 'next';
import { StaticOfferBanner } from '../../components/banner/StaticPageBanners';

export const metadata: Metadata = {
  title: 'FAQ — Dream Gadgets',
  description: 'Frequently asked questions about buying and selling phones at Dream Gadgets.',
};

const FAQS = [
  {
    q: 'How do I sell my phone on Dream Gadgets?',
    a: 'Simply go to the Sell page, enter your device details, get an instant quote, schedule a free doorstep pickup, and receive payment instantly after inspection.',
  },
  {
    q: 'How long does the pickup take?',
    a: 'We typically schedule pickups within 24 hours of your request. You can choose a time slot that is convenient for you.',
  },
  {
    q: 'How will I receive payment?',
    a: 'Payment is made instantly via bank transfer or UPI right after the device inspection at your doorstep.',
  },
  {
    q: 'What if the price changes after inspection?',
    a: 'If the device condition matches what you described, the price will not change. If there are undisclosed issues, our agent will explain and offer a revised price. You are free to decline.',
  },
  {
    q: 'Is my data safe when I sell my phone?',
    a: 'Yes. We perform a complete certified data wipe on every device before it is processed or resold. Your personal data is completely erased.',
  },
  {
    q: 'What is a Verified Refurbished phone?',
    a: 'A Verified Refurbished phone has passed our 20-point quality inspection, has a clean IMEI, and comes with a warranty. It is tested for battery, screen, camera, speakers, and all hardware.',
  },
  {
    q: 'What is the return policy for purchased phones?',
    a: 'We offer a 7-day return policy on all purchases. If you are not satisfied, return the device within 7 days for a full refund.',
  },
  {
    q: 'Do you offer EMI on purchases?',
    a: 'Yes! Bajaj Finserv EMI is available on all phones priced above ₹5,000. You can choose from 3, 6, 9, or 12 month plans.',
  },
];

export default function FaqPage() {
  return (
    <main>
      <section className="text-white py-16 px-4 text-center" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
      }}>
        <h1 className="text-4xl font-extrabold mb-3">Frequently Asked Questions</h1>
        <p className="text-white/80">Do you have questions? Get answers.</p>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 space-y-4">
        {FAQS.map((f, i) => (
          <details key={i} className="group card overflow-hidden">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-surface-900 text-sm list-none">
              {f.q}
              <span className="group-open:rotate-180 transition-transform shrink-0 ml-4 text-primary">▼</span>
            </summary>
            <div className="px-6 pb-5 text-sm text-surface-600 leading-relaxed border-t border-surface-100 pt-3">
              {f.a}
            </div>
          </details>
        ))}

        <div className="mt-10 rounded-2xl p-8 text-center border" style={{
          backgroundColor: 'rgba(229, 9, 20, 0.05)',
          borderColor: 'rgba(229, 9, 20, 0.2)'
        }}>
          <p className="font-bold text-surface-900 mb-2">Still have questions?</p>
          <p className="text-sm text-surface-500 mb-4">Our support team is happy to help.</p>
          <a href="/contact" className="inline-block px-6 py-3 rounded-xl font-semibold text-sm btn-primary transition-all">
            Contact Us →
          </a>
        </div>
      </section>

      {/* Promotional Offer Banner */}
      <StaticOfferBanner />
    </main>
  );
}
