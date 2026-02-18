"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import { 
  Search, Package, Clock, Truck, CheckCircle, MapPin, 
  ShoppingBag, AlertCircle, ArrowRight, Plane, Building2,
  CalendarDays, Info, Phone, ExternalLink
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tracking stages configuration
const TRACKING_STAGES = [
  {
    key: "awaiting_payment",
    label: "Paiement",
    icon: Clock,
    description: "En attente du paiement",
    color: "yellow"
  },
  {
    key: "processing",
    label: "Commande",
    icon: ShoppingBag,
    description: "Commande passée sur la plateforme",
    color: "blue"
  },
  {
    key: "shipped_to_miami",
    label: "En transit",
    icon: Plane,
    description: "Expédié vers Miami, USA",
    color: "purple"
  },
  {
    key: "arrived_miami",
    label: "Miami",
    icon: Building2,
    description: "Arrivé à l'entrepôt de Miami",
    color: "indigo"
  },
  {
    key: "shipped_to_haiti",
    label: "Vers Haïti",
    icon: Truck,
    description: "En route vers Haïti",
    color: "cyan"
  },
  {
    key: "arrived_haiti",
    label: "Haïti",
    icon: MapPin,
    description: "Arrivé à Cap-Haïtien",
    color: "green"
  },
  {
    key: "delivered",
    label: "Livré",
    icon: CheckCircle,
    description: "Colis livré avec succès",
    color: "emerald"
  }
];

// Status messages for detailed tracking
const STATUS_DETAILS: { [key: string]: { title: string; message: string; nextStep: string } } = {
  awaiting_payment: {
    title: "En attente de paiement",
    message: "Votre commande est enregistrée mais le paiement n'a pas encore été confirmé. Veuillez effectuer le paiement via MonCash ou contacter notre équipe sur WhatsApp.",
    nextStep: "Une fois le paiement confirmé, nous passerons votre commande immédiatement."
  },
  processing: {
    title: "Commande en traitement",
    message: "Votre commande a été passée sur la plateforme (AliExpress, Amazon, etc.) et est en cours de préparation par le vendeur.",
    nextStep: "Le colis sera expédié vers notre entrepôt à Miami sous peu."
  },
  shipped_to_miami: {
    title: "En transit vers Miami",
    message: "Votre colis a été expédié et est en route vers notre entrepôt à Miami, USA. Ce trajet peut prendre entre 7 à 20 jours selon la provenance.",
    nextStep: "Vous recevrez une notification dès que le colis arrive à Miami."
  },
  arrived_miami: {
    title: "Arrivé à Miami",
    message: "Excellent ! Votre colis est arrivé à notre entrepôt à Miami. Nous préparons l'expédition vers Haïti.",
    nextStep: "Le prochain envoi vers Haïti est prévu sous 3-5 jours ouvrables."
  },
  shipped_to_haiti: {
    title: "En route vers Haïti",
    message: "Votre colis est en cours d'acheminement vers Haïti. L'expédition Miami → Cap-Haïtien prend généralement 3-5 jours.",
    nextStep: "Nous vous contacterons dès que le colis arrive à notre boutique."
  },
  arrived_haiti: {
    title: "Disponible à Cap-Haïtien",
    message: "🎉 Bonne nouvelle ! Votre colis est arrivé à notre boutique à Champin, Cap-Haïtien. Vous pouvez venir le récupérer.",
    nextStep: "Présentez-vous avec votre numéro de suivi ou pièce d'identité."
  },
  delivered: {
    title: "Livré avec succès",
    message: "Votre colis a été livré. Merci d'avoir choisi Up-to-date Electronic Store !",
    nextStep: "N'hésitez pas à nous laisser un avis ou à commander à nouveau."
  },
  cancelled: {
    title: "Commande annulée",
    message: "Cette commande a été annulée. Si vous avez des questions, contactez notre support.",
    nextStep: "Vous pouvez passer une nouvelle commande à tout moment."
  }
};

function TrackingSearchHandler({ onSearch }: { onSearch: (tracking: string) => void }) {
  const searchParams = useSearchParams();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const tracking = searchParams.get("numero");
    if (tracking && !handled) {
      setHandled(true);
      onSearch(tracking);
    }
  }, [searchParams, handled, onSearch]);

  return null;
}

function TrackingContent() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchTerm?: string) => {
    const numberToSearch = searchTerm || trackingNumber.trim();
    if (!numberToSearch) {
      setError("Veuillez entrer un numéro de suivi");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    try {
      // Search in wholesale_orders first by miami or haiti tracking number
      const { data: orderData, error: orderError } = await supabase
        .from("wholesale_orders")
        .select("*")
        .or(`miami_tracking_number.ilike.%${numberToSearch}%,haiti_tracking_number.ilike.%${numberToSearch}%,id.eq.${numberToSearch}`)
        .limit(1)
        .single();

      if (orderError || !orderData) {
        // Try orders table
        const { data: altOrderData } = await supabase
          .from("orders")
          .select("*")
          .or(`miami_tracking_number.ilike.%${numberToSearch}%,haiti_tracking_number.ilike.%${numberToSearch}%,id.eq.${numberToSearch}`)
          .limit(1)
          .single();

        if (altOrderData) {
          setOrder(altOrderData);
        } else {
          setError("Aucune commande trouvée avec ce numéro de suivi. Vérifiez le numéro et réessayez.");
        }
      } else {
        setOrder(orderData);
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFromUrl = (tracking: string) => {
    setTrackingNumber(tracking);
    handleSearch(tracking);
  };

  const getCurrentStageIndex = (status: string) => {
    const index = TRACKING_STAGES.findIndex(s => s.key === status);
    return index === -1 ? 0 : index;
  };

  const getStatusDetails = (status: string) => {
    return STATUS_DETAILS[status] || STATUS_DETAILS.awaiting_payment;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Package className="text-white" size={40} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent mb-4">
            Suivi de Colis
          </h1>
          <p className="text-gray-600 text-lg max-w-lg mx-auto">
            Entrez votre numéro de suivi pour voir l'état actuel de votre commande en temps réel
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Numéro de suivi (ex: ABC123, miami-xxx...)"
                className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-lg font-medium transition-all duration-300"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Recherche...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Suivre
                </>
              )}
            </button>
          </div>

          {/* Example Numbers */}
          <div className="mt-4 text-center text-sm text-gray-500">
            <Info className="inline mr-1" size={14} />
            Entrez le numéro de tracking Miami, Haïti, ou l'ID de commande
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-red-800 mb-1">Commande introuvable</h3>
              <p className="text-red-600">{error}</p>
              <p className="mt-2 text-sm text-red-500">
                Besoin d'aide ? Contactez-nous sur{" "}
                <a href="https://wa.me/50932836938" className="underline font-semibold">WhatsApp</a>
              </p>
            </div>
          </div>
        )}

        {/* Tracking Results */}
        {order && (
          <div className="space-y-6">
            {/* Order Header Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
              {/* Status Banner */}
              <div className={`px-6 py-4 ${
                order.order_status === "delivered" ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                order.order_status === "arrived_haiti" ? "bg-gradient-to-r from-green-500 to-teal-600" :
                order.order_status === "cancelled" ? "bg-gradient-to-r from-red-500 to-rose-600" :
                "bg-gradient-to-r from-blue-500 to-purple-600"
              } text-white`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    {order.order_status === "delivered" ? <CheckCircle size={28} /> : <Package size={28} />}
                    <div>
                      <p className="text-sm opacity-90">Statut actuel</p>
                      <p className="text-xl font-bold">{getStatusDetails(order.order_status).title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Date de commande</p>
                    <p className="font-semibold">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  {order.product_image && (
                    <img
                      src={order.product_image}
                      alt={order.product_name}
                      className="w-24 h-24 object-contain rounded-xl bg-gray-100 border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">{order.product_name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {order.miami_tracking_number && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">📦 Miami:</span>
                          <span className="font-mono font-semibold text-blue-700">{order.miami_tracking_number}</span>
                        </div>
                      )}
                      {order.haiti_tracking_number && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">🇭🇹 Haïti:</span>
                          <span className="font-mono font-semibold text-green-700">{order.haiti_tracking_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-700">${order.total_price_with_fees}</p>
                    <p className="text-xs text-gray-500">Total avec frais</p>
                  </div>
                </div>

                {/* Status Message */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-gray-800 mb-2">{getStatusDetails(order.order_status).message}</p>
                      <p className="text-sm text-purple-700 font-medium">
                        <ArrowRight className="inline mr-1" size={14} />
                        {getStatusDetails(order.order_status).nextStep}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            {order.order_status !== "cancelled" && (
              <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                  <CalendarDays size={24} className="text-purple-600" />
                  Progression de votre commande
                </h3>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
                  <div 
                    className="absolute left-8 top-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{
                      height: `${Math.min(100, (getCurrentStageIndex(order.order_status) + 1) / TRACKING_STAGES.length * 100)}%`
                    }}
                  ></div>

                  {/* Stages */}
                  <div className="space-y-6">
                    {TRACKING_STAGES.map((stage, index) => {
                      const currentIndex = getCurrentStageIndex(order.order_status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      const StageIcon = stage.icon;

                      return (
                        <div key={stage.key} className="relative flex items-start gap-4 pl-4">
                          {/* Icon Circle */}
                          <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isCurrent 
                              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg ring-4 ring-blue-100" 
                              : isCompleted 
                                ? "bg-green-500 text-white" 
                                : "bg-gray-200 text-gray-400"
                          }`}>
                            {isCompleted && !isCurrent ? (
                              <CheckCircle size={20} />
                            ) : (
                              <StageIcon size={18} />
                            )}
                          </div>

                          {/* Content */}
                          <div className={`flex-1 pb-2 ${isCurrent ? "opacity-100" : isCompleted ? "opacity-70" : "opacity-50"}`}>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold ${isCurrent ? "text-blue-900" : "text-gray-700"}`}>
                                {stage.label}
                              </h4>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                  En cours
                                </span>
                              )}
                              {isCompleted && !isCurrent && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  Complété
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{stage.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <Phone size={20} />
                Besoin d'aide ?
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Pour toute question concernant votre commande, contactez-nous sur WhatsApp.
              </p>
              <a
                href="https://wa.me/50932836938"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                <ExternalLink size={18} />
                Contacter le support
              </a>
            </div>
          </div>
        )}

        {/* Empty State (before search) */}
        {!searched && !loading && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="text-purple-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Suivez vos colis</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Entrez votre numéro de suivi ci-dessus pour voir l'état de votre commande et sa progression vers Haïti.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Truck className="text-blue-500" size={18} />
                <span>Suivi en temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-green-500" size={18} />
                <span>Miami → Cap-Haïtien</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-purple-500" size={18} />
                <span>Notifications de statut</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/my-orders"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Package size={18} />
            Voir mes commandes
          </Link>
          <Link
            href="/aliexpress"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
          >
            <ShoppingBag size={18} />
            Nouvelle commande
          </Link>
        </div>
      </div>

      {/* Suspense for search params */}
      <Suspense fallback={null}>
        <TrackingSearchHandler onSearch={handleSearchFromUrl} />
      </Suspense>
    </div>
  );
}

export default function SuiviPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
