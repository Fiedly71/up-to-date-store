"use client";

import { useState } from "react";

type Installment = { id: string; index: number; amount: number; dueDate: string };

type BalanceOrder = {
  id: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  customerName: string | null;
  paymentPlan: "FULL" | "DEPOSIT_50" | "INSTALLMENT_3";
  pendingInstallments: Installment[];
  items: { name: string; quantity: number }[];
};

export function BalanceSettlement({ gate }: { gate: string }) {
  const [shortId, setShortId] = useState("");
  const [order, setOrder] = useState<BalanceOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH_HTG" | "CASH_USD" | "MONCASH" | "STRIPE_CARD"
  >("CASH_HTG");
  const [message, setMessage] = useState<string | null>(null);

  async function search() {
    setMessage(null);
    setOrder(null);
    const res = await fetch(`/${gate}/api/pos/balance?shortId=${encodeURIComponent(shortId)}`);
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Erreur.");
      return;
    }
    setOrder(data.order);
  }

  async function settle(installmentId?: string) {
    if (!order) return;
    const res = await fetch(`/${gate}/api/pos/balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, paymentMethod, installmentId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Erreur lors de l'encaissement.");
      return;
    }
    setMessage(installmentId ? "Mensualité encaissée !" : "Solde encaissé, commande soldée !");
    setOrder(null);
    setShortId("");
  }

  return (
    <div className="admin-card p-6">
      <h2 className="mb-1 text-sm font-semibold">Encaisser un solde (acompte ou paiement en 3x)</h2>
      <p className="mb-4 text-xs text-[#6C757D]">
        Pour un client qui a payé en ligne (acompte 50% ou 1ère mensualité) et
        vient régler la suite au comptoir. Entre le numéro de commande (8
        caractères, visible sur son reçu/email).
      </p>

      <div className="mb-4 flex gap-2">
        <input
          value={shortId}
          onChange={(e) => setShortId(e.target.value)}
          placeholder="Numéro de commande"
          className="flex-1 rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
        />
        <button
          onClick={search}
          className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
        >
          Chercher
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-[#2F6F4F]">{message}</p>}

      {order && (
        <div className="rounded-lg border border-[#E9ECEF] p-4">
          <p className="mb-1 text-sm font-medium">{order.customerName ?? "Client"}</p>
          <ul className="mb-3 text-sm text-[#6C757D]">
            {order.items.map((item, i) => (
              <li key={i}>{item.name} × {item.quantity}</li>
            ))}
          </ul>
          <p className="mb-1 text-sm">Total : ${(order.total / 100).toFixed(2)}</p>
          <p className="mb-3 text-sm">Déjà payé : ${(order.amountPaid / 100).toFixed(2)}</p>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
            className="mb-3 w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
          >
            <option value="CASH_HTG">Cash HTG</option>
            <option value="CASH_USD">Cash USD</option>
            <option value="MONCASH">Moncash</option>
            <option value="STRIPE_CARD">Carte (POS)</option>
          </select>

          {order.paymentPlan === "INSTALLMENT_3" && order.pendingInstallments.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Mensualités restantes :</p>
              {order.pendingInstallments.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between rounded-lg border border-[#E9ECEF] p-3">
                  <span className="text-sm">
                    Mensualité {inst.index} — ${(inst.amount / 100).toFixed(2)}
                    <span className="ml-2 text-xs text-[#6C757D]">
                      (due le {new Date(inst.dueDate).toLocaleDateString("fr-FR")})
                    </span>
                  </span>
                  <button
                    onClick={() => settle(inst.id)}
                    className="rounded-lg bg-[#2F6F4F] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Encaisser
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="mb-4 text-lg font-semibold text-[#FF523B]">
                Solde dû : ${(order.balanceDue / 100).toFixed(2)}
              </p>
              <button
                onClick={() => settle()}
                className="w-full rounded-lg bg-[#2F6F4F] py-2 text-sm font-medium text-white"
              >
                Encaisser le solde
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
