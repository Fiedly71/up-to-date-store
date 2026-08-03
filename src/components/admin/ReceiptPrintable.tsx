"use client";

import { useState } from "react";

const paymentLabels: Record<string, string> = {
  CASH_HTG: "Cash (HTG)",
  CASH_USD: "Cash (USD)",
  MONCASH: "Moncash",
  STRIPE_CARD: "Carte",
};

type ReceiptOrder = {
  id: string;
  createdAt: string;
  channel: "ONLINE" | "POS";
  customerName: string | null;
  status: string;
  paymentMethod: string | null;
  total: number;
  items: { id: string; product: { name: string } | null; quantity: number; unitPrice: number }[];
};

export function ReceiptPrintable({ order }: { order: ReceiptOrder }) {
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm" | "a4">("80mm");

  return (
    <div>
      {/* Le @page dynamique cible le format de papier choisi — pris en
          compte par la plupart des pilotes d'imprimante thermique quand on
          sélectionne "Format personnalisé" dans le dialogue d'impression du
          navigateur. Pour du A4, le format standard s'applique déjà. */}
      {paperWidth !== "a4" && (
        <style>{`@page { size: ${paperWidth} auto; margin: 2mm; }`}</style>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
        <label htmlFor="paper-width" className="text-sm font-medium">
          Format papier
        </label>
        <select
          id="paper-width"
          value={paperWidth}
          onChange={(e) => setPaperWidth(e.target.value as typeof paperWidth)}
          className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
        >
          <option value="58mm">Thermique 58mm</option>
          <option value="80mm">Thermique 80mm</option>
          <option value="a4">PDF A4</option>
        </select>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
        >
          Imprimer
        </button>
      </div>

      <div
        className={`mx-auto rounded-xl border border-[#E9ECEF] bg-white p-4 text-sm print:border-none ${
          paperWidth === "a4" ? "max-w-sm print:max-w-none" : ""
        }`}
        style={paperWidth !== "a4" ? { maxWidth: paperWidth, fontSize: "11px" } : undefined}
      >
        <div className="mb-4 text-center">
          <p className="text-lg font-bold">UpDate Tech & Digital Solutions</p>
          <p className="text-xs text-[#6C757D]">Champin, Cap-Haïtien, Haïti</p>
        </div>

        <div className="mb-4 border-y border-dashed border-[#E9ECEF] py-2 text-xs text-[#6C757D]">
          <p>Reçu #{order.id.slice(-8).toUpperCase()}</p>
          <p>{new Date(order.createdAt).toLocaleString("fr-FR")}</p>
          <p>{order.channel === "POS" ? "Vente comptoir" : "Vente en ligne"}</p>
          {order.customerName && <p>Client : {order.customerName}</p>}
        </div>

        <table className="mb-4 w-full text-xs">
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-1">
                  {item.product?.name ?? "Produit"} × {item.quantity}
                </td>
                <td className="py-1 text-right">
                  ${((item.unitPrice * item.quantity) / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-4 flex justify-between border-t border-dashed border-[#E9ECEF] pt-2 text-sm font-semibold">
          <span>Total</span>
          <span>${(order.total / 100).toFixed(2)}</span>
        </div>

        <p className="text-center text-xs text-[#6C757D]">
          {order.status === "PROFORMA"
            ? "Proforma — document non fiscal"
            : `Paiement : ${order.paymentMethod ? paymentLabels[order.paymentMethod] : "—"}`}
        </p>

        <p className="mt-6 text-center text-xs text-[#6C757D]">Merci pour votre confiance !</p>
      </div>
    </div>
  );
}
