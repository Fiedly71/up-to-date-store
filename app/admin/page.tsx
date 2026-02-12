"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // Check admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      setIsAdmin(profile?.is_admin === true);

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(ordersData || []);

      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, email, is_admin');
      setUsers(usersData || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  // Save order status/tracking
  const saveOrder = async (orderId: string, status: string, tracking: string) => {
    await supabase
      .from('orders')
      .update({ order_status: status, miami_tracking_number: tracking })
      .eq('id', orderId);
    // Refresh orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(ordersData || []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow">Admin Dashboard</h1>
        {!isAdmin && !loading && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-xl mb-6 text-center font-semibold shadow-sm">
            Accès refusé. Vous devez être administrateur pour voir cette page.
          </div>
        )}
        {isAdmin && !loading && (
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold mb-4 text-blue-700">Commandes récentes</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-2xl shadow-xl border border-blue-100">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Date</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Utilisateur</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Produit</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Total</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Statut</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Tracking</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      let statusColor = "bg-gray-200 text-gray-800 border border-gray-300";
                      if (order.order_status === "awaiting_payment") {
                        statusColor = "bg-yellow-200 text-yellow-900 border border-yellow-400";
                      } else if (order.order_status === "processing") {
                        statusColor = "bg-blue-200 text-blue-900 border border-blue-400";
                      } else if (order.order_status === "shipped_to_miami") {
                        statusColor = "bg-purple-200 text-purple-900 border border-purple-400";
                      } else if (order.order_status === "arrived_haiti") {
                        statusColor = "bg-green-200 text-green-900 border border-green-400";
                      }
                      return (
                        <tr key={order.id} className="hover:bg-blue-50/40 transition">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{order.user_email}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{order.product_name}</td>
                          <td className="px-4 py-3 text-sm font-bold text-blue-700">${order.total_price_with_fees}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-xl ${statusColor} font-semibold text-xs shadow`}>{order.order_status.replace("_", " ")}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <input
                              type="text"
                              value={order.miami_tracking_number || ""}
                              onChange={e => saveOrder(order.id, order.order_status, e.target.value)}
                              className="border rounded px-2 py-1 w-32"
                              placeholder="Tracking #"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => saveOrder(order.id, order.order_status, order.miami_tracking_number || "")}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-bold"
                            >Save</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              <h2 className="text-xl font-bold mb-4 text-blue-700">Gestion des utilisateurs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-2xl shadow-xl border border-blue-100">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Email</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Rôle</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-blue-50/40 transition">
                        <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-blue-700">{user.is_admin ? "Admin" : "User"}</td>
                        <td className="px-4 py-3 text-sm">
                          {/* Actions like promote/demote could go here */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
        {loading && (
          <div className="text-center py-6 text-gray-500">Chargement...</div>
        )}
      </div>
    </div>
  );
}
