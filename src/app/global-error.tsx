"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-3 text-xl font-semibold">Une erreur inattendue est survenue</h1>
        <p className="mb-6 max-w-sm text-sm text-[#6C757D]">
          Recharge la page, ou reviens un peu plus tard. Le problème a été
          enregistré automatiquement.
        </p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error remplace le layout racine, next/link n'y est pas fiable (recommandation officielle Next.js) */}
        <a
          href="/"
          className="rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white"
        >
          Retour à l&apos;accueil
        </a>
      </body>
    </html>
  );
}
