import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { StaticOfferBanner } from '../../components/banner/StaticPageBanners';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';
export const metadata = {
    title: 'About Us — Dream Gadgets',
    description: "India's most transparent mobile selling platform for certified used phones. Learn about our mission, values, and why thousands trust us.",
    openGraph: {
        title: 'About Us — Dream Gadgets',
        description: "India's most transparent mobile selling platform. 10,000+ devices sold, 4.8★ rating, 5+ branches.",
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Us — Dream Gadgets',
        description: "India's most transparent mobile selling platform.",
    },
};
export default function AboutPage() {
    return (_jsxs("main", { className: "animate-fade-in", children: [_jsx(BreadcrumbJsonLd, { items: [
                    { name: 'Home', url: '/' },
                    { name: 'About Us', url: '/about' },
                ] }), _jsx(JsonLd, { data: webPageSchema('About Us — Dream Gadgets', "India's most transparent mobile selling platform.", [
                    { name: 'Home', url: '/' },
                    { name: 'About Us', url: '/about' },
                ]) }), _jsxs("section", { className: "text-white py-20 px-4 text-center relative overflow-hidden bg-gradient-hero", children: [_jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" }), _jsx("div", { className: "absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "max-w-3xl mx-auto relative", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-extrabold mb-4", children: "About Dream Gadgets" }), _jsx("p", { className: "text-white/70 text-lg", children: "India's most transparent mobile selling platform" })] })] }), _jsxs("section", { className: "max-w-4xl mx-auto px-4 py-16 space-y-12", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-10 items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "heading-md text-surface-900 mb-4", children: "Who We Are" }), _jsx("p", { className: "text-surface-600 leading-relaxed mb-4", children: "Dream Gadgets is one of the most trusted online platforms in India for selling old mobile phones, buying refurbished mobiles, and mobile phone repairs \u2014 all in one place." }), _jsx("p", { className: "text-surface-600 leading-relaxed", children: "We offer a process that is 100% transparent, secure, and fast, enabling you to upgrade your device or earn instant cash without leaving your home." })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: [["10,000+", "Devices Sold"], ["4.8 ★", "Customer Rating"], ["5+", "City Branches"], ["2019", "Founded"]].map(([value, label]) => (_jsxs("div", { className: "card p-5 text-center hover:shadow-card-hover transition-all duration-200", children: [_jsx("p", { className: "text-2xl font-extrabold text-primary", children: value }), _jsx("p", { className: "text-xs text-surface-400 mt-1", children: label })] }, label))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "heading-md text-surface-900 mb-6", children: "Our Mission" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-5", children: [
                                    { icon: '🌍', title: 'Sustainability', desc: 'Reduce e-waste by extending the life of devices through refurbishment and resale.' },
                                    { icon: '🤝', title: 'Transparency', desc: 'No hidden charges, no surprises. What we quote is what you get.' },
                                    { icon: '⚡', title: 'Speed', desc: 'From quote to payment in under 24 hours. Your time matters.' },
                                ].map(m => (_jsxs("div", { className: "card p-6 hover:shadow-card-hover transition-all duration-200", children: [_jsx("span", { className: "text-3xl mb-3 block", children: m.icon }), _jsx("h3", { className: "font-bold text-surface-900 mb-2", children: m.title }), _jsx("p", { className: "text-sm text-surface-600 leading-relaxed", children: m.desc })] }, m.title))) })] }), _jsxs("div", { className: "rounded-3xl p-10 text-white text-center relative overflow-hidden bg-gradient-sell shadow-[0_0_24px_rgba(229,9,20,0.3)]", children: [_jsx("div", { className: "absolute -top-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative", children: [_jsx("h2", { className: "heading-md mb-3", children: "Ready to get started?" }), _jsx("p", { className: "text-white/70 mb-6 text-sm", children: "Sell your old phone or buy a certified refurbished one today." }), _jsxs("div", { className: "flex flex-wrap gap-4 justify-center", children: [_jsx(Link, { href: "/sell", className: "btn-primary btn-lg", children: "Sell Your Phone" }), _jsx(Link, { href: "/products", className: "btn-outline text-white border-white/30 hover:bg-white/10 hover:border-white/50 btn-lg", children: "Buy a Phone" })] })] })] })] }), _jsx(StaticOfferBanner, {})] }));
}
//# sourceMappingURL=page.js.map