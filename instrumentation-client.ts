import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Les DSN Sentry ne sont pas des secrets (ils identifient juste le
  // projet), donc pas de souci à les exposer côté client via NEXT_PUBLIC_.
});
