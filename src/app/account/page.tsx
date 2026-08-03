"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { POINTS_TO_DOLLAR_RATE } from "@/lib/loyalty";

type CustomerData = {
  name: string;
  email: string;
  phone: string | null;
  loyaltyPoints: number;
  referralCode: string;
  orders: { id: string; status: string; total: number; createdAt: string; items: { name: string; quantity: number }[] }[];
  loyaltyLedger: { id: string; points: number; reason: string; createdAt: string }[];
};

const statusLabels: Record<string, string> = {
  DRAFT: "En attente de paiement",
  RESERVED: "En attente de paiement",
  PROFORMA: "Devis / proforma",
  PAID: "Payée",
  PARTIALLY_PAID: "Acompte reçu",
  CANCELLED: "Annulée",
  EXPIRED: "Expirée",
};

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/customer/me")
      .then((res) => {
        if (res.status === 401) {
          router.push("/account/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setCustomer(data.customer);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/customer/logout", { method: "POST" });
    router.push("/");
  }

  function copyReferralLink() {
    if (!customer) return;
    const link = `${window.location.origin}/account/register?ref=${customer.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="mx-auto flex-1 max-w-3xl px-4 py-16">
          <p className="text-sm text-[#6C757D]">Chargement...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!customer) return null;

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-3xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Bonjour, {customer.name}</h1>
            <p className="text-sm text-[#6C757D]">{customer.email}</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-[#6C757D] underline">
            Se déconnecter
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-6">
            <p className="mb-1 text-sm text-[#6C757D]">Points de fidélité</p>
            <p className="text-2xl font-semibold text-[#FF523B]">{customer.loyaltyPoints}</p>
            <p className="mt-1 text-xs text-[#6C757D]">
              Utilisables au panier — {POINTS_TO_DOLLAR_RATE} points = $1 de réduction.
            </p>
          </div>
          <div className="rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-6">
            <p className="mb-1 text-sm text-[#6C757D]">Ton code de parrainage</p>
            <p className="mb-2 text-lg font-semibold">{customer.referralCode}</p>
            <button onClick={copyReferralLink} className="text-xs text-[#FF523B] underline">
              {copied ? "Lien copié !" : "Copier le lien à partager"}
            </button>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold">Mes commandes</h2>
        {customer.orders.length === 0 ? (
          <p className="mb-8 text-sm text-[#6C757D]">Aucune commande pour l&apos;instant.</p>
        ) : (
          <div className="mb-8 space-y-3">
            {customer.orders.map((o) => (
              <div key={o.id} className="rounded-xl border border-[#E9ECEF] p-4 text-sm">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">#{o.id.slice(-8).toUpperCase()}</span>
                  <span className="text-[#6C757D]">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <p className="mb-1 text-[#FF523B]">{statusLabels[o.status] ?? o.status}</p>
                <p className="text-[#6C757D]">
                  {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                </p>
                <p className="mt-1 font-semibold">${(o.total / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        <h2 className="mb-4 text-lg font-semibold">Historique des points</h2>
        {customer.loyaltyLedger.length === 0 ? (
          <p className="text-sm text-[#6C757D]">Aucun mouvement de points pour l&apos;instant.</p>
        ) : (
          <div className="space-y-2">
            {customer.loyaltyLedger.map((entry) => (
              <div key={entry.id} className="flex justify-between text-sm">
                <span className="text-[#6C757D]">{entry.reason}</span>
                <span className={entry.points > 0 ? "text-[#2F6F4F]" : "text-red-600"}>
                  {entry.points > 0 ? "+" : ""}{entry.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
