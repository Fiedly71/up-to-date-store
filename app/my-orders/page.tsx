"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import { Package, Clock, Truck, CheckCircle, MapPin, ShoppingBag, RefreshCw, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false } }
);

const ORDER_STATUS_CONFIG: { [key: string]: { label: string; color: string; icon: any; description: string } } = {
  awaiting_payment: {
    label: "En attente de paiement",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    description: "Veuillez effectuer le paiement pour confirmer votre commande"
  },
  processing: {
    label: "En traitement",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: ShoppingBag,
    description: "Votre commande a été passée sur AliExpress"
  },
  shipped_to_miami: {
    label: "Expédié vers Miami",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: Truck,
    description: "Votre colis est en route vers notre entrepôt à Miami"
  },
  arrived_haiti: {
    label: "Arrivé en Haïti",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: MapPin,
    description: "Votre colis est prêt à être récupéré à Champin, Cap-Haïtien"
  },
  delivered: {
    label: "Livré",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: CheckCircle,
    description: "Commande livrée avec succès"
  },
  cancelled: {
    label: "Annulé",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: Clock,
    description: "Cette commande a été annulée"
  }
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAuthAndLoadOrders();
  }, []);

  const checkAuthAndLoadOrders = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUserEmail(null);
      setOrders([]);
      setLoading(false);
      return;
    }
    setUserEmail(user.email ?? null);
    if (user.email) await loadOrders(user.email);
    setLoading(false);
  };

  const loadOrders = async (email: string) => {
    if (!email) return setOrders([]);
    const { data: ordersData } = await supabase
      .from("wholesale_orders")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });
    setOrders(ordersData || []);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (userEmail) await loadOrders(userEmail);
    setRefreshing(false);
  };

  const getStatusConfig = (status: string) => {
    return ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.awaiting_payment;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                Mes Commandes
              </h1>
              <p className="text-gray-600 text-sm">Suivez l'état de vos importations</p>
            </div>
          </div>
          {userEmail && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              Actualiser
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement de vos commandes...</p>
          </div>
        )}

        {/* Not logged in */}
        {!loading && !userEmail && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="text-orange-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Veuillez vous connecter pour accéder à vos commandes et suivre leur progression.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Se connecter
            </Link>
          </div>
        )}

        {/* No orders */}
        {!loading && userEmail && orders.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-purple-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Aucune commande</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vous n'avez pas encore passé de commande. Explorez notre catalogue ou recherchez un produit sur AliExpress !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/aliexpress"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
              >
                <ExternalLink size={20} />
                Commander sur AliExpress
              </Link>
              <Link
                href="/produits"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <Package size={20} />
                Voir nos produits
              </Link>
            </div>
          </div>
        )}

        {/* Orders list */}
        {!loading && userEmail && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map(order => {
              const statusConfig = getStatusConfig(order.order_status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">Commande du</span>
                      <span className="font-semibold text-gray-900">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                      <StatusIcon size={16} />
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      {order.product_image && (
                        <img
                          src={order.product_image}
                          alt={order.product_name}
                          className="w-20 h-20 object-contain rounded-xl bg-gray-100"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{order.product_name}</h3>
                        <p className="text-gray-600 text-sm">{statusConfig.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-700">${order.total_price_with_fees}</p>
                        <p className="text-xs text-gray-500">Total avec frais</p>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {(order.miami_tracking_number || order.haiti_tracking_number) && (
                      <div className="bg-gray-50 rounded-xl p-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 text-sm">Suivi du colis</h4>
                          <Link
                            href={`/suivi?numero=${order.miami_tracking_number || order.haiti_tracking_number || order.id}`}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                          >
                            <Eye size={16} />
                            Suivi détaillé
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {order.miami_tracking_number && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">📦 Tracking Miami:</span>
                              <span className="font-mono font-semibold text-blue-700">{order.miami_tracking_number}</span>
                            </div>
                          )}
                          {order.haiti_tracking_number && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">🇭🇹 Tracking Haïti:</span>
                              <span className="font-mono font-semibold text-green-700">{order.haiti_tracking_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Track Button for orders without tracking yet */}
                    {!order.miami_tracking_number && !order.haiti_tracking_number && (
                      <div className="mt-4 text-center">
                        <Link
                          href={`/suivi?numero=${order.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Eye size={16} />
                          Voir le suivi de cette commande
                        </Link>
                      </div>
                    )}

                    {/* Progress bar for visual tracking */}
                    {order.order_status !== 'cancelled' && (
                      <div className="mt-6">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span>Paiement</span>
                          <span>Traitement</span>
                          <span>Miami</span>
                          <span>Haïti</span>
                          <span>Livré</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                            style={{
                              width: order.order_status === 'awaiting_payment' ? '10%'
                                : order.order_status === 'processing' ? '30%'
                                : order.order_status === 'shipped_to_miami' ? '55%'
                                : order.order_status === 'arrived_haiti' ? '80%'
                                : order.order_status === 'delivered' ? '100%'
                                : '0%'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help section */}
        {userEmail && (
          <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <h3 className="font-bold text-green-800 mb-2">Besoin d'aide ?</h3>
            <p className="text-green-700 text-sm mb-4">
              Des questions sur votre commande ? Contactez-nous sur WhatsApp pour un suivi personnalisé.
            </p>
            <a
              href="https://wa.me/50932836938"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Contacter le support
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
