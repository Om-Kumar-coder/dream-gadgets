import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dream Gadgets',
    short_name: 'DreamGadgets',
    description: 'Certified used phones at the best prices',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#E50914',
    icons: [
      { src: '/logo-mark-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/logo-mark-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
