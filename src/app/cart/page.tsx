"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { useCart } from "@/components/public/CartContext";
import { PriceTag } from "@/components/public/PriceTag";
import { shippingZones } from "@/lib/shipping";
import { POINTS_TO_DOLLAR_RATE } from "@/lib/loyalty";

type PaymentPlan = "FULL" | "DEPOSIT_50" | "INSTALLMENT_3";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total: subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("FULL");
  const [email, setEmail] = useState("");
  const [zoneSlug, setZoneSlug] = useState(shippingZones[0].slug);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<{ discount: number } | { error: string } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [customerPoints, setCustomerPoints] = useState<number | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);

  useEffect(() => {
    fetch("/api/customer/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.customer) setCustomerPoints(data.customer.loyaltyPoints);
      });
  }, []);

  const shippingFee = shippingZones.find((z) => z.slug === zoneSlug)?.fee ?? 0;
  const promoDiscount = promoStatus && "discount" in promoStatus ? promoStatus.discount : 0;
  const pointsDiscount = Math.floor((pointsToUse / POINTS_TO_DOLLAR_RATE) * 100);
  const discount = promoDiscount + pointsDiscount;
  const total = Math.max(0, subtotal - discount) + shippingFee;

  const amountDueNow =
    paymentPlan === "DEPOSIT_50"
      ? Math.round(Math.max(0, subtotal - discount) / 2) + shippingFee
      : paymentPlan === "INSTALLMENT_3"
      ? Math.floor(total / 3)
      : total;

  async function checkPromo() {
    if (!promoCode.trim()) return;
    setCheckingPromo(true);
    const res = await fetch("/api/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode, subtotal }),
    });
    const data = await res.json();
    setPromoStatus(res.ok ? { discount: data.discount } : { error: data.error });
    setCheckingPromo(false);
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentPlan,
          shippingZone: zoneSlug,
          email: email || undefined,
          promoCode: promoStatus && "discount" in promoStatus ? promoCode : undefined,
          usePoints: pointsToUse || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erreur checkout");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-3xl px-4 py-16">
        <h1 className="mb-8 text-2xl font-semibold">Votre panier</h1>

        {items.length === 0 ? (
          <p className="text-sm text-[#6C757D]">Ton panier est vide pour l&apos;instant.</p>
        ) : (
          <>
            <div className="mb-8 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId ?? ""}`}
                  className="flex items-center gap-4 rounded-xl border border-[#E9ECEF] p-4"
                >
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-[#F8F9FA]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.variantName && (
                      <p className="text-xs text-[#6C757D]">{item.variantName}</p>
                    )}
                    <PriceTag cents={item.unitPrice} size="sm" />
                  </div>
                  <input
                    type="number"
                    min={1}
                    aria-label={`Quantité pour ${item.name}`}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.productId, item.variantId, Number(e.target.value))
                    }
                    className="w-16 rounded-lg border border-[#E9ECEF] px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-xs text-[#6C757D] underline"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            <div className="mb-6 rounded-xl border border-[#E9ECEF] p-4">
              <label htmlFor="shipping-zone" className="mb-3 block text-sm font-medium">Livraison</label>
              <select
                id="shipping-zone"
                value={zoneSlug}
                onChange={(e) => setZoneSlug(e.target.value)}
                className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
              >
                {shippingZones.map((z) => (
                  <option key={z.slug} value={z.slug}>
                    {z.label} {z.fee > 0 ? `— $${(z.fee / 100).toFixed(2)}` : "— gratuit"}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6 rounded-xl border border-[#E9ECEF] p-4">
              <label htmlFor="promo-code" className="mb-3 block text-sm font-medium">Code promo</label>
              <div className="flex gap-2">
                <input
                  id="promo-code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Ex. BIENVENUE10"
                  className="flex-1 rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
                />
                <button
                  onClick={checkPromo}
                  disabled={checkingPromo}
                  className="rounded-lg border border-[#E9ECEF] px-4 py-2 text-sm font-medium"
                >
                  Appliquer
                </button>
              </div>
              {promoStatus && "error" in promoStatus && (
                <p className="mt-2 text-xs text-red-600">{promoStatus.error}</p>
              )}
              {promoStatus && "discount" in promoStatus && (
                <p className="mt-2 text-xs text-[#2F6F4F]">
                  Code appliqué : -${(promoStatus.discount / 100).toFixed(2)}
                </p>
              )}
            </div>

            {customerPoints !== null && customerPoints > 0 && (
              <div className="mb-6 rounded-xl border border-[#E9ECEF] p-4">
                <label htmlFor="points-to-use" className="mb-1 block text-sm font-medium">
                  Utiliser mes points de fidélité
                </label>
                <p className="mb-3 text-xs text-[#6C757D]">
                  Tu as {customerPoints} points ({POINTS_TO_DOLLAR_RATE} points = $1).
                </p>
                <input
                  id="points-to-use"
                  type="number"
                  min={0}
                  max={customerPoints}
                  step={POINTS_TO_DOLLAR_RATE}
                  value={pointsToUse}
                  onChange={(e) =>
                    setPointsToUse(Math.max(0, Math.min(customerPoints, Number(e.target.value))))
                  }
                  className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
                />
                {pointsToUse > 0 && (
                  <p className="mt-2 text-xs text-[#2F6F4F]">
                    Réduction : -${(pointsDiscount / 100).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="mb-6 space-y-1 border-t border-[#E9ECEF] pt-4 text-sm">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>${(subtotal / 100).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#2F6F4F]">
                  <span>Réduction</span>
                  <span>-${(discount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{shippingFee > 0 ? `$${(shippingFee / 100).toFixed(2)}` : "Gratuit"}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-semibold">
                <span>Total</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-[#E9ECEF] p-4">
              <label htmlFor="cart-email" className="mb-1 block text-sm font-medium">Email (optionnel)</label>
              <p className="mb-3 text-xs text-[#6C757D]">
                Pour recevoir ta confirmation et, si tu quittes la page avant
                de payer, un rappel de ton panier.
              </p>
              <input
                id="cart-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
              />
            </div>

            <div className="mb-6 rounded-xl border border-[#E9ECEF] p-4">
              <p className="mb-3 text-sm font-medium">Mode de paiement</p>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentPlan"
                    checked={paymentPlan === "FULL"}
                    onChange={() => setPaymentPlan("FULL")}
                  />
                  Paiement complet aujourd&apos;hui
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentPlan"
                    checked={paymentPlan === "DEPOSIT_50"}
                    onChange={() => setPaymentPlan("DEPOSIT_50")}
                  />
                  Acompte de 50% aujourd&apos;hui, le reste à la livraison
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentPlan"
                    checked={paymentPlan === "INSTALLMENT_3"}
                    onChange={() => setPaymentPlan("INSTALLMENT_3")}
                  />
                  Paiement en 3 fois sans frais (1/3 aujourd&apos;hui, le reste tous les 30 jours)
                </label>
              </div>
              {paymentPlan === "DEPOSIT_50" && (
                <p className="mt-3 text-xs text-[#6C757D]">
                  À payer maintenant : <strong>${(amountDueNow / 100).toFixed(2)}</strong> (frais
                  de livraison inclus). Le solde sera à régler à la livraison (cash, Moncash ou
                  carte).
                </p>
              )}
              {paymentPlan === "INSTALLMENT_3" && (
                <p className="mt-3 text-xs text-[#6C757D]">
                  À payer maintenant : <strong>${(amountDueNow / 100).toFixed(2)}</strong>. Les 2
                  mensualités suivantes seront à régler au comptoir (cash, Moncash ou carte), tous
                  les 30 jours.
                </p>
              )}
            </div>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading
                ? "Redirection vers le paiement..."
                : `Payer ${(amountDueNow / 100).toFixed(2)}$ avec Stripe`}
            </button>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
