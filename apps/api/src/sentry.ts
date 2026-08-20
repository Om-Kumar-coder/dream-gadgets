import * as Sentry from '@sentry/nestjs';

/**
 * Initialize Sentry for the NestJS API.
 * Call this BEFORE NestFactory.create() so all NestJS errors are captured.
 * Safe to call in development — Sentry just won't send if DSN is empty.
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    // Sentry not configured — skip silently (dev / local environment)
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    // Don't send PII (phone numbers, emails) to Sentry
    beforeSend(event) {
      if (event.request?.data) {
        // Scrub common PII fields from request bodies
        const scrubbed: Record<string, unknown> = { ...(event.request.data as Record<string, unknown>) };
        for (const key of ['password', 'otp', 'phone', 'email', 'passwordHash']) {
          if (key in scrubbed) scrubbed[key] = '[Filtered]';
        }
        event.request.data = scrubbed as any;
      }
      return event;
    },
  });
}
