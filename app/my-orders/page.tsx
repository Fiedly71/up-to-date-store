"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const checkAuthAndLoadOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserEmail(null);
        setOrders([]);
        return;
      }
      setUserEmail(user.email ?? null);
      if (user.email) loadOrders(user.email);
    };
    checkAuthAndLoadOrders();
  }, []);

  const loadOrders = async (email: string) => {
    if (!email) return setOrders([]);
    const { data: orders } = await supabase
      .from("wholesale_orders")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });
    setOrders(orders || []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow">Mes Commandes Import</h1>
        {!userEmail && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl mb-6 text-center font-semibold shadow-sm">
            Veuillez <a href="/auth" className="underline font-bold text-blue-700">vous connecter</a> pour voir vos commandes.
          </div>
        )}
        {userEmail && orders.length === 0 && (
          <div className="text-center py-12">
            <p className="mb-6 text-gray-600">Vous n'avez pas encore de commandes.</p>
            <a href="/" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow transition">Commencer ma première importation</a>
          </div>
        )}
        {userEmail && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl shadow-xl border border-blue-100">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-blue-700">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-700">Produit</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-700">Total</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-700">Statut</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-700">Tracking</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  let statusColor = "bg-gray-200 text-gray-800";
                  let statusMsg = "";
                  if (order.order_status === "awaiting_payment") {
                    statusColor = "bg-yellow-200 text-yellow-900 border border-yellow-400";
                    statusMsg = "En attente de paiement";
                  } else if (order.order_status === "processing") {
                    statusColor = "bg-blue-200 text-blue-900 border border-blue-400";
                    statusMsg = "Commande passée sur AliExpress";
                  } else if (order.order_status === "shipped_to_miami") {
                    statusColor = "bg-purple-200 text-purple-900 border border-purple-400";
                    statusMsg = "En transit vers Miami";
                  } else if (order.order_status === "arrived_haiti") {
                    statusColor = "bg-green-200 text-green-900 border border-green-400";
                    statusMsg = "Prêt à être récupéré à Cap-Haïtien !";
                  }
                  let trackingInfo = "";
                  if (order.miami_tracking_number) {
                    trackingInfo += `Miami: ${order.miami_tracking_number}`;
                  }
                  if (order.haiti_tracking_number) {
                    trackingInfo += ` Haiti: ${order.haiti_tracking_number}`;
                  }
                  return (
                    <tr key={order.id} className="hover:bg-blue-50/40 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.product_name}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-700">${order.total_price_with_fees}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-xl ${statusColor} font-semibold text-xs shadow`}>{order.order_status.replace("_", " ")}</span>
                        <div className="text-xs mt-1 text-gray-600">{statusMsg}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{trackingInfo || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
