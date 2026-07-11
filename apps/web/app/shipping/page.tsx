import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Shipping Policy — Dream Gadgets',
  description: 'Learn about Dream Gadgets shipping policy — free shipping across India, 3-7 business days delivery, order processing timeline, and complete coverage areas.',
  openGraph: {
    title: 'Shipping Policy — Dream Gadgets',
    description: 'Free shipping on all orders within India. 3-7 business days delivery. Learn about our shipping process and coverage areas.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping Policy — Dream Gadgets',
    description: 'Free shipping on all orders within India. 3-7 business days delivery.',
  },
};

const SECTIONS = [
  {
    id: 'overview',
    title: 'Shipping Overview',
    content: `At Dream Gadgets, we offer free shipping on all orders within India. We partner with leading courier services to ensure your order reaches you safely and on time. Below is a detailed overview of our shipping policy.`,
    highlight: true,
  },
  {
    id: 'coverage',
    title: '1. Shipping Coverage',
    content: `We currently ship to all cities and towns across India. Our courier partners — Delhivery, Bluedart, and India Post — have extensive networks covering metropolitan cities, tier-2 and tier-3 cities, and most rural areas with pin code accessibility.`,
    list: [
      { icon: '🏙️', title: 'Metro Cities', desc: 'Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Ahmedabad, Pune — typically delivered within 2-4 business days.' },
      { icon: '🏘️', title: 'Tier-2 Cities', desc: 'Lucknow, Jaipur, Chandigarh, Bhopal, Indore, Patna, Guwahati, etc. — typically delivered within 3-5 business days.' },
      { icon: '🏡', title: 'Tier-3 & Rural', desc: 'Smaller towns and villages — typically delivered within 5-7 business days, subject to courier network availability.' },
      { icon: '🌍', title: 'International Shipping', desc: 'International shipping is currently not available. We only ship within India at this time.' },
    ],
  },
  {
    id: 'processing',
    title: '2. Order Processing Time',
    content: `Once your order is placed and payment is confirmed, here's what happens:`,

    steps: [
      { step: '1', title: 'Order Confirmation', desc: 'Immediately after successful payment, you will receive an order confirmation via email and SMS with your order number.' },
      { step: '2', title: 'Quality Check', desc: 'Each device undergoes a final quality check before packing to ensure it meets our certified refurbished standards (within 12 hours).' },
      { step: '3', title: 'Packing & Labeling', desc: 'Your device is securely packed in a branded box with all accessories, and the shipping label is generated.' },
      { step: '4', title: 'Handover to Courier', desc: 'The package is handed over to our courier partner within 24 hours of order confirmation (on business days).' },
      { step: '5', title: 'Tracking Update', desc: 'You will receive tracking details via email and SMS once the courier picks up the package.' },
    ],
    note: 'Orders placed after 4 PM IST on business days, or on weekends/public holidays, will be processed on the next business day.',
  },
  {
    id: 'charges',
    title: '3. Shipping Charges',
    content: `We believe in transparent pricing with no hidden charges.`,

    list: [
      { icon: '🚚', title: 'Free Shipping', desc: 'All orders within India qualify for free shipping. There are no minimum order value requirements.' },
      { icon: '⚡', title: 'Express Shipping', desc: 'Express shipping is available at an additional cost for customers who need faster delivery. Contact our support team for express delivery options and charges.' },
      { icon: '📦', title: 'Cash on Delivery (COD)', desc: 'COD is available at select pin codes. A nominal fee of ₹99 may apply for COD orders. COD orders are processed after successful address verification.' },
    ],
  },
  {
    id: 'delivery',
    title: '4. Delivery Timeline',
    content: `Estimated delivery times from the date of order processing (not order placement):`,

    table: [
      { location: 'Metro Cities', standard: '2-4 business days', express: '1-2 business days' },
      { location: 'Tier-2 Cities', standard: '3-5 business days', express: '2-3 business days' },
      { location: 'Tier-3 / Rural', standard: '5-7 business days', express: 'Not available' },
      { location: 'Remote Areas', standard: '7-10 business days', express: 'Not available' },
    ],
    note: 'Delivery timelines are estimates and may vary due to unforeseen circumstances such as weather conditions, festivals, strikes, or courier partner delays. We will keep you informed of any significant delays.',
  },
  {
    id: 'tracking',
    title: '5. Order Tracking',
    content: `Once your order is shipped, you can track it in the following ways:`,

    list: [
      { icon: '📱', title: 'Order Tracking Page', desc: 'Log in to your account and visit the "My Orders" section to see real-time tracking updates for all your orders.' },
      { icon: '📧', title: 'Email Updates', desc: 'You will receive automated email updates at each stage — order confirmation, dispatch notification, out for delivery, and delivered.' },
      { icon: '📨', title: 'SMS Notifications', desc: 'SMS updates are sent to your registered phone number for key milestones — dispatched, out for delivery, and delivered.' },
      { icon: '🔗', title: 'Courier Tracking Link', desc: 'A direct tracking link from our courier partner is provided in the dispatch notification email and SMS.' },
    ],
  },
  {
    id: 'delivery-instructions',
    title: '6. Delivery Instructions',
    content: `To ensure a smooth delivery experience:`,

    list: [
      { icon: '✍️', title: 'Signature Required', desc: 'A signature is required upon delivery. Ensure someone is available to receive the package at the shipping address.' },
      { icon: '🔍', title: 'Inspect Before Signing', desc: 'Please inspect the package for any visible damage before signing. If the package appears damaged, refuse delivery and contact us immediately.' },
      { icon: '📸', title: 'Unboxing Video Recommended', desc: 'We strongly recommend recording an unboxing video. This helps us process any damage claims quickly if the device arrives damaged.' },
      { icon: '👤', title: 'Authorized Recipient', desc: 'If you are not available, the package can be delivered to an authorized person at the same address. Please inform them about the delivery.' },
    ],
  },
  {
    id: 'failed-delivery',
    title: '7. Failed Delivery & Re-shipment',
    content: `If a delivery attempt fails due to any of the following reasons:`,

    list: [
      { icon: '🚫', title: 'Recipient Not Available', desc: 'Our courier partner will make 3 delivery attempts. If all attempts fail, the package will be returned to us.' },
      { icon: '📍', title: 'Incorrect Address', desc: 'If the address provided is incorrect or incomplete, the package may be returned. A re-shipment fee may apply for corrections.' },
      { icon: '📞', title: 'Unreachable Phone', desc: 'If the phone number provided is unreachable during delivery attempts, the package will be returned.' },
    ],
    note: 'For returned packages due to failed delivery, we will contact you to arrange re-shipment. Additional shipping charges may apply for re-shipment. If you decide not to proceed, a refund will be processed after deducting the shipping cost incurred.',
  },
  {
    id: 'contact',
    title: '8. Need Help?',
    content: `If you have any questions about shipping or need assistance with your order, our support team is here to help.`,
    contact: true,
  },
];

export default function ShippingPage() {
  return (
    <main className="animate-fade-in">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Shipping Policy', url: '/shipping' },
      ]} />
      <JsonLd data={webPageSchema('Shipping Policy — Dream Gadgets', 'Dream Gadgets shipping policy — free shipping across India, delivery timeline, and order processing.', [
        { name: 'Home', url: '/' },
        { name: 'Shipping Policy', url: '/shipping' },
      ])} />
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Shipping Policy</h1>
          <p className="text-white/60 text-sm">Last updated: July 2026</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        {/* Table of Contents */}
        <div className="card p-5 mb-10">
          <h2 className="text-sm font-bold text-surface-900 mb-3">Table of Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SECTIONS.filter(s => !s.highlight && !s.contact).map((section) => (
              <a key={section.id} href={`#${section.id}`} className="text-sm text-surface-600 hover:text-primary hover:underline">
                {section.title}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          {SECTIONS.map((section) => {
            if (section.highlight) {
              return (
                <div key={section.id} className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
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

                {/* Table display */}
                {'table' in section && section.table && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-surface-100">
                          <th className="text-left p-3 font-semibold text-surface-900 border border-surface-200">Location</th>
                          <th className="text-left p-3 font-semibold text-surface-900 border border-surface-200">Standard Delivery</th>
                          <th className="text-left p-3 font-semibold text-surface-900 border border-surface-200">Express Delivery</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(section.table as Array<{location: string; standard: string; express: string}>).map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-50'}>
                            <td className="p-3 border border-surface-200 font-medium text-surface-900">{row.location}</td>
                            <td className="p-3 border border-surface-200 text-surface-600">{row.standard}</td>
                            <td className="p-3 border border-surface-200 text-surface-600">{row.express}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* List display */}
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

                {/* Steps display */}
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
            <Link href="/cancellation" className="text-sm text-primary hover:underline font-medium">Cancellation & Refunds →</Link>
            <Link href="/contact" className="text-sm text-primary hover:underline font-medium">Contact Us →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
