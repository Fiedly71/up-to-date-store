import * as Sentry from "@sentry/nextjs";

export function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error(error);
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  }
}
