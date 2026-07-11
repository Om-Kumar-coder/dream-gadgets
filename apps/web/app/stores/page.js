import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';
export const metadata = {
    title: 'Our Stores — Dream Gadgets Kolkata',
    description: 'Visit Dream Gadgets stores in Chetla, Jadavpur, and Champahati. Buy, sell, and exchange certified used phones, laptops, and gadgets.',
    openGraph: {
        title: 'Our Stores — Dream Gadgets Kolkata',
        description: 'Visit our stores in Chetla, Jadavpur, and Champahati. Buy, sell, and exchange certified used phones.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Our Stores — Dream Gadgets Kolkata',
        description: 'Visit Dream Gadgets stores in Kolkata & South 24 Parganas.',
    },
};
const STORES = [
    {
        name: 'Dream Gadgets — Chetla (Main Branch)',
        address: '29A, Pitambar Ghatak Lane, Chetla',
        area: 'Near Chetla Police Station, Opp. CIT Market, Alipore',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700027',
        phone: '+91 82820 11193',
        whatsapp: '8282011193',
        hours: '12:30 PM – 9:30 PM',
        instagram: '@dream_gadgets_kolkata',
        emoji: '🏪',
        mapQuery: '29A Pitambar Ghatak Lane Chetla Kolkata',
    },
    {
        name: 'Dream Gadgets 2.0 — Jadavpur',
        address: '17, Sukanta Setu, Sulekha More, Jadavpur',
        area: 'Jadavpur',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700032',
        phone: '+91 90383 12344',
        whatsapp: '9038312344',
        hours: '2:00 PM – 10:00 PM',
        instagram: '@dreamgadgets_kolkata_2.0',
        emoji: '🏬',
        mapQuery: '17 Sukanta Setu Sulekha More Jadavpur Kolkata',
    },
    {
        name: 'Dream Gadgets 3.0 — Champahati',
        address: 'Champahati Station Road',
        area: 'Near Nilmanikar Vidyalaya, South 24 Parganas',
        city: 'Champahati',
        state: 'West Bengal',
        pincode: '743330',
        phone: '+91 82820 11194',
        whatsapp: '8282011194',
        hours: '12:30 PM – 9:30 PM',
        instagram: '@dreamgadgets_kolkata_3.0',
        emoji: '🏢',
        mapQuery: 'Champahati Station Road Nilmanikar Vidyalaya West Bengal',
    },
];
const STORE_SCHEMAS = STORES.map(s => ({
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: s.name,
    telephone: s.phone.replace(/\s/g, ''),
    address: {
        '@type': 'PostalAddress',
        streetAddress: s.address,
        addressLocality: s.city,
        addressRegion: s.state,
        postalCode: s.pincode,
        addressCountry: 'IN',
    },
    openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: s.hours.split('–')[0]?.trim() ?? '',
        closes: s.hours.split('–')[1]?.trim() ?? '',
    },
    url: `https://maps.google.com/?q=${encodeURIComponent(s.mapQuery)}`,
}));
export default function StoresPage() {
    return (_jsxs("main", { className: "animate-fade-in", children: [_jsx(BreadcrumbJsonLd, { items: [
                    { name: 'Home', url: '/' },
                    { name: 'Our Stores', url: '/stores' },
                ] }), _jsx(JsonLd, { data: webPageSchema('Our Stores — Dream Gadgets Kolkata', 'Visit Dream Gadgets stores in Chetla, Jadavpur, and Champahati.', [
                    { name: 'Home', url: '/' },
                    { name: 'Our Stores', url: '/stores' },
                ]) }), _jsx(JsonLd, { data: STORE_SCHEMAS }), _jsxs("section", { className: "text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero", children: [_jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative", children: [_jsx("h1", { className: "text-4xl font-extrabold mb-3", children: "Our Stores" }), _jsx("p", { className: "text-white/70", children: "Visit us at a branch near you in Kolkata & South 24 Parganas" })] })] }), _jsxs("section", { className: "max-w-5xl mx-auto px-4 py-16", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: STORES.map(s => (_jsxs("div", { className: "card p-6 hover:shadow-card-hover transition-all flex flex-col group", children: [_jsx("span", { className: "text-4xl mb-4 block", children: s.emoji }), _jsx("h2", { className: "font-bold text-surface-900 mb-1 group-hover:text-primary transition-colors", children: s.name }), _jsx("p", { className: "text-sm text-surface-500 mb-1", children: s.address }), _jsx("p", { className: "text-xs text-surface-400 mb-3", children: s.area }), _jsxs("p", { className: "text-xs text-surface-400 mb-3", children: [s.city, ", ", s.state, " \u2014 ", s.pincode] }), _jsxs("div", { className: "space-y-1.5 text-sm mb-4 flex-1", children: [_jsxs("p", { className: "flex items-center gap-2 text-surface-600", children: [_jsx("span", { children: "\uD83D\uDCDE" }), " ", s.phone] }), _jsxs("p", { className: "flex items-center gap-2 text-surface-600", children: [_jsx("span", { children: "\uD83D\uDD50" }), " ", s.hours] }), _jsxs("a", { href: `https://instagram.com/${s.instagram.replace('@', '')}`, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-pink-600 hover:underline", children: [_jsx("span", { children: "\uD83D\uDCF8" }), " ", s.instagram] }), _jsxs("a", { href: `https://wa.me/91${s.whatsapp}`, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-emerald-600 hover:underline", children: [_jsx("span", { children: "\uD83D\uDCAC" }), " WhatsApp"] })] }), _jsx("a", { href: `https://maps.google.com/?q=${encodeURIComponent(s.mapQuery)}`, target: "_blank", rel: "noopener noreferrer", className: "inline-block mt-auto text-xs text-primary font-semibold hover:underline", children: "Get Directions \u2192" })] }, s.name))) }), _jsxs("div", { className: "mt-12 card p-8 text-center bg-gradient-brand-subtle border-primary/20", children: [_jsx("h2", { className: "heading-sm text-surface-900 mb-2", children: "Can't visit a store?" }), _jsx("p", { className: "text-surface-500 text-sm mb-5", children: "No problem! We offer free doorstep pickup across Kolkata and nearby areas." }), _jsx("a", { href: "/sell", className: "btn-primary btn-lg", children: "Schedule Pickup \u2192" })] })] }), _jsx("section", { className: "bg-surface-50 border-t border-surface-100 py-12 px-4", children: _jsxs("div", { className: "max-w-3xl mx-auto text-center", children: [_jsx("h2", { className: "heading-sm text-surface-900 mb-4", children: "Common Details" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm", children: [
                                { label: '📧 Email', value: 'dreamgadgetskolkata@gmail.com', href: 'mailto:dreamgadgetskolkata@gmail.com' },
                                { label: '🌐 Website', value: 'dreamgadgets.co', href: 'https://dreamgadgets.co' },
                                { label: '📺 YouTube', value: '@dream_gadgets', href: 'https://youtube.com/@dream_gadgets' },
                                { label: '👍 Facebook', value: 'Dream Gadgets Kolkata', href: 'https://facebook.com/DreamGadgets.Kolkata' },
                            ].map((item) => (_jsxs("div", { className: "card p-4 hover:shadow-card-hover transition-all", children: [_jsx("p", { className: "font-semibold text-surface-900", children: item.label }), _jsx("a", { href: item.href, target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline text-sm", children: item.value })] }, item.label))) })] }) })] }));
}
//# sourceMappingURL=page.js.map