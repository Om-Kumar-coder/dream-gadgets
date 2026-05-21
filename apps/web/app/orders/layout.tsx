import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders — Dream Gadgets',
  description: 'View your order history, track shipments, and manage returns for your Dream Gadgets purchases.',
  openGraph: {
    title: 'My Orders — Dream Gadgets',
    description: 'Track and manage your Dream Gadgets orders.',
  },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
