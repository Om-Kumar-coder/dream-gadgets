import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StaticOfferBanner } from '../../components/banner/StaticPageBanners';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { faqPageSchema, webPageSchema } from '../../lib/seo/schemas';
export const metadata = {
    title: 'Frequently Asked Questions — Dream Gadgets',
    description: 'Find answers to common questions about buying and selling phones at Dream Gadgets — pricing, returns, payments, data safety, and more.',
    openGraph: {
        title: 'FAQ — Dream Gadgets',
        description: 'Answers to common questions about selling phones, buying refurbished devices, payments, returns, and warranties at Dream Gadgets.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FAQ — Dream Gadgets',
        description: 'Get answers to frequently asked questions about Dream Gadgets.',
    },
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
    return (_jsxs("main", { children: [_jsx(BreadcrumbJsonLd, { items: [
                    { name: 'Home', url: '/' },
                    { name: 'FAQ', url: '/faq' },
                ] }), _jsx(JsonLd, { data: faqPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))) }), _jsx(JsonLd, { data: webPageSchema('FAQ — Dream Gadgets', 'Frequently asked questions about buying and selling phones.', [
                    { name: 'Home', url: '/' },
                    { name: 'FAQ', url: '/faq' },
                ]) }), _jsxs("section", { className: "text-white py-16 px-4 text-center", style: {
                    background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
                }, children: [_jsx("h1", { className: "text-4xl font-extrabold mb-3", children: "Frequently Asked Questions" }), _jsx("p", { className: "text-white/80", children: "Do you have questions? Get answers." })] }), _jsxs("section", { className: "max-w-3xl mx-auto px-4 py-16 space-y-4", children: [FAQS.map((f, i) => (_jsxs("details", { className: "group card overflow-hidden", children: [_jsxs("summary", { className: "flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-surface-900 text-sm list-none", children: [f.q, _jsx("span", { className: "group-open:rotate-180 transition-transform shrink-0 ml-4 text-primary", children: "\u25BC" })] }), _jsx("div", { className: "px-6 pb-5 text-sm text-surface-600 leading-relaxed border-t border-surface-100 pt-3", children: f.a })] }, i))), _jsxs("div", { className: "mt-10 rounded-2xl p-8 text-center border", style: {
                            backgroundColor: 'rgba(229, 9, 20, 0.05)',
                            borderColor: 'rgba(229, 9, 20, 0.2)'
                        }, children: [_jsx("p", { className: "font-bold text-surface-900 mb-2", children: "Still have questions?" }), _jsx("p", { className: "text-sm text-surface-500 mb-4", children: "Our support team is happy to help." }), _jsx("a", { href: "/contact", className: "inline-block px-6 py-3 rounded-xl font-semibold text-sm btn-primary transition-all", children: "Contact Us \u2192" })] })] }), _jsx(StaticOfferBanner, {})] }));
}
//# sourceMappingURL=page.js.map