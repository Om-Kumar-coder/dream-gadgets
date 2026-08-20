import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Environment
  environment: process.env.NODE_ENV ?? 'development',

  // Don't send PII
  sendDefaultPii: false,

  // Replay session sample rate (lower = fewer replays)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.5,
});
