"use client";

import { useState } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

type TrackedOrder = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
};

export default function OrderTrackingPage() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/track-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: String(form.get("orderId")),
        email: String(form.get("email")),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur.");
      return;
    }
    setOrder(data.order);
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-xl px-4 py-16">
        <h1 className="mb-2 text-2xl font-semibold">Suivi de commande</h1>
        <p className="mb-8 text-sm text-[#6C757D]">
          Entre le numéro de commande (visible sur ton reçu ou email de
          confirmation) et l&apos;email utilisé lors de l&apos;achat.
        </p>

        <form onSubmit={handleSubmit} className="mb-8 space-y-3">
          <input
            name="orderId"
            placeholder="Numéro de commande (ex. A1B2C3D4)"
            required
            className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            placeholder="Email utilisé pour la commande"
            required
            className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Recherche..." : "Suivre ma commande"}
          </button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {order && (
          <div className="rounded-xl border border-[#E9ECEF] p-6">
            <p className="mb-2 text-sm text-[#6C757D]">
              Commande #{order.id.slice(-8).toUpperCase()} —{" "}
              {new Date(order.createdAt).toLocaleDateString("fr-FR")}
            </p>
            <p className="mb-4 text-sm font-semibold text-[#FF523B]">{order.status}</p>
            <ul className="mb-4 space-y-1 text-sm">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold">Total : ${(order.total / 100).toFixed(2)}</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
