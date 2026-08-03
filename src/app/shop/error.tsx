"use client";

export default function ShopError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="mb-3 text-xl font-semibold">Un problème est survenu</h1>
      <p className="mb-6 text-sm text-[#6C757D]">
        Impossible de charger la boutique pour l&apos;instant. Réessaie dans un
        instant.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white"
      >
        Réessayer
      </button>
    </div>
  );
}
