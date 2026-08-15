import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dreamgadgets.in';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/account/', '/admin', '/cart', '/checkout', '/orders', '/wishlist', '/track-order'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
