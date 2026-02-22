"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Home, Loader2, MessageCircle, Package, AlertCircle } from "lucide-react";
import { USD_TO_GDS_RATE, formatGourdes } from "@/app/utils/pricing";

const WHATSAPP_NUMBER = "50932836938";

function SuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId") || searchParams.get("transaction_id");
  const [status, setStatus] = useState<"loading" | "saving" | "success" | "error">("loading");
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const processOrder = async () => {
      try {
        // 1. Get pending order from localStorage
        const raw = localStorage.getItem("moncash_pending_order");
        if (!raw) {
          // No pending order — user may have already completed or came here directly
          setStatus("success");
          return;
        }

        const pending = JSON.parse(raw);
        setOrderData(pending);
        setStatus("saving");

        // 2. Save each item to the database
        let savedCount = 0;
        for (const item of pending.items) {
          const res = await fetch("/api/orders/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: pending.userId,
              userEmail: pending.userEmail,
              productName: item.name,
              productUrl: item.url,
              productImage: item.image,
              basePrice: item.baseTotal,
              serviceFee: item.serviceFee,
              totalWithFees: item.totalWithFees,
              platform: item.platform,
              quantity: item.qty,
              notes: [
                item.color ? `Couleur: ${item.color}` : "",
                item.size ? `Taille: ${item.size}` : "",
                item.notes || "",
                `Qté: ${item.qty}`,
                "Paiement: MonCash",
                transactionId ? `Transaction: ${transactionId}` : "",
              ].filter(Boolean).join(" | "),
            }),
          });
          if (res.ok) savedCount++;
        }

        // 3. Clear pending order
        localStorage.removeItem("moncash_pending_order");

        if (savedCount === 0) {
          setErrorMsg("Les commandes n'ont pas pu être enregistrées. Contactez-nous sur WhatsApp.");
          setStatus("error");
        } else {
          setStatus("success");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Erreur lors de l'enregistrement");
        setStatus("error");
      }
    };

    processOrder();
  }, [transactionId]);

  const buildWhatsAppMessage = () => {
    if (!orderData) {
      return encodeURIComponent(
`✅ *PAIEMENT MONCASH CONFIRMÉ*

${transactionId ? `📱 Transaction: ${transactionId}` : ""}

J'ai effectué mon paiement via MonCash. Merci de confirmer ma commande!`
      );
    }

    const itemsList = orderData.items.map((item: any, i: number) => {
      const lines = [`${i + 1}. *${item.name}* (×${item.qty})`];
      if (item.color) lines.push(`   Couleur: ${item.color}`);
      if (item.size) lines.push(`   Taille: ${item.size}`);
      if (item.url) lines.push(`   Lien: ${item.url}`);
      if (item.image && item.image.startsWith("http")) lines.push(`   Image: ${item.image}`);
      lines.push(`   Prix: $${item.baseTotal.toFixed(2)}`);
      return lines.join("\n");
    }).join("\n\n");

    return encodeURIComponent(
`✅ *PAIEMENT MONCASH CONFIRMÉ*

👤 *Client:* ${orderData.userEmail}
${transactionId ? `📱 *Transaction:* ${transactionId}` : ""}

📦 *Produits commandés (${orderData.items.length}):*
${itemsList}

💰 *Montant payé:*
• USD: $${orderData.grandTotal.toFixed(2)}
• GDS: ${formatGourdes(orderData.grandTotal)}
• Frais: $${orderData.grandFee.toFixed(2)}

Merci de confirmer ma commande!`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">

        {/* Loading / Saving */}
        {(status === "loading" || status === "saving") && (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <Loader2 size={48} className="text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600 font-medium">
              {status === "loading" ? "Vérification du paiement..." : "Enregistrement de votre commande..."}
            </p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-orange-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Problème d'enregistrement</h1>
            <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
            <p className="text-gray-600 text-sm mb-4">Votre paiement MonCash a bien été effectué. Contactez-nous sur WhatsApp pour finaliser :</p>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md">
              <MessageCircle size={20} /> Confirmer sur WhatsApp
            </a>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="space-y-6">
            {/* Success Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Paiement confirmé !</h1>
              <p className="text-gray-600 mb-1">Merci pour votre paiement via MonCash.</p>
              <p className="text-gray-400 text-sm">Votre commande a été enregistrée dans notre système.</p>

              {transactionId && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 mt-4 inline-block">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">Transaction</p>
                  <p className="text-sm font-mono font-bold text-gray-700">{transactionId}</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {orderData && (
              <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Package size={18} className="text-purple-600" /> Résumé de la commande
                </h2>
                <div className="space-y-2">
                  {orderData.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-200 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">Qté: {item.qty} {item.color ? `• ${item.color}` : ""} {item.size ? `• ${item.size}` : ""}</p>
                      </div>
                      <p className="font-bold text-purple-700 text-sm flex-shrink-0">${item.baseTotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4 space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Sous-total</span>
                    <span>${orderData.grandBaseTotal.toFixed(2)}</span>
                  </div>
                  {orderData.grandFee > 0 && (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Frais de service</span>
                      <span>${orderData.grandFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                    <span>Total</span>
                    <span className="text-purple-700">${orderData.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-600 font-semibold">
                    <span>En Gourdes</span>
                    <span>{formatGourdes(orderData.grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Confirm */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 text-center">
              <p className="text-gray-700 font-semibold mb-1">Confirmez votre commande sur WhatsApp</p>
              <p className="text-gray-400 text-sm mb-4">Envoyez les détails de votre paiement pour un traitement rapide</p>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`} target="_blank" rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:from-green-600 hover:to-emerald-700 transition-all shadow-md">
                <MessageCircle size={20} /> Confirmer sur WhatsApp
              </a>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/my-orders" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-md">
                <ShoppingBag size={16} /> Mes commandes
              </Link>
              <Link href="/" className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 bg-white text-gray-700 px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
                <Home size={16} /> Retour à l'accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MonCashMerciPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={48} className="text-purple-600 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
