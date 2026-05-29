import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { Providers } from './providers';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Dream Gadgets', template: '%s | Dream Gadgets' },
  description: 'Certified used phones at the best prices.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', shortcut: '/icon.svg', apple: '/Logo_Dream_Gadgets.png' },
};

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="bg-gray-900 text-gray-100 text-xs py-1.5 px-4 text-center hidden md:block">
        🚀 Free doorstep pickup across India &nbsp;·&nbsp; Instant payment within 24 hours
      </div>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4" />
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} pb-16 md:pb-0`}>
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
