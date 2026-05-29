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
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/Logo_Dream_Gadgets.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
