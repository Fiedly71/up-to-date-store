"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Honeypot } from "@/components/public/Honeypot";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/customer/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        phone: String(form.get("phone") ?? ""),
        referralCode: String(form.get("referralCode") ?? ""),
        website: String(form.get("website") ?? ""),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    router.push("/account");
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-md px-4 py-16">
        <h1 className="mb-2 text-2xl font-semibold">Créer mon compte</h1>
        <p className="mb-8 text-sm text-[#6C757D]">
          Suis tes commandes, gagne des points de fidélité, et profite de ton
          code de parrainage.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Honeypot />
          <div>
            <label htmlFor="reg-name" className="mb-1 block text-sm font-medium">Nom complet</label>
            <input id="reg-name" name="name" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="reg-email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="reg-email" name="email" type="email" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="reg-password" className="mb-1 block text-sm font-medium">Mot de passe</label>
            <input id="reg-password" name="password" type="password" minLength={8} required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="reg-phone" className="mb-1 block text-sm font-medium">Téléphone (optionnel)</label>
            <input id="reg-phone" name="phone" className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="reg-referral" className="mb-1 block text-sm font-medium">
              Code de parrainage (optionnel)
            </label>
            <input
              id="reg-referral"
              name="referralCode"
              defaultValue={searchParams.get("ref") ?? ""}
              placeholder="Ex. MARIE-4F2A"
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6C757D]">
          Déjà un compte ? <Link href="/account/login" className="text-[#FF523B]">Se connecter</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
