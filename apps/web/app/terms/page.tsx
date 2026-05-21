import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Dream Gadgets',
  description: 'Terms and conditions for using Dream Gadgets services including buying, selling, payments, shipping, and returns.',
  openGraph: {
    title: 'Terms & Conditions — Dream Gadgets',
    description: 'Read the terms governing the use of Dream Gadgets platform, including transactions, warranties, and legal disclaimers.',
  },
};

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing, browsing, or using the Dream Gadgets website (dreamgadgets.in) and any associated services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.

If you do not agree with any part of these terms, you must not use our website or services. These terms constitute a legally binding agreement between you ("User") and Dream Gadgets ("Company", "we", "us", "our").

We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes constitutes acceptance of the updated terms.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility & Account',
    content: `To use our services, you must:

• Be at least 18 years of age
• Have the legal capacity to enter into binding contracts
• Provide accurate, current, and complete information during registration
• Maintain the confidentiality of your account credentials
• Be responsible for all activities under your account

We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity. You must notify us immediately of any unauthorized use of your account.`,
  },
  {
    id: 'buying',
    title: '3. Buying Products',
    content: `All products listed on Dream Gadgets undergo a rigorous 20-point inspection and quality certification process before listing.

Key terms for buyers:

• Product listings include condition grades, specifications, and pricing
• All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise
• Product images are for illustration; actual product may vary slightly
• We reserve the right to correct pricing errors or cancel orders in case of manifest errors
• Order confirmation occurs after successful payment processing
• We may cancel orders if the product is found to be unavailable after order placement, with full refund
• Bulk orders may be subject to additional verification`,
  },
  {
    id: 'selling',
    title: '4. Selling Products',
    content: `When selling a device through Dream Gadgets, you agree to the following:

• You confirm that you are the lawful owner of the device
• All information provided about the device condition is truthful and accurate
• The device is not stolen, blacklisted, or associated with any fraudulent activity
• You have removed all personal data, accounts (iCloud/Google), and screen locks
• You authorize us to perform diagnostic tests and data wiping
• The final price is determined after physical inspection and may differ from the quoted price
• Payment will be processed via bank transfer, UPI, or store credit within 2-3 business days after inspection
• Devices found with hardware damage not disclosed during quotation may be rejected or re-priced`,
  },
  {
    id: 'pricing',
    title: '5. Pricing & Payment',
    content: `All financial transactions on Dream Gadgets are governed by the following terms:

• All prices are in INR and exclusive of shipping charges unless stated otherwise
• Payment for purchases is collected at checkout through our payment partner Razorpay
• Accepted payment methods: Credit/Debit Cards, UPI, Net Banking, EMI options (where available)
• Prices are subject to change without prior notice
• Promotional discounts and coupon codes are subject to specific terms and expiry dates
• Cash on Delivery (COD) may be available for select locations with a nominal fee
• Sellers receive payment after successful inspection and acceptance of the device`,
  },
  {
    id: 'shipping',
    title: '6. Shipping & Delivery',
    content: `We offer free shipping on all orders within India.

• Estimated delivery time: 3-7 business days depending on location
• Orders are processed within 24 hours of payment confirmation
• Shipping is arranged through our courier partners (Delhivery, Bluedart, etc.)
• Signature is required upon delivery — please inspect the package before signing
• We are not responsible for delays caused by courier partners, weather conditions, or force majeure events
• International shipping is currently not available
• Failed delivery attempts may result in the order being returned to us; re-shipping charges may apply`,
  },
  {
    id: 'returns',
    title: '7. Returns & Refunds',
    content: `Our return and refund policies are designed to ensure customer satisfaction:

• 7-day return window from the date of delivery
• Device must be returned in the same condition as received with all accessories
• Refunds are processed within 5-7 business days after inspection of returned device
• Return shipping is arranged and paid for by Dream Gadgets
• Devices with physical damage, liquid damage, or tampered seals may be rejected for return
• Refund is credited to the original payment method

For detailed return information, please refer to our separate Return & Refund Policy.`,
  },
  {
    id: 'warranty',
    title: '8. Warranty',
    content: `All certified refurbished phones sold by Dream Gadgets come with a warranty:

• Warranty duration varies by device (mentioned on product page)
• Warranty covers manufacturing defects and hardware malfunctions
• Warranty does NOT cover: accidental damage, liquid damage, screen breakage, unauthorized repairs, normal wear and tear, battery degradation, or software issues caused by user modifications
• Warranty is non-transferable
• To claim warranty, contact our support team with your order number
• We may repair, replace, or refund at our discretion`,
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law:

• Dream Gadgets shall not be liable for any indirect, incidental, special, consequential, or punitive damages
• Our total liability is limited to the amount paid by you for the specific product or service giving rise to the claim
• We are not liable for damages arising from: use or inability to use our services, unauthorized access to your data, third-party content or services linked from our platform, or events beyond our reasonable control
• We do not warrant that our services will be uninterrupted, error-free, or free from viruses or other harmful components`,
  },
  {
    id: 'governing-law',
    title: '10. Governing Law & Dispute Resolution',
    content: `These terms shall be governed by and construed in accordance with the laws of India.

• Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra
• We encourage informal dispute resolution first — please contact our support team
• If a dispute cannot be resolved informally within 30 days, it shall be resolved through binding arbitration
• Arbitration shall be conducted in Mumbai in accordance with the Arbitration and Conciliation Act, 1996
• The arbitration award shall be final and binding on both parties`,
  },
  {
    id: 'intellectual-property',
    title: '11. Intellectual Property',
    content: `All content on the Dream Gadgets website — including text, graphics, logos, images, software, and product listings — is the property of Dream Gadgets or its content suppliers and is protected by applicable intellectual property laws.

• You may not reproduce, distribute, modify, or create derivative works without our written consent
• Brand names, logos, and product names mentioned are trademarks of their respective owners
• Unauthorized use of our intellectual property may result in legal action`,
  },
  {
    id: 'termination',
    title: '12. Termination',
    content: `We reserve the right to suspend or terminate your access to our services at any time, without prior notice, for:

• Violation of these Terms & Conditions
• Fraudulent or illegal activity
• Harassment of other users or our staff
• Non-payment of dues
• Any conduct that we deem harmful to our platform or other users

Upon termination, your right to use the services immediately ceases. Provisions regarding payments, liability, and governing law shall survive termination.`,
  },
  {
    id: 'contact',
    title: '13. Contact Us',
    content: `For questions, concerns, or notices regarding these Terms & Conditions:

• Email: support@dreamgadgets.in
• Phone: +91 98765 43210
• Address: Mumbai, Maharashtra, India`,
  },
];

export default function TermsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)',
      }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Terms & Conditions</h1>
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
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/privacy" className="text-sm text-primary hover:underline font-medium">
              Privacy Policy →
            </Link>
            <Link href="/returns" className="text-sm text-primary hover:underline font-medium">
              Return & Refund Policy →
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
