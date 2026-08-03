import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Silencieux si pas de DSN : Sentry.init sans dsn valide ne fait rien,
  // aucune erreur n'est levée et aucune donnée n'est envoyée nulle part.
});
