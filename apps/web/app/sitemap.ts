import type { MetadataRoute } from 'next';
import { BRANDS } from '../lib/brands';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dreamgadgets.in';
  const now = new Date();

  const staticPages: Array<{ path: string; changeFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly'; priority: number }> = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/products', changeFrequency: 'hourly', priority: 0.9 },
    { path: '/deals', changeFrequency: 'daily', priority: 0.8 },
    { path: '/sell', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/buyback', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/offers', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/stores', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/partner', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/privacy', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/shipping', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/returns', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/cancellation', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/warranty', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/cookies', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/login', changeFrequency: 'monthly', priority: 0.2 },
    { path: '/register', changeFrequency: 'monthly', priority: 0.2 },
    { path: '/reset-password', changeFrequency: 'monthly', priority: 0.1 },
  ];

  const brandSlugs = BRANDS.map(b => b.name.toLowerCase());
  const storeSlugs = ['main', 'chetla', 'jadavpur', 'champahati', 'barrack', 'salt_lake', 'howrah'];
  const blogSlugs = [
    'samsung-galaxy-m53-5g-launch',
    'future-of-mobile-technology',
    'contribute-used-mobiles-school-children',
    'clear-app-data-cache-android',
    'make-android-run-faster',
    'iphone-battery-health-tips',
    'best-refurbished-phones-2025',
    'sell-phone-safely-guide',
    'refurbished-vs-new-phone',
    '5g-india-2025',
    'phone-trade-in-tips',
    'reduce-e-waste-home',
  ];

  return [
    ...staticPages.map(p => ({
      url: `${baseUrl}${p.path}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...brandSlugs.map(slug => ({
      url: `${baseUrl}/brands/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...storeSlugs.map(slug => ({
      url: `${baseUrl}/stores/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...blogSlugs.map(slug => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
