import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture automatiquement les erreurs non gérées survenant dans les
// Server Components, Route Handlers, etc. No-op silencieux si Sentry
// n'a jamais été initialisé (pas de DSN configuré).
export const onRequestError = Sentry.captureRequestError;
