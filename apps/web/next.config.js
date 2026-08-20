const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dream-gadgets/ui', '@dream-gadgets/shared-types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.dreamgadgets.in' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'fdn2.gsmarena.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  },
};

// Wrap with Sentry — handles source maps upload + tunneling in production
module.exports = withSentryConfig(nextConfig, {
  // Org/project values from sentry.io (used during `npx @sentry/wizard`)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT ?? 'dream-gadgets-web',

  // Only upload source maps in production CI builds
  silent: !process.env.CI,

  // Automatically tree-shake Sentry logger to reduce bundle size
  disableLogger: true,

  // Upload source maps even in development for better stack traces
  hideSourceMaps: true,
});
