import type { Metadata } from 'next';
import { Inter, Open_Sans, Anton } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { Providers } from './providers';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';

const inter = Inter({ subsets: ['latin'] });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' });

export const metadata: Metadata = {
  title: { default: 'Dream Gadgets', template: '%s | Dream Gadgets' },
  description: 'Certified used phones at the best prices.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', shortcut: '/icon.svg', apple: '/Logo_Dream_Gadgets.png' },
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
        <Providers>
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
