import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';
export const metadata = {
    title: 'Cookies Policy — Dream Gadgets',
    description: 'Learn how Dream Gadgets uses cookies — essential, preference, analytics and authentication. Understand how you can control your cookie preferences.',
    openGraph: {
        title: 'Cookies Policy — Dream Gadgets',
        description: 'Learn how Dream Gadgets uses cookies and how to manage your cookie preferences.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cookies Policy — Dream Gadgets',
        description: 'Learn how Dream Gadgets uses cookies and how to manage your preferences.',
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
                desc: 'These cookies are required for the website to function properly. They enable core features such as security, network management, and account authentication.',
                alwaysOn: true,
            },
            {
                title: 'Preference / Functionality Cookies',
                desc: 'These cookies remember your settings and preferences, such as language, currency, and product wishlist items.',
            },
            {
                title: 'Analytics / Performance Cookies',
                desc: 'These cookies help us understand how visitors interact with our website by collecting anonymous information.',
            },
            {
                title: 'Authentication Cookies',
                desc: 'These cookies keep you logged in to your account across pages and sessions.',
            },
        ],
    },
    {
        id: 'managing-cookies',
        title: 'Managing Cookies',
        content: `You have full control over cookies. Most web browsers allow you to manage cookie preferences, including blocking or deleting cookies entirely.`,
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
        content: `We may update this Cookies Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page with an updated effective date.`,
    },
    {
        id: 'contact',
        title: 'Contact Us',
        content: `If you have any questions about our use of cookies, please contact us:\n• Email: support@dreamgadgets.in\n• Phone: +91 98765 43210\n• Address: Mumbai, Maharashtra, India`,
    },
];
export default function CookiesPage() {
    return (_jsxs("main", { className: "animate-fade-in", children: [_jsx(BreadcrumbJsonLd, { items: [
                    { name: 'Home', url: '/' },
                    { name: 'Cookies Policy', url: '/cookies' },
                ] }), _jsx(JsonLd, { data: webPageSchema('Cookies Policy — Dream Gadgets', 'How Dream Gadgets uses cookies and how you can control them.', [
                    { name: 'Home', url: '/' },
                    { name: 'Cookies Policy', url: '/cookies' },
                ]) }), _jsxs("section", { className: "text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero", children: [_jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative", children: [_jsx("h1", { className: "text-4xl font-extrabold mb-3", children: "Cookies Policy" }), _jsx("p", { className: "text-white/60 text-sm", children: "Last updated: January 2025" })] })] }), _jsxs("section", { className: "max-w-3xl mx-auto px-4 py-12", children: [_jsx("div", { className: "space-y-10", children: SECTIONS.map((section) => (_jsxs("div", { id: section.id, children: [_jsx("h2", { className: "heading-sm text-surface-900 mb-4", children: section.title }), typeof section.content === 'string' && (_jsx("div", { className: "text-surface-600 leading-relaxed text-sm space-y-3 whitespace-pre-line", children: section.content.split('\n\n').map((para, i) => (_jsx("p", { children: para }, i))) })), section.list && (_jsx("div", { className: "mt-4 space-y-3", children: section.list.map((item, i) => (_jsx("div", { className: "card p-4 hover:shadow-card-hover transition-all", children: _jsx("div", { className: "flex items-start gap-3", children: _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "font-semibold text-surface-900 text-sm flex items-center gap-2", children: [item.title, 'alwaysOn' in item && item.alwaysOn && (_jsx("span", { className: "badge-info", children: "Always Active" }))] }), _jsx("p", { className: "text-sm text-surface-600 mt-1", children: item.desc })] }) }) }, i))) })), 'note' in section && section.note && (_jsx("div", { className: "mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl", children: _jsxs("p", { className: "text-xs text-amber-700 flex items-start gap-2", children: [_jsx("span", { className: "text-amber-500 shrink-0", children: "\u26A0" }), section.note] }) }))] }, section.id))) }), _jsx("div", { className: "divider mt-12 pt-8", children: _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [_jsx(Link, { href: "/privacy", className: "text-sm text-primary hover:underline font-medium", children: "Privacy Policy \u2192" }), _jsx(Link, { href: "/terms", className: "text-sm text-primary hover:underline font-medium", children: "Terms & Conditions \u2192" }), _jsx(Link, { href: "/contact", className: "text-sm text-primary hover:underline font-medium", children: "Contact Us \u2192" })] }) })] })] }));
}
//# sourceMappingURL=page.js.map