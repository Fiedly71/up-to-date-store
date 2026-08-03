import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-6xl font-bold text-[#FF523B]">404</p>
      <h1 className="mb-3 text-xl font-semibold">Page introuvable</h1>
      <p className="mb-6 max-w-sm text-sm text-[#6C757D]">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
