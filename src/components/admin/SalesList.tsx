"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  channel: "ONLINE" | "POS";
  status: string;
  total: number;
  customerName?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  PROFORMA: "Proforma",
  PAID: "Payée",
  CANCELLED: "Annulée",
};

export function SalesList({ gate }: { gate: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"ALL" | "ONLINE" | "POS">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- rechargement des ventes au changement de filtre
    setLoading(true);
    const qs = filter === "ALL" ? "" : `?channel=${filter}`;
    fetch(`/${gate}/api/orders${qs}`)
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, [gate, filter]);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["ALL", "POS", "ONLINE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              filter === f ? "bg-[#2F6F4F] text-white" : "border border-[#E9ECEF]"
            }`}
          >
            {f === "ALL" ? "Toutes" : f === "POS" ? "Comptoir" : "En ligne"}
          </button>
        ))}
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Canal</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[#E9ECEF]">
                <td className="px-4 py-3 text-[#6C757D]">
                  {new Date(o.createdAt).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3">{o.channel === "POS" ? "Comptoir" : "En ligne"}</td>
                <td className="px-4 py-3">{o.customerName ?? "—"}</td>
                <td className="px-4 py-3">{statusLabels[o.status] ?? o.status}</td>
                <td className="px-4 py-3">${(o.total / 100).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/${gate}/dashboard/sales/${o.id}`}
                    className="text-xs text-[#2F6F4F] underline"
                  >
                    Voir le reçu
                  </a>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6C757D]">
                  Aucune vente pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
