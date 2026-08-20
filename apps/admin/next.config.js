const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  transpilePackages: ['@dream-gadgets/ui', '@dream-gadgets/shared-types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.dreamgadgets.in' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT ?? 'dream-gadgets-admin',
  silent: !process.env.CI,
  disableLogger: true,
  hideSourceMaps: true,
});
