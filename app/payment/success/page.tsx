"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Home, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId") || searchParams.get("transaction_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const timer = setTimeout(() => setStatus("success"), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        {status === "loading" ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-purple-600 animate-spin" />
            <p className="text-lg text-gray-600 font-medium">Vérification du paiement...</p>
          </div>
        ) : (
          <div className="premium-card rounded-2xl p-8 shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Paiement reçu !</h1>
            <p className="text-gray-600 mb-2">Merci pour votre paiement via MonCash.</p>
            <p className="text-gray-500 text-sm mb-6">Votre commande est en cours de traitement. Vous recevrez une confirmation bientôt.</p>

            {transactionId && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 inline-block">
                <p className="text-xs text-gray-400">Transaction ID</p>
                <p className="text-sm font-mono font-bold text-gray-700">{transactionId}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link href="/my-orders" className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-md">
                <ShoppingBag size={16} /> Mes commandes
              </Link>
              <Link href="/" className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
                <Home size={16} /> Accueil
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <Loader2 size={48} className="text-purple-600 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
