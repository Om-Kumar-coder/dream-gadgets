import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Dream Gadgets',
  description: 'Tips, news and tech insights from Dream Gadgets. Read about mobile technology, selling tips, device care guides, and industry updates.',
  openGraph: {
    title: 'Blog — Dream Gadgets',
    description: 'Tips, news and tech insights from Dream Gadgets. Read about mobile technology, selling tips, device care guides.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Dream Gadgets',
    description: 'Tips, news and tech insights from Dream Gadgets.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
