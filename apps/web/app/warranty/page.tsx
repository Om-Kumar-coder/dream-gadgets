import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Warranty Policy — Dream Gadgets',
  description: 'Learn about Dream Gadgets warranty coverage for certified pre-owned smartphones — manufacturing defects, duration, claim process, and exclusions.',
  openGraph: {
    title: 'Warranty Policy — Dream Gadgets',
    description: 'Learn about Dream Gadgets warranty coverage for certified pre-owned smartphones.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Warranty Policy — Dream Gadgets',
    description: 'Learn about Dream Gadgets warranty coverage for certified pre-owned smartphones.',
  },
};

const SECTIONS = [
  {
    id: 'overview',
    title: 'Warranty Overview',
    content: `At Dream Gadgets, we stand behind the quality of every certified pre-owned smartphone we sell. All devices come with a comprehensive warranty that covers manufacturing defects, giving you complete peace of mind with your purchase.`,
    highlight: true,
  },
  {
    id: 'coverage',
    title: `1. What's Covered`,
    content: `Our warranty covers manufacturing defects and hardware malfunctions that occur during normal use within the warranty period.`,
    list: [
      { icon: '🛡️', title: 'Hardware Malfunctions', desc: 'Defects in internal hardware components that prevent normal device operation.' },
      { icon: '🔋', title: 'Battery Issues', desc: 'Premature battery failure or abnormal battery drain not caused by user habits.' },
      { icon: '📷', title: 'Camera Defects', desc: 'Rear or front camera malfunction, focus issues, or sensor failures.' },
      { icon: '🔊', title: 'Audio Failures', desc: 'Speaker, microphone, or earpiece malfunctions.' },
      { icon: '🔌', title: 'Charging Port Issues', desc: 'Charging port defects that prevent normal charging or data transfer.' },
      { icon: '📱', title: 'Display Defects', desc: 'Screen abnormalities like dead pixels, discoloration, or touch unresponsiveness not caused by physical damage.' },
      { icon: '🔄', title: 'Motherboard Failures', desc: 'System-level board failures that prevent the device from powering on or functioning.' },
    ],
  },
  {
    id: 'exclusions',
    title: `2. What's Not Covered`,
    content: `The following are not covered under our warranty policy:`,
    list: [
      { icon: '❌', title: 'Physical Damage', desc: 'Cracks, dents, scratches, bent frames, or any damage caused by drops or impacts.' },
      { icon: '💧', title: 'Liquid Damage', desc: 'Devices showing signs of liquid contact or corrosion (Liquid Contact Indicators triggered).' },
      { icon: '⚠️', title: 'Unauthorized Repairs', desc: 'Devices that have been opened, repaired, or modified by anyone other than Dream Gadgets.' },
      { icon: '📉', title: 'Normal Battery Degradation', desc: 'Expected battery capacity reduction over time with normal use.' },
      { icon: '🔓', title: 'Software Modifications', desc: 'Issues caused by jailbreaking, rooting, custom ROMs, or unauthorized software modifications.' },
      { icon: '🎨', title: 'Cosmetic Wear', desc: 'Normal cosmetic wear including minor scratches, fading, or normal usage marks.' },
      { icon: '📱', title: 'Accessories', desc: 'Chargers, cables, cases, and other accessories sold separately.' },
    ],
  },
  {
    id: 'duration',
    title: '3. Warranty Duration',
    content: `The warranty period varies by device and is clearly mentioned on each product page.`,
    list: [
      { icon: '📱', title: 'Premium Devices', desc: 'Flagship smartphones (Apple, Samsung Galaxy S/Note series) — up to 12 months warranty.' },
      { icon: '📱', title: 'Mid-Range Devices', desc: 'Mid-range smartphones — up to 6 months warranty.' },
      { icon: '📱', title: 'Budget Devices', desc: 'Budget and entry-level smartphones — up to 3 months warranty.' },
      { icon: '🏷️', title: 'Final Sale / As-Is', desc: 'Devices marked as "final sale" or "as-is" are sold without warranty. All sales final.' },
    ],
    note: 'Warranty duration starts from the date of delivery. Warranty is non-transferable and applies only to the original purchaser.',
  },
  {
    id: 'claim-process',
    title: '4. How to Claim Warranty',
    content: `Filing a warranty claim is simple and hassle-free:`,
    steps: [
      { step: '1', title: 'Contact Support', desc: 'Reach out to our support team via phone, email, or WhatsApp with your order details.' },
      { step: '2', title: 'Describe the Issue', desc: 'Explain the defect or issue you are experiencing. Our team may guide you through basic troubleshooting.' },
      { step: '3', title: 'Get Approval', desc: 'If the issue is covered under warranty, we will provide a warranty claim approval within 24 hours.' },
      { step: '4', title: 'Ship or Visit Store', desc: 'Send the device to our service center or visit any Dream Gadgets store for inspection.' },
      { step: '5', title: 'Repair or Replace', desc: 'Once inspected, we will repair the device or provide a replacement if repair is not feasible.' },
    ],
  },
  {
    id: 'process',
    title: '5. Warranty Service Process',
    content: `After your warranty claim is approved, here's what happens:`,
    list: [
      { icon: '🔍', title: 'Inspection', desc: 'Our technicians inspect the device to confirm the defect is covered under warranty. Typical turnaround: 1-2 business days.' },
      { icon: '🔧', title: 'Repair', desc: 'If repairable, we fix the issue using genuine parts. Typical turnaround: 2-5 business days.' },
      { icon: '🔄', title: 'Replacement', desc: 'If the device cannot be repaired, we will replace it with a device of equivalent specifications and condition.' },
      { icon: '📦', title: 'Return Shipping', desc: 'We cover the return shipping cost for warranty service. The device will be shipped back to you at no charge.' },
    ],
    note: 'Turnaround times are estimates and may vary depending on parts availability. You will be kept informed of the status throughout the process.',
  },
  {
    id: 'support',
    title: '6. Need Help?',
    content: 'Our support team is available to assist you with warranty claims and any questions about your coverage.',
    contact: true,
  },
];

export default function WarrantyPage() {
  return (
    <main className="animate-fade-in">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Warranty Policy', url: '/warranty' },
      ]} />
      <JsonLd data={webPageSchema('Warranty Policy — Dream Gadgets', 'Warranty coverage for certified pre-owned smartphones from Dream Gadgets.', [
        { name: 'Home', url: '/' },
        { name: 'Warranty Policy', url: '/warranty' },
      ])} />
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Warranty Policy</h1>
          <p className="text-white/60 text-sm">Last updated: January 2025</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-10">
          {SECTIONS.map((section) => {
            if (section.highlight) {
              return (
                <div key={section.id} className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
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
                    <a href="tel:+918017999888" className="btn-secondary btn-md">Call +91 8017 999 888</a>
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
            <Link href="/returns" className="text-sm text-primary hover:underline font-medium">Return & Refund Policy →</Link>
            <Link href="/cancellation" className="text-sm text-primary hover:underline font-medium">Cancellation Policy →</Link>
            <Link href="/shipping" className="text-sm text-primary hover:underline font-medium">Shipping Policy →</Link>
            <Link href="/contact" className="text-sm text-primary hover:underline font-medium">Contact Us →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
