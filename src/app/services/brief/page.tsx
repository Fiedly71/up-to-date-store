"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Honeypot } from "@/components/public/Honeypot";

export default function BriefPage() {
  return (
    <Suspense fallback={null}>
      <BriefForm />
    </Suspense>
  );
}

function BriefForm() {
  const searchParams = useSearchParams();
  const pack = searchParams.get("pack") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      packSlug: pack,
      fullName: String(form.get("fullName") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      brief: String(form.get("brief") ?? ""),
      website: String(form.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/submit-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erreur");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-xl px-4 py-16">
        <h1 className="mb-2 text-2xl font-semibold">Cahier des charges</h1>
        <p className="mb-8 text-sm text-[#6C757D]">
          Ces informations nous permettent de bien cadrer ton projet avant le
          paiement.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Honeypot />
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium">Nom complet</label>
            <input id="fullName" name="fullName" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium">WhatsApp</label>
            <input id="whatsapp" name="whatsapp" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="brief-email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="brief-email" name="email" type="email" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="company" className="mb-1 block text-sm font-medium">Entreprise (optionnel)</label>
            <input id="company" name="company" className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="brief" className="mb-1 block text-sm font-medium">Décris ton projet</label>
            <textarea id="brief" name="brief" required rows={5} className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Redirection vers le paiement..." : "Continuer vers le paiement"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
