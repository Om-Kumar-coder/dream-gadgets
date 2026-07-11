import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ServiceWorkerRegister } from '@/lib/offline/ServiceWorkerRegister';
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamgadgets.in'),
    title: 'Dream Gadgets Admin',
    description: 'Internal ERP for Dream Gadgets multi-branch store management',
    icons: { icon: '/Logo_Dream_Gadgets.png', apple: '/Logo_Dream_Gadgets.png' },
    robots: { index: false, follow: false },
    other: {
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
};
export default function RootLayout({ children }) {
    return (_jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [_jsxs("head", { children: [_jsx("link", { rel: "manifest", href: "/manifest.json" }), _jsx("meta", { name: "theme-color", content: "#E50914" }), _jsx("meta", { name: "mobile-web-app-capable", content: "yes" })] }), _jsxs("body", { className: inter.className, children: [_jsx(Providers, { children: children }), _jsx(ServiceWorkerRegister, {})] })] }));
}
//# sourceMappingURL=layout.js.map