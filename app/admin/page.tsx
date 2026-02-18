"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import { Package, Users, Settings, Shield, ShieldOff, Save, RefreshCw, Search, ChevronDown } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ORDER_STATUSES = [
  { value: "awaiting_payment", label: "En attente de paiement", color: "bg-yellow-200 text-yellow-900 border-yellow-400" },
  { value: "processing", label: "En traitement", color: "bg-blue-200 text-blue-900 border-blue-400" },
  { value: "shipped_to_miami", label: "Expédié vers Miami", color: "bg-purple-200 text-purple-900 border-purple-400" },
  { value: "arrived_haiti", label: "Arrivé en Haïti", color: "bg-green-200 text-green-900 border-green-400" },
  { value: "delivered", label: "Livré", color: "bg-emerald-200 text-emerald-900 border-emerald-400" },
  { value: "cancelled", label: "Annulé", color: "bg-red-200 text-red-900 border-red-400" },
];

export default function AdminPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "users">("orders");
  const [searchOrders, setSearchOrders] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState<string | null>(null);

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

      if (profile?.is_admin) {
        await refreshData();
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const refreshData = async () => {
    // Fetch orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(ordersData || []);

    // Fetch users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(usersData || []);
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setSavingOrder(orderId);
    await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId);
    
    setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    setSavingOrder(null);
  };

  // Update order tracking
  const updateOrderTracking = async (orderId: string, tracking: string) => {
    setSavingOrder(orderId);
    await supabase
      .from('orders')
      .update({ miami_tracking_number: tracking })
      .eq('id', orderId);
    
    setOrders(orders.map(o => o.id === orderId ? { ...o, miami_tracking_number: tracking } : o));
    setSavingOrder(null);
  };

  // Toggle admin status for user
  const toggleUserAdmin = async (userId: string, currentIsAdmin: boolean) => {
    setSavingUser(userId);
    await supabase
      .from('profiles')
      .update({ is_admin: !currentIsAdmin })
      .eq('id', userId);
    
    setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !currentIsAdmin } : u));
    setSavingUser(null);
  };

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  // Filter orders
  const filteredOrders = orders.filter(order => 
    order.user_email?.toLowerCase().includes(searchOrders.toLowerCase()) ||
    order.product_name?.toLowerCase().includes(searchOrders.toLowerCase()) ||
    order.miami_tracking_number?.toLowerCase().includes(searchOrders.toLowerCase())
  );

  // Filter users
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-sm">Gestion des commandes et utilisateurs</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold"
          >
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>

        {/* Access Denied */}
        {!isAdmin && !loading && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-8 rounded-2xl text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldOff className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
            <p>Vous devez être administrateur pour accéder à cette page.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement...</p>
          </div>
        )}

        {/* Admin Content */}
        {isAdmin && !loading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    <p className="text-sm text-gray-500">Commandes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    <p className="text-sm text-gray-500">Utilisateurs</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-yellow-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Package className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.order_status === 'awaiting_payment').length}</p>
                    <p className="text-sm text-gray-500">En attente</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_admin).length}</p>
                    <p className="text-sm text-gray-500">Admins</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "orders" ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Package size={20} />
                Commandes
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "users" ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Users size={20} />
                Utilisateurs
              </button>
            </div>

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <section className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Rechercher par email, produit ou tracking..."
                      value={searchOrders}
                      onChange={(e) => setSearchOrders(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Client</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Produit</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Statut</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Tracking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucune commande trouvée</td>
                        </tr>
                      ) : (
                        filteredOrders.map(order => {
                          const statusInfo = getStatusInfo(order.order_status);
                          return (
                            <tr key={order.id} className="hover:bg-blue-50/30 transition">
                              <td className="px-4 py-4 text-sm text-gray-900">
                                {new Date(order.created_at).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                                {order.user_email}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                {order.product_name}
                              </td>
                              <td className="px-4 py-4 text-sm font-bold text-blue-700">
                                ${order.total_price_with_fees}
                              </td>
                              <td className="px-4 py-4">
                                <div className="relative">
                                  <select
                                    value={order.order_status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    disabled={savingOrder === order.id}
                                    className={`appearance-none px-3 py-2 pr-8 rounded-xl text-xs font-semibold border cursor-pointer ${statusInfo.color} ${savingOrder === order.id ? 'opacity-50' : ''}`}
                                  >
                                    {ORDER_STATUSES.map(status => (
                                      <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" size={14} />
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="text"
                                  value={order.miami_tracking_number || ""}
                                  onChange={(e) => {
                                    setOrders(orders.map(o => o.id === order.id ? { ...o, miami_tracking_number: e.target.value } : o));
                                  }}
                                  onBlur={(e) => updateOrderTracking(order.id, e.target.value)}
                                  className="border border-gray-200 rounded-lg px-3 py-2 w-36 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Tracking #"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <section className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Rechercher par email, nom ou téléphone..."
                      value={searchUsers}
                      onChange={(e) => setSearchUsers(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Nom</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Téléphone</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Ville</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Rôle</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun utilisateur trouvé</td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-purple-50/30 transition">
                            <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                              {user.email}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {user.first_name} {user.last_name}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {user.phone || "-"}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {user.city || "-"}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.is_admin ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                {user.is_admin ? "Admin" : "Client"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                                disabled={savingUser === user.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${user.is_admin ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} ${savingUser === user.id ? 'opacity-50' : ''}`}
                              >
                                {user.is_admin ? (
                                  <>
                                    <ShieldOff size={16} />
                                    Rétrograder
                                  </>
                                ) : (
                                  <>
                                    <Shield size={16} />
                                    Promouvoir Admin
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
