import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';
export const metadata = {
    title: 'Cancellation & Refunds — Dream Gadgets',
    description: 'Learn about Dream Gadgets order cancellation policy and refund process. Cancel before shipping, 7-day returns, and hassle-free refunds.',
    openGraph: {
        title: 'Cancellation & Refunds — Dream Gadgets',
        description: 'Easy order cancellation before shipping and a 7-day return policy for all certified refurbished phones.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cancellation & Refunds — Dream Gadgets',
        description: 'Easy cancellation and refund policy for Dream Gadgets orders.',
    },
};
const SECTIONS = [
    {
        id: 'cancellation-overview',
        title: 'A. Order Cancellation',
        content: `We understand that sometimes you may need to cancel an order. Dream Gadgets offers a flexible cancellation policy to accommodate your needs. Please review the details below.`,
        highlight: true,
    },
    {
        id: 'cancellation-before-shipping',
        title: '1. Cancellation Before Shipping',
        content: `You can cancel your order free of charge at any time before the order is dispatched from our facility.`,
        list: [
            { icon: '✅', title: 'Full Refund', desc: 'Orders cancelled before dispatch are eligible for a 100% full refund. No cancellation fees apply.' },
            { icon: '⏱️', title: 'Cancellation Window', desc: 'Orders can typically be cancelled within the first 24 hours of placement, or anytime before the package is handed over to the courier.' },
            { icon: '📞', title: 'How to Cancel', desc: 'Contact our support team via phone, email, WhatsApp, or visit your account "My Orders" page to request cancellation.' },
            { icon: '⚡', title: 'Instant Confirmation', desc: 'Cancellation requests made within the cancellation window are confirmed immediately, and the refund process begins right away.' },
        ],
    },
    {
        id: 'cancellation-after-shipping',
        title: '2. Cancellation After Shipping',
        content: `Once your order has been dispatched, cancellation works differently:`,
        list: [
            { icon: '⚠️', title: 'Cannot Cancel Directly', desc: 'Once the package is with the courier, it cannot be cancelled directly. You will need to refuse the delivery or return it after delivery.' },
            { icon: '🚫', title: 'Refuse Delivery', desc: 'If the courier attempts delivery and you refuse to accept the package, it will be returned to us. A refund will be processed after we receive the returned package, minus the shipping cost.' },
            { icon: '📦', title: 'Return After Delivery', desc: 'If the package has already been delivered, you can initiate a return within 7 days as per our Return Policy. See Section B below for details.' },
        ],
    },
    {
        id: 'cancellation-methods',
        title: '3. How to Cancel an Order',
        content: `You can cancel your order through any of the following methods:`,
        list: [
            { icon: '👤', title: 'Via Your Account', desc: 'Log in to your Dream Gadgets account, go to "My Orders", find your order, and click "Cancel Order" if the option is available.' },
            { icon: '📞', title: 'Via Phone', desc: 'Call our support team at +91 98765 43210. Have your order number ready for quick processing.' },
            { icon: '✉️', title: 'Via Email', desc: 'Send a cancellation request to support@dreamgadgets.in with your order number and reason for cancellation.' },
            { icon: '💬', title: 'Via WhatsApp', desc: 'Send a message on WhatsApp with your order number and "CANCEL" to initiate the cancellation process.' },
        ],
    },
    {
        id: 'cancellation-fee',
        title: '4. Cancellation Fees',
        content: `We believe in fair and transparent policies:`,
        list: [
            { icon: '🆓', title: 'Before Dispatch', desc: 'No cancellation fee. 100% of the order amount will be refunded.' },
            { icon: '💰', title: 'After Dispatch (Refused)', desc: 'Shipping charges (actual cost incurred) will be deducted from the refund amount.' },
            { icon: '📱', title: 'COD Orders', desc: 'COD orders cancelled before dispatch have no fees. For refused COD deliveries, a nominal fee of ₹99 may be deducted to cover reverse logistics.' },
        ],
    },
    {
        id: 'refund-overview',
        title: 'B. Return & Refund Policy',
        content: `At Dream Gadgets, customer satisfaction is our priority. We offer a 7-day return policy on all certified refurbished phones purchased through our platform. If you're not completely satisfied with your purchase, we're here to help.`,
        highlight: true,
    },
    {
        id: 'refund-eligibility',
        title: '5. Return Eligibility',
        content: `To be eligible for a return, the following conditions must be met:`,
        list: [
            { icon: '✅', title: 'Return Window', desc: 'Return request must be initiated within 7 calendar days from the date of delivery.' },
            { icon: '✅', title: 'Same Condition', desc: 'The device must be in the same condition as received — no physical damage, scratches, or signs of misuse.' },
            { icon: '✅', title: 'Complete Package', desc: 'All original accessories must be included: charger, cable, SIM ejector tool, and packaging box (if provided).' },
            { icon: '✅', title: 'No Tampering', desc: 'The device must not show signs of tampering, unauthorized repairs, or attempted disassembly.' },
            { icon: '✅', title: 'Accounts Removed', desc: 'All accounts (iCloud, Google, etc.) and personal data must be removed from the device.' },
            { icon: '✅', title: 'Find My iPhone Off', desc: 'Apple devices must have "Find My iPhone" disabled. Android devices must have FRP (Factory Reset Protection) disabled.' },
        ],
    },
    {
        id: 'refund-process',
        title: '6. Return Process',
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
        title: '7. Refund Timeline & Method',
        content: `Refunds are processed after the returned device passes our quality inspection.`,
        list: [
            { icon: '⏱️', title: 'Processing Time', desc: '5-7 business days from the date the returned device passes inspection.' },
            { icon: '💳', title: 'Refund Method', desc: 'Amount is credited back to the original payment method (credit card, debit card, UPI, net banking).' },
            { icon: '📱', title: 'UPI Refunds', desc: 'UPI payments are refunded to the same UPI ID within 24-48 hours of processing.' },
            { icon: '🏦', title: 'Bank Transfer', desc: 'For net banking, refunds reflect in 3-5 business days after processing.' },
            { icon: '💰', title: 'COD Refunds', desc: 'Cash on Delivery orders are refunded via bank transfer. Please provide your bank account details for processing.' },
        ],
        note: 'Refund timelines depend on your bank/payment provider. Dream Gadgets initiates the refund within 24 hours of inspection clearance. The total time from initiating a return to receiving your refund is typically 7-10 business days.',
    },
    {
        id: 'non-returnable',
        title: '8. Non-Returnable Items',
        content: `The following items and situations are NOT eligible for return:`,
        list: [
            { icon: '❌', title: 'Non-returnable Items', desc: 'Accessories purchased separately (chargers, cables, cases, screen protectors), devices marked as "final sale" or "as-is", and software-downloaded products.' },
            { icon: '❌', title: 'Physical Damage', desc: 'Devices with cracks, dents, scratches, liquid damage, or other physical damage caused after delivery.' },
            { icon: '❌', title: 'Accounts Not Removed', desc: 'Devices with active iCloud, Google, or other account locks (FRP locked) cannot be returned.' },
            { icon: '❌', title: 'Unauthorized Repairs', desc: 'Devices that have been opened, repaired, or modified by anyone other than Dream Gadgets.' },
            { icon: '❌', title: 'Missing Accessories', desc: 'Returns without all original accessories may be rejected or subject to a deduction from the refund amount.' },
            { icon: '❌', title: 'Beyond 7 Days', desc: 'Return requests made after 7 calendar days from the date of delivery will not be accepted.' },
        ],
    },
    {
        id: 'refund-exceptions',
        title: '9. Refund Exceptions & Deductions',
        content: `In certain cases, partial refunds or deductions may apply:`,
        list: [
            { icon: '🔧', title: 'Missing Accessories', desc: 'If accessories are missing, a deduction of up to ₹500 may be applied from the refund amount depending on the missing items.' },
            { icon: '📦', title: 'Damaged Packaging', desc: 'If the original box/packaging is damaged or missing, a nominal deduction may apply.' },
            { icon: '⏳', title: 'Late Returns', desc: 'Returns initiated after 7 days but before 10 days may be accepted at our discretion with a restocking fee of 10% of the order value.' },
            { icon: '💵', title: 'Shipping Costs', desc: 'Original shipping costs (if any) are non-refundable. Return shipping is covered by Dream Gadgets.' },
        ],
    },
    {
        id: 'warranty',
        title: '10. Warranty Coverage',
        content: `All certified refurbished phones come with a warranty that covers manufacturing defects.`,
        list: [
            { icon: '🛡️', title: 'Covered', desc: 'Hardware malfunctions, charging port issues, camera defects, speaker/mic failures, battery draining abnormally, motherboard failures.' },
            { icon: '⚠️', title: 'Not Covered', desc: 'Accidental damage, liquid damage, screen breakage, normal battery degradation, software issues caused by user modifications, and cosmetic wear.' },
            { icon: '📋', title: 'Claim Process', desc: 'To claim warranty, contact our support team with your order number and a description of the issue. We will guide you through the process.' },
        ],
        note: 'Warranty duration varies by device. Check the warranty period mentioned on the product page at the time of purchase. Warranty is non-transferable.',
    },
    {
        id: 'contact',
        title: '11. Need Help?',
        content: `Our support team is available to assist you with cancellations, returns, refunds, and warranty claims. We're committed to resolving your concerns promptly.`,
        contact: true,
    },
];
export default function CancellationPage() {
    return (_jsxs("main", { className: "animate-fade-in", children: [_jsx(BreadcrumbJsonLd, { items: [
                    { name: 'Home', url: '/' },
                    { name: 'Cancellation & Refunds', url: '/cancellation' },
                ] }), _jsx(JsonLd, { data: webPageSchema('Cancellation & Refunds — Dream Gadgets', 'Order cancellation policy and refund process for Dream Gadgets.', [
                    { name: 'Home', url: '/' },
                    { name: 'Cancellation & Refunds', url: '/cancellation' },
                ]) }), _jsxs("section", { className: "text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero", children: [_jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative", children: [_jsx("h1", { className: "text-4xl font-extrabold mb-3", children: "Cancellation & Refund Policy" }), _jsx("p", { className: "text-white/60 text-sm", children: "Last updated: July 2026" })] })] }), _jsxs("section", { className: "max-w-3xl mx-auto px-4 py-12", children: [_jsxs("div", { className: "card p-5 mb-10", children: [_jsx("h2", { className: "text-sm font-bold text-surface-900 mb-3", children: "Table of Contents" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: [_jsx("span", { className: "text-xs font-bold text-primary uppercase tracking-wider col-span-full mb-1", children: "Order Cancellation" }), SECTIONS.filter(s => s.id.startsWith('cancellation') && !s.highlight).map((section) => (_jsx("a", { href: `#${section.id}`, className: "text-sm text-surface-600 hover:text-primary hover:underline", children: section.title }, section.id))), _jsx("span", { className: "text-xs font-bold text-primary uppercase tracking-wider col-span-full mb-1 mt-3", children: "Returns & Refunds" }), SECTIONS.filter(s => s.id.startsWith('refund') && !s.highlight).map((section) => (_jsx("a", { href: `#${section.id}`, className: "text-sm text-surface-600 hover:text-primary hover:underline", children: section.title }, section.id))), SECTIONS.filter(s => !s.id.startsWith('cancellation') && !s.id.startsWith('refund') && !s.highlight && !s.contact).map((section) => (_jsx("a", { href: `#${section.id}`, className: "text-sm text-surface-600 hover:text-primary hover:underline", children: section.title }, section.id)))] })] }), _jsx("div", { className: "space-y-10", children: SECTIONS.map((section) => {
                            if (section.highlight) {
                                return (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-2xl p-6 text-center", children: _jsx("p", { className: "text-surface-800 leading-relaxed text-sm", children: section.content }) }, section.id));
                            }
                            if (section.contact) {
                                return (_jsxs("div", { id: section.id, className: "card p-6 text-center", children: [_jsx("div", { className: "text-4xl mb-3", children: "\uD83D\uDCAC" }), _jsx("h2", { className: "heading-sm text-surface-900 mb-2", children: section.title }), _jsx("p", { className: "text-sm text-surface-600 mb-4", children: section.content }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3", children: [_jsx("a", { href: "tel:+919876543210", className: "btn-secondary btn-md", children: "Call +91 98765 43210" }), _jsx("a", { href: "mailto:support@dreamgadgets.in", className: "btn-outline btn-md", children: "Email Support" }), _jsx("a", { href: "/contact", className: "btn-outline btn-md", children: "Contact Form" })] })] }, section.id));
                            }
                            return (_jsxs("div", { id: section.id, children: [_jsx("h2", { className: "heading-sm text-surface-900 mb-4", children: section.title }), section.content && (_jsx("p", { className: "text-surface-600 leading-relaxed text-sm mb-4", children: section.content })), section.list && (_jsx("div", { className: "space-y-3", children: section.list.map((item, i) => (_jsx("div", { className: "card p-4 hover:shadow-card-hover transition-all", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "text-base shrink-0 mt-0.5", children: item.icon }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-surface-900 text-sm", children: item.title }), _jsx("p", { className: "text-sm text-surface-600 mt-0.5", children: item.desc })] })] }) }, i))) })), section.steps && (_jsx("div", { className: "space-y-3", children: section.steps.map((step, i) => (_jsxs("div", { className: "flex items-start gap-4 card p-4 hover:shadow-card-hover transition-all", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0", children: step.step }), _jsxs("div", { className: "flex-1 pt-0.5", children: [_jsx("h3", { className: "font-semibold text-surface-900 text-sm", children: step.title }), _jsx("p", { className: "text-sm text-surface-600", children: step.desc })] })] }, i))) })), 'note' in section && section.note && (_jsx("div", { className: "mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl", children: _jsx("p", { className: "text-xs text-amber-700 leading-relaxed", children: section.note }) }))] }, section.id));
                        }) }), _jsx("div", { className: "divider mt-12 pt-8", children: _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [_jsx(Link, { href: "/terms", className: "text-sm text-primary hover:underline font-medium", children: "Terms & Conditions \u2192" }), _jsx(Link, { href: "/privacy", className: "text-sm text-primary hover:underline font-medium", children: "Privacy Policy \u2192" }), _jsx(Link, { href: "/contact", className: "text-sm text-primary hover:underline font-medium", children: "Contact Us \u2192" })] }) })] })] }));
}
//# sourceMappingURL=page.js.map