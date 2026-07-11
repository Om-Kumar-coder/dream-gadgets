import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Inter, Open_Sans, Anton } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { Providers } from './providers';
import { AnnouncementBar } from '../components/layout/AnnouncementBar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { ProgressBar } from '../components/ui/ProgressBar';
import { JsonLd } from '../components/seo/JsonLd';
import { organizationSchema, localBusinessSchema, webSiteSchema } from '../lib/seo/schemas';
const inter = Inter({ subsets: ['latin'] });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' });
export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamgadgets.in'),
    title: { default: 'Dream Gadgets', template: '%s | Dream Gadgets' },
    description: 'Certified used phones at the best prices. Buy & sell pre-owned smartphones with warranty, free delivery, and instant payment.',
    manifest: '/manifest.json',
    icons: { icon: '/favicon.ico', shortcut: '/icon.svg', apple: '/Logo_Dream_Gadgets.png' },
    robots: { index: true, follow: true },
    openGraph: {
        title: 'Dream Gadgets — Buy & Sell Certified Used Phones',
        description: "India's most transparent mobile selling platform. Highest price, doorstep pickup, instant payment.",
        siteName: 'Dream Gadgets',
        type: 'website',
        locale: 'en_IN',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Dream Gadgets — Buy & Sell Certified Used Phones',
        description: "India's most transparent mobile selling platform.",
    },
};
function HeaderFallback() {
    return (_jsxs("header", { className: "sticky top-0 z-50 bg-white border-b border-surface-100 shadow-sm", children: [_jsx("div", { className: "bg-surface-950 text-white/80 text-xs py-1.5 px-4 text-center hidden md:block", children: "\uD83D\uDE80 Free doorstep pickup across India \u00A0\u00B7\u00A0 Instant payment within 24 hours" }), _jsx("div", { className: "max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4" })] }));
}
export default function RootLayout({ children }) {
    return (_jsx("html", { lang: "en", suppressHydrationWarning: true, children: _jsxs("body", { className: `${inter.className} ${openSans.variable} ${anton.variable} pb-16 md:pb-0`, children: [_jsx(JsonLd, { data: [organizationSchema(), webSiteSchema(), localBusinessSchema()] }), _jsxs(Providers, { children: [_jsx(ProgressBar, {}), _jsx(AnnouncementBar, {}), _jsx(Suspense, { fallback: _jsx(HeaderFallback, {}), children: _jsx(Header, {}) }), children, _jsx(Footer, {}), _jsx(WhatsAppButton, {}), _jsx(Suspense, { fallback: null, children: _jsx(MobileBottomNav, {}) })] })] }) }));
}
//# sourceMappingURL=layout.js.map