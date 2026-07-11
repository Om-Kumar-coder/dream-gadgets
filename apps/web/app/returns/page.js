import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';
export const metadata = {
    title: 'Return & Refund Policy — Dream Gadgets',
    description: 'Hassle-free 7-day return policy on all certified refurbished phones. Learn about return eligibility, process, refund timeline, and conditions.',
    openGraph: {
        title: 'Return & Refund Policy — Dream Gadgets',
        description: 'Hassle-free 7-day return policy on all certified refurbished phones from Dream Gadgets.',
    },
    twitter: {
        card: 'summary_large_image',
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
    return (_jsxs("main", { className: "animate-fade-in", children: [_jsx(BreadcrumbJsonLd, { items: [
                    { name: 'Home', url: '/' },
                    { name: 'Returns & Refunds', url: '/returns' },
                ] }), _jsx(JsonLd, { data: webPageSchema('Return & Refund Policy — Dream Gadgets', '7-day return policy for certified refurbished phones from Dream Gadgets.', [
                    { name: 'Home', url: '/' },
                    { name: 'Returns & Refunds', url: '/returns' },
                ]) }), _jsxs("section", { className: "text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero", children: [_jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative", children: [_jsx("h1", { className: "text-4xl font-extrabold mb-3", children: "Return & Refund Policy" }), _jsx("p", { className: "text-white/60 text-sm", children: "Last updated: January 2025" })] })] }), _jsxs("section", { className: "max-w-3xl mx-auto px-4 py-12", children: [_jsx("div", { className: "space-y-10", children: SECTIONS.map((section) => {
                            if (section.highlight) {
                                return (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-2xl p-6 text-center", children: _jsx("p", { className: "text-surface-800 leading-relaxed text-sm", children: section.content }) }, section.id));
                            }
                            if (section.contact) {
                                return (_jsxs("div", { id: section.id, className: "card p-6 text-center", children: [_jsx("div", { className: "text-4xl mb-3", children: "\uD83D\uDCAC" }), _jsx("h2", { className: "heading-sm text-surface-900 mb-2", children: section.title }), _jsx("p", { className: "text-sm text-surface-600 mb-4", children: section.content }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3", children: [_jsx("a", { href: "tel:+919876543210", className: "btn-secondary btn-md", children: "Call +91 98765 43210" }), _jsx("a", { href: "mailto:support@dreamgadgets.in", className: "btn-outline btn-md", children: "Email Support" }), _jsx("a", { href: "/contact", className: "btn-outline btn-md", children: "Contact Form" })] })] }, section.id));
                            }
                            return (_jsxs("div", { id: section.id, children: [_jsx("h2", { className: "heading-sm text-surface-900 mb-4", children: section.title }), section.content && (_jsx("p", { className: "text-surface-600 leading-relaxed text-sm mb-4", children: section.content })), section.list && (_jsx("div", { className: "space-y-3", children: section.list.map((item, i) => (_jsx("div", { className: "card p-4 hover:shadow-card-hover transition-all", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "text-base shrink-0 mt-0.5", children: item.icon }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-surface-900 text-sm", children: item.title }), _jsx("p", { className: "text-sm text-surface-600 mt-0.5", children: item.desc })] })] }) }, i))) })), section.steps && (_jsx("div", { className: "space-y-3", children: section.steps.map((step, i) => (_jsxs("div", { className: "flex items-start gap-4 card p-4 hover:shadow-card-hover transition-all", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0", children: step.step }), _jsxs("div", { className: "flex-1 pt-0.5", children: [_jsx("h3", { className: "font-semibold text-surface-900 text-sm", children: step.title }), _jsx("p", { className: "text-sm text-surface-600", children: step.desc })] })] }, i))) })), 'note' in section && section.note && (_jsx("div", { className: "mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl", children: _jsx("p", { className: "text-xs text-amber-700 leading-relaxed", children: section.note }) }))] }, section.id));
                        }) }), _jsx("div", { className: "divider mt-12 pt-8", children: _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [_jsx(Link, { href: "/terms", className: "text-sm text-primary hover:underline font-medium", children: "Terms & Conditions \u2192" }), _jsx(Link, { href: "/cancellation", className: "text-sm text-primary hover:underline font-medium", children: "Cancellation Policy \u2192" }), _jsx(Link, { href: "/privacy", className: "text-sm text-primary hover:underline font-medium", children: "Privacy Policy \u2192" }), _jsx(Link, { href: "/contact", className: "text-sm text-primary hover:underline font-medium", children: "Contact Us \u2192" })] }) })] })] }));
}
//# sourceMappingURL=page.js.map