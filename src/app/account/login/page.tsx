"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/customer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email")),
        password: String(form.get("password")),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur de connexion.");
      return;
    }
    router.push("/account");
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-md px-4 py-16">
        <h1 className="mb-8 text-2xl font-semibold">Se connecter</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="login-email" name="email" type="email" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium">Mot de passe</label>
            <input id="login-password" name="password" type="password" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6C757D]">
          Pas encore de compte ? <Link href="/account/register" className="text-[#FF523B]">Créer un compte</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
