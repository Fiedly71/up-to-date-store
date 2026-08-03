"use client";

import { useEffect, useState } from "react";
import { BalanceSettlement } from "@/components/admin/BalanceSettlement";
import { queueOfflineSale, syncQueuedSales, getQueuedSales } from "@/lib/offlineQueue";

type ProductResult = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type SaleLine = ProductResult & { quantity: number };

export function PosTerminal({ gate }: { gate: string }) {
  const [mode, setMode] = useState<"sale" | "balance">("sale");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [cart, setCart] = useState<SaleLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH_HTG" | "CASH_USD" | "MONCASH" | "STRIPE_CARD"
  >("CASH_HTG");
  const [message, setMessage] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  async function refreshPendingCount() {
    const queued = await getQueuedSales();
    setPendingCount(queued.length);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- état initial du réseau et de la file au montage
    setIsOffline(!navigator.onLine);
    refreshPendingCount();

    async function handleOnline() {
      setIsOffline(false);
      const synced = await syncQueuedSales();
      if (synced > 0) setMessage(`${synced} vente(s) hors-ligne synchronisée(s).`);
      refreshPendingCount();
    }
    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search(q: string) {
    setQuery(q);
    if (!q) return setResults([]);
    const res = await fetch(`/${gate}/api/pos/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    const mapped = (data.products ?? []).map(
      (p: { id: string; name: string; price: number; stock: number }) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
      })
    );
    setResults(mapped);

    // Un scanner de code-barres "tape" le SKU exact puis Entrée quasi
    // instantanément — dès qu'on détecte cette correspondance exacte, on
    // ajoute directement au panier sans attendre de clic, comme sur une
    // vraie caisse.
    if (data.exactSkuMatchId) {
      const match = mapped.find((p: ProductResult) => p.id === data.exactSkuMatchId);
      if (match && match.stock > 0) {
        addToCart(match);
        setQuery("");
        setResults([]);
      }
    }
  }

  function addToCart(product: ProductResult) {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function finalize(asProforma: boolean) {
    setMessage(null);
    const payload = {
      items: cart.map((c) => ({
        productId: c.id,
        quantity: c.quantity,
        unitPrice: c.price,
      })),
      customerName,
      customerEmail: customerEmail || undefined,
      paymentMethod,
      asProforma,
    };

    // Proforma non supportée hors-ligne : elle ne déduit pas le stock et
    // sert de document, moins critique en cas de coupure — on garde le
    // mode hors-ligne pour les ventes réelles uniquement.
    if (isOffline && !asProforma) {
      await queueOfflineSale(gate, `/${gate}/api/pos/sale`, payload);
      setMessage(
        "Pas de connexion — vente enregistrée localement, elle sera synchronisée automatiquement dès le retour du réseau."
      );
      setCart([]);
      setCustomerName("");
      setCustomerEmail("");
      refreshPendingCount();
      return;
    }

    let res: Response;
    try {
      res = await fetch(`/${gate}/api/pos/sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // La requête réseau a échoué (coupure soudaine non détectée par
      // l'événement "offline") — même filet de sécurité que ci-dessus.
      if (!asProforma) {
        await queueOfflineSale(gate, `/${gate}/api/pos/sale`, payload);
        setMessage(
          "Connexion perdue — vente enregistrée localement, elle sera synchronisée automatiquement."
        );
        setCart([]);
        setCustomerName("");
        setCustomerEmail("");
        refreshPendingCount();
      } else {
        setMessage("Impossible de créer la proforma sans connexion.");
      }
      return;
    }

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Erreur lors de la vente.");
      return;
    }
    setMessage(
      asProforma
        ? "Proforma créée (stock non déduit)."
        : "Facture générée, stock mis à jour."
    );
    setLastOrderId(data.order?.id ?? null);
    setCart([]);
    setCustomerName("");
    setCustomerEmail("");
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode("sale")}
          className={`rounded-lg px-3 py-1.5 text-sm ${mode === "sale" ? "bg-[#2F6F4F] text-white" : "border border-[#E9ECEF]"}`}
        >
          Nouvelle vente
        </button>
        <button
          onClick={() => setMode("balance")}
          className={`rounded-lg px-3 py-1.5 text-sm ${mode === "balance" ? "bg-[#2F6F4F] text-white" : "border border-[#E9ECEF]"}`}
        >
          Encaisser un solde
        </button>

        {(isOffline || pendingCount > 0) && (
          <span className="ml-2 flex items-center gap-1 rounded-lg bg-[#FFF1EF] px-3 py-1.5 text-xs text-[#FF523B]">
            {isOffline ? "● Hors-ligne" : "● En ligne"}
            {pendingCount > 0 && ` — ${pendingCount} vente(s) en attente de sync`}
          </span>
        )}
      </div>

      {mode === "balance" ? (
        <BalanceSettlement gate={gate} />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Rechercher par nom, référence ou scanner un code-barres..."
          className="mb-4 w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-2 gap-2">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className="admin-card p-3 text-left text-sm disabled:opacity-40"
            >
              <p className="font-medium">{p.name}</p>
              <p className="text-[#6C757D]">
                ${(p.price / 100).toFixed(2)} · stock {p.stock}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Panier de caisse</h2>

        <div className="mb-4 space-y-2">
          {cart.length === 0 && (
            <p className="text-xs text-[#6C757D]">Aucun article pour l&apos;instant.</p>
          )}
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mb-4 flex justify-between border-t border-[#E9ECEF] pt-2 text-sm font-semibold">
          <span>Total</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>

        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nom du client (optionnel)"
          className="mb-2 w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
        />

        <input
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Email du client (optionnel — associe ses points fidélité)"
          className="mb-2 w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
        />

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
          className="mb-4 w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
        >
          <option value="CASH_HTG">Cash HTG</option>
          <option value="CASH_USD">Cash USD</option>
          <option value="MONCASH">Moncash</option>
          <option value="STRIPE_CARD">Carte (POS)</option>
        </select>

        <div className="space-y-2">
          <button
            onClick={() => finalize(false)}
            disabled={cart.length === 0}
            className="w-full rounded-lg bg-[#2F6F4F] py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Générer Facture & Déduire Stock
          </button>
          <button
            onClick={() => finalize(true)}
            disabled={cart.length === 0}
            className="w-full rounded-lg border border-[#E9ECEF] py-2 text-sm font-medium disabled:opacity-40"
          >
            Créer Proforma
          </button>
        </div>

        {message && (
          <p className="mt-3 text-xs text-[#2F6F4F]">
            {message}{" "}
            {lastOrderId && (
              <a href={`/${gate}/dashboard/sales/${lastOrderId}`} className="underline">
                Voir / imprimer le reçu
              </a>
            )}
          </p>
        )}
      </div>
        </div>
      )}
    </div>
  );
}
