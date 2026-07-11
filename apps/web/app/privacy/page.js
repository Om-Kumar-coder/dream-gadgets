import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';
export const metadata = {
    title: 'Privacy Policy — Dream Gadgets',
    description: 'Learn how Dream Gadgets collects, uses, stores, and protects your personal information. Understand your data privacy rights and our security measures.',
    openGraph: {
        title: 'Privacy Policy — Dream Gadgets',
        description: 'Learn how Dream Gadgets handles your personal data, your rights, and our security measures.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Privacy Policy — Dream Gadgets',
        description: 'Learn how Dream Gadgets handles your personal data and your privacy rights.',
    },
};
const SECTIONS = [
    {
        id: 'information-collected',
        title: '1. Information We Collect',
        content: `We collect information that you provide directly to us, as well as information that is automatically collected when you use our website and services.`,
        list: [
            { title: 'Information You Provide', desc: 'Name, phone number, email address, shipping address, billing information, device IMEI numbers, device condition details, and payment details (processed securely through Razorpay).' },
            { title: 'Account Information', desc: 'When you create an account, we collect your name, email address, phone number, and encrypted password.' },
            { title: 'Device Information', desc: 'When selling a device, we collect information about the device including brand, model, IMEI number, condition assessment, and photographs you upload for inspection.' },
            { title: 'Automatically Collected', desc: 'IP address, browser type, operating system, referring URLs, device type, pages visited, time spent on pages, and other usage data through cookies and analytics tools.' },
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
            { title: 'Business Transfers', desc: 'In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of the business transaction.' },
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
    return (_jsxs("main", { className: "animate-fade-in", children: [_jsx(BreadcrumbJsonLd, { items: [
                    { name: 'Home', url: '/' },
                    { name: 'Privacy Policy', url: '/privacy' },
                ] }), _jsx(JsonLd, { data: webPageSchema('Privacy Policy — Dream Gadgets', 'Privacy policy explaining how Dream Gadgets handles your personal data.', [
                    { name: 'Home', url: '/' },
                    { name: 'Privacy Policy', url: '/privacy' },
                ]) }), _jsxs("section", { className: "text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero", children: [_jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative", children: [_jsx("h1", { className: "text-4xl font-extrabold mb-3", children: "Privacy Policy" }), _jsx("p", { className: "text-white/60 text-sm", children: "Last updated: January 2025" })] })] }), _jsxs("section", { className: "max-w-3xl mx-auto px-4 py-8", children: [_jsxs("div", { className: "card p-5 mb-10", children: [_jsx("h2", { className: "text-sm font-bold text-surface-900 mb-3", children: "Table of Contents" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: SECTIONS.map((section) => (_jsx("a", { href: `#${section.id}`, className: "text-sm text-surface-600 hover:text-primary hover:underline", children: section.title }, section.id))) })] }), _jsx("div", { className: "space-y-10", children: SECTIONS.map((section) => (_jsxs("div", { id: section.id, children: [_jsx("h2", { className: "heading-sm text-surface-900 mb-4", children: section.title }), _jsx("div", { className: "text-surface-600 leading-relaxed text-sm space-y-3 whitespace-pre-line", children: section.content.split('\n\n').filter(Boolean).map((para, i) => (_jsx("p", { children: para }, i))) }), section.list && (_jsx("div", { className: "mt-4 space-y-3", children: section.list.map((item, i) => (_jsxs("div", { className: "flex items-start gap-3 p-4 card hover:shadow-card-hover transition-all", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-surface-900 text-sm", children: item.title }), _jsx("p", { className: "text-sm text-surface-600 mt-0.5", children: item.desc })] })] }, i))) })), 'note' in section && section.note && (_jsx("div", { className: "mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl", children: _jsx("p", { className: "text-xs text-blue-700 leading-relaxed", children: section.note }) }))] }, section.id))) }), _jsx("div", { className: "divider mt-12 pt-8", children: _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [_jsx(Link, { href: "/cookies", className: "text-sm text-primary hover:underline font-medium", children: "Cookies Policy \u2192" }), _jsx(Link, { href: "/terms", className: "text-sm text-primary hover:underline font-medium", children: "Terms & Conditions \u2192" }), _jsx(Link, { href: "/contact", className: "text-sm text-primary hover:underline font-medium", children: "Contact Us \u2192" })] }) })] })] }));
}
//# sourceMappingURL=page.js.map