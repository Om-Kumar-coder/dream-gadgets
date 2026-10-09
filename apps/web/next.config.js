const { withSentryConfig } = require('@sentry/nextjs');

// Uploaded product/banner images are served by the API at <API_BASE>/uploads.
// Resolve that host so next/image can load them (dev localhost + prod domain).
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
let apiImagePattern = null;
try {
  const u = new URL(apiUrl);
  // Uploaded images resolve to `${API_BASE}/uploads/...` (e.g. `/api/v1/uploads/...`),
  // so the allowed pathname must include the API's own base path — a bare
  // `/uploads/**` pattern would fail to match and next/image would refuse to load them.
  const apiBasePath = u.pathname.replace(/\/$/, '');
  apiImagePattern = {
    protocol: u.protocol.replace(':', ''),
    hostname: u.hostname,
    ...(u.port ? { port: u.port } : {}),
    pathname: `${apiBasePath}/uploads/**`,
  };
} catch {
  // Malformed API URL — fall back to the static patterns below.
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dream-gadgets/ui', '@dream-gadgets/shared-types'],
  images: {
    remotePatterns: [
      ...(apiImagePattern ? [apiImagePattern] : []),
      { protocol: 'https', hostname: 'dreamgadgets.in' },
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
