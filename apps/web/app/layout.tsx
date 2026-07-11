import type { Metadata } from 'next';
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

export const metadata: Metadata = {
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
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-surface-100 shadow-sm">
      <div className="bg-surface-950 text-white/80 text-xs py-1.5 px-4 text-center hidden md:block">
        🚀 Free doorstep pickup across India &nbsp;·&nbsp; Instant payment within 24 hours
      </div>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4" />
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${openSans.variable} ${anton.variable} pb-16 md:pb-0`}>
        <JsonLd data={[organizationSchema(), webSiteSchema(), localBusinessSchema()]} />
        <Providers>
          <ProgressBar />
          <AnnouncementBar />
          <Suspense fallback={<HeaderFallback />}>
            <Header />
          </Suspense>
          {children}
          <Footer />
          <WhatsAppButton />
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
