import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SellWizard } from '../../components/sell/SellWizard';
import { ScrollReveal } from '../../components/ui/ScrollReveal';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';
import { StaticOfferBanner, StaticMidBanner } from '../../components/banner/StaticPageBanners';
export const metadata = {
    title: 'Sell Your Phone — Dream Gadgets',
    description: 'Get the best price for your old phone. Free doorstep pickup, instant payment via bank transfer or UPI. Sell in 60 seconds.',
    openGraph: {
        title: 'Sell Your Phone — Dream Gadgets',
        description: 'Get the best price for your old phone. Free doorstep pickup, instant payment. Sell in 60 seconds.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sell Your Phone — Dream Gadgets',
        description: 'Get the best price for your old phone. Doorstep pickup, instant payment.',
    },
};
const HOW_IT_WORKS = [
    { step: '01', icon: '💰', title: 'Get Instant Quote', desc: 'Select your device and condition to get the best price instantly.' },
    { step: '02', icon: '📅', title: 'Schedule Pickup', desc: 'Choose a convenient time. Our agent comes to your doorstep.' },
    { step: '03', icon: '🔍', title: 'Device Inspection', desc: 'Quick on-spot inspection to verify the condition.' },
    { step: '04', icon: '⚡', title: 'Instant Payment', desc: 'Get paid instantly via bank transfer or UPI.' },
];
const BENEFITS = [
    { icon: '💰', title: 'Best Price Assured', desc: 'We offer the highest market price for your device, guaranteed.' },
    { icon: '🚚', title: 'Free Doorstep Pickup', desc: 'Free pickup from your home or office anywhere in India.' },
    { icon: '⚡', title: 'Instant Payment', desc: 'Get paid via bank transfer or UPI within minutes of inspection.' },
    { icon: '🛡️', title: 'Secure Data Wipe', desc: 'Complete data erasure before your device is processed.' },
    { icon: '⭐', title: '1M+ Happy Customers', desc: 'Trusted by millions across India for selling their devices.' },
    { icon: '📞', title: 'Dedicated Support', desc: 'Our team is available 7 days a week to assist you.' },
];
export default function SellPage() {
    return (_jsxs("main", { children: [_jsx(BreadcrumbJsonLd, { items: [
                    { name: 'Home', url: '/' },
                    { name: 'Sell Your Phone', url: '/sell' },
                ] }), _jsx(JsonLd, { data: webPageSchema('Sell Your Phone — Dream Gadgets', 'Get the best price for your old phone. Doorstep pickup, instant payment.', [
                    { name: 'Home', url: '/' },
                    { name: 'Sell Your Phone', url: '/sell' },
                ]) }), _jsxs("section", { className: "relative overflow-hidden bg-gradient-to-br from-surface-950 via-surface-900 to-primary/20 py-20 md:py-24 px-4 text-center", children: [_jsx("div", { className: "absolute inset-0 noise-bg" }), _jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" }), _jsx("div", { className: "absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" }), _jsxs("div", { className: "relative z-10 max-w-3xl mx-auto", children: [_jsxs("span", { className: "inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/10", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-soft" }), "Sell in 60 Seconds"] }), _jsxs("h1", { className: "text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4", children: ["Sell Your Old Phone", _jsx("br", {}), _jsx("span", { className: "text-gradient-brand", children: "Get Best Price Today!" })] }), _jsx("p", { className: "text-white/60 text-base md:text-lg mb-6 max-w-xl mx-auto", children: "Highest price guaranteed \u00B7 Free doorstep pickup \u00B7 Instant payment" }), _jsxs("div", { className: "flex items-center justify-center gap-6 md:gap-10 text-xs text-white/50", children: [_jsx("span", { className: "flex items-center gap-1.5", children: "\u2B50 4.8 Rating" }), _jsx("span", { className: "w-1 h-1 rounded-full bg-white/20" }), _jsx("span", { className: "flex items-center gap-1.5", children: "\uD83C\uDFC6 1M+ Customers" }), _jsx("span", { className: "w-1 h-1 rounded-full bg-white/20" }), _jsx("span", { className: "flex items-center gap-1.5", children: "\uD83D\uDCCD Pan India" })] })] })] }), _jsx("section", { className: "container-narrow -mt-8 relative z-10 pb-16 md:pb-20", children: _jsx(SellWizard, {}) }), _jsx("section", { className: "bg-surface-50 border-y border-surface-100", children: _jsx("div", { className: "container-narrow py-6", children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center", children: [
                            { v: '10,000+', l: 'Phones Sold' },
                            { v: '4.8 ★', l: 'Customer Rating' },
                            { v: '50+', l: 'Cities Covered' },
                            { v: '100%', l: 'Secure Payments' },
                        ].map(s => (_jsxs("div", { children: [_jsx("p", { className: "text-2xl md:text-3xl font-extrabold text-primary", children: s.v }), _jsx("p", { className: "text-xs text-surface-500 mt-0.5 font-medium", children: s.l })] }, s.l))) }) }) }), _jsxs("section", { className: "section-pad container-page", children: [_jsx(ScrollReveal, { children: _jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "section-title", children: "How It Works" }), _jsx("p", { className: "section-subtitle mx-auto", children: "Sell your phone in 4 simple steps" })] }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: HOW_IT_WORKS.map((s, i) => (_jsx(ScrollReveal, { delay: i * 100, children: _jsxs("div", { className: "how-it-works-step bg-white border border-surface-100 hover:shadow-elevation-3 hover:-translate-y-1.5 transition-all duration-300", children: [_jsx("div", { className: "how-it-works-icon bg-primary/10 text-primary", children: _jsx("span", { className: "text-2xl", children: s.icon }) }), _jsxs("span", { className: "text-xs font-bold text-primary tracking-widest", children: ["STEP ", s.step] }), _jsx("h3", { className: "font-bold text-surface-900", children: s.title }), _jsx("p", { className: "text-xs text-surface-500 leading-relaxed", children: s.desc })] }) }, s.step))) })] }), _jsx("section", { className: "bg-surface-50 section-pad", children: _jsxs("div", { className: "container-narrow", children: [_jsx(ScrollReveal, { children: _jsx("h2", { className: "section-title text-center mb-10", children: "Why Sell with Dream Gadgets?" }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: BENEFITS.map((b, i) => (_jsx(ScrollReveal, { delay: i * 80, slideLeft: i % 2 === 0, slideRight: i % 2 === 1, children: _jsxs("div", { className: "card-hover flex gap-4 p-5", children: [_jsx("span", { className: "text-2xl shrink-0 mt-0.5", children: b.icon }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-surface-900 mb-1 text-sm", children: b.title }), _jsx("p", { className: "text-sm text-surface-500", children: b.desc })] })] }) }, b.title))) })] }) }), _jsx(StaticMidBanner, {}), _jsxs("section", { className: "section-pad container-narrow", children: [_jsx("h2", { className: "section-title text-center mb-8", children: "Frequently Asked Questions" }), _jsx("div", { className: "space-y-3", children: [
                            { q: 'How is the price calculated?', a: 'We analyze current market data, device condition, and recent sales to give you the best possible price.' },
                            { q: 'How long does the process take?', a: 'From quote to payment, the entire process takes less than 24 hours. Same-day pickup available in select cities.' },
                            { q: 'What documents are required?', a: 'A valid government ID (Aadhaar, PAN, or Driving License) and the original invoice (if available).' },
                            { q: 'What if I change my mind?', a: 'You can cancel anytime before inspection. No questions asked.' },
                        ].map(faq => (_jsxs("details", { className: "group bg-white border border-surface-100 rounded-2xl overflow-hidden hover:border-surface-200 transition-colors", children: [_jsxs("summary", { className: "flex items-center justify-between p-4 cursor-pointer text-sm font-semibold text-surface-900 hover:bg-surface-50 transition-colors", children: [faq.q, _jsx("svg", { className: "w-4 h-4 text-surface-400 group-open:rotate-180 transition-transform shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), _jsx("p", { className: "px-4 pb-4 text-sm text-surface-500", children: faq.a })] }, faq.q))) })] }), _jsx("section", { className: "bg-surface-50 section-pad-sm", children: _jsxs("div", { className: "container-narrow text-center", children: [_jsx("p", { className: "text-xs text-surface-400 font-bold uppercase tracking-wider mb-5", children: "We Accept All Major Brands" }), _jsx("div", { className: "flex flex-wrap justify-center gap-2.5", children: ['Apple', 'Samsung', 'OnePlus', 'Oppo', 'Vivo', 'Xiaomi', 'Realme', 'Motorola', 'Google', 'Nokia', 'Nothing', 'Asus', 'LG', 'Sony'].map(b => (_jsx("span", { className: "text-sm text-surface-600 bg-white border border-surface-200 px-4 py-2 rounded-full font-medium hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all cursor-default", children: b }, b))) })] }) }), _jsx(StaticOfferBanner, {})] }));
}
//# sourceMappingURL=page.js.map