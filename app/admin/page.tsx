"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import {
  Package, Users, Settings, Shield, ShieldOff, RefreshCw, Search, ChevronDown,
  DollarSign, Calendar, TrendingUp, Eye, MapPin, Phone, Mail, User, BarChart3
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false } }
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
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "users" | "revenue">("orders");
  const [searchOrders, setSearchOrders] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Revenue date filters
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); setLoading(false); return; }
      setCurrentUserId(user.id);

      try {
        const res = await fetch("/api/check-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const result = await res.json();
        if (result.isAdmin) {
          setIsAdmin(true);
          await refreshData(user.id);
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const refreshData = async (userId?: string) => {
    const uid = userId || currentUserId;
    if (!uid) return;
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      const data = await res.json();
      const orders = (data.wholesaleOrders || []).map((o: any) => ({ ...o, _table: "wholesale_orders" }));
      const legacyOrders = (data.orders || []).map((o: any) => ({ ...o, _table: "orders" }));
      const merged = [...orders, ...legacyOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllOrders(merged);
      setUsers(data.users || []);
    } catch {}
  };

  const updateOrderStatus = async (orderId: string, table: string, newStatus: string) => {
    setSavingOrder(orderId);
    try {
      await fetch("/api/admin/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, orderId, table, updates: { order_status: newStatus } }),
      });
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    } catch {}
    setSavingOrder(null);
  };

  const updateOrderTracking = async (orderId: string, table: string, tracking: string) => {
    setSavingOrder(orderId);
    try {
      await fetch("/api/admin/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, orderId, table, updates: { miami_tracking_number: tracking } }),
      });
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, miami_tracking_number: tracking } : o));
    } catch {}
    setSavingOrder(null);
  };

  const toggleUserAdmin = async (targetUserId: string, currentIsAdmin: boolean) => {
    setSavingUser(targetUserId);
    try {
      await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, targetUserId, isAdmin: !currentIsAdmin }),
      });
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, is_admin: !currentIsAdmin } : u));
    } catch {}
    setSavingUser(null);
  };

  const getStatusInfo = (status: string) => ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];

  const filteredOrders = allOrders.filter(order =>
    (order.user_email || "").toLowerCase().includes(searchOrders.toLowerCase()) ||
    (order.product_name || order.product_title || "").toLowerCase().includes(searchOrders.toLowerCase()) ||
    (order.miami_tracking_number || "").toLowerCase().includes(searchOrders.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    (user.email || "").toLowerCase().includes(searchUsers.toLowerCase()) ||
    (user.first_name || "").toLowerCase().includes(searchUsers.toLowerCase()) ||
    (user.last_name || "").toLowerCase().includes(searchUsers.toLowerCase()) ||
    (user.phone || "").toLowerCase().includes(searchUsers.toLowerCase()) ||
    (user.city || "").toLowerCase().includes(searchUsers.toLowerCase())
  );

  // Revenue calculations
  const revenueOrders = allOrders.filter(o => {
    if (!o.created_at) return false;
    const d = new Date(o.created_at);
    return d >= new Date(dateFrom) && d <= new Date(dateTo + "T23:59:59");
  });

  const getOrderPrice = (o: any) => {
    const p = parseFloat(o.total_price_with_fees || o.price || 0);
    return isNaN(p) ? 0 : p;
  };

  const totalRevenue = allOrders.reduce((sum, o) => sum + getOrderPrice(o), 0);
  const periodRevenue = revenueOrders.reduce((sum, o) => sum + getOrderPrice(o), 0);
  const deliveredRevenue = revenueOrders.filter(o => o.order_status === "delivered").reduce((sum, o) => sum + getOrderPrice(o), 0);

  const userOrderCounts: Record<string, number> = {};
  allOrders.forEach(o => {
    const key = o.user_email || o.user_id || "unknown";
    userOrderCounts[key] = (userOrderCounts[key] || 0) + 1;
  });

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
              <p className="text-gray-600 text-sm">Gestion complète du magasin</p>
            </div>
          </div>
          <button onClick={() => refreshData()} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold">
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
                    <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
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
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Revenus totaux</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-yellow-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Shield className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_admin).length}</p>
                    <p className="text-sm text-gray-500">Admins</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              <button onClick={() => setActiveTab("orders")} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "orders" ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Package size={20} /> Commandes ({allOrders.length})
              </button>
              <button onClick={() => setActiveTab("users")} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "users" ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Users size={20} /> Clients ({users.length})
              </button>
              <button onClick={() => setActiveTab("revenue")} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "revenue" ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <BarChart3 size={20} /> Revenus
              </button>
            </div>

            {/* ============ ORDERS TAB ============ */}
            {activeTab === "orders" && (
              <section className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Rechercher par email, produit ou tracking..." value={searchOrders} onChange={e => setSearchOrders(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Package className="mx-auto mb-3 text-gray-300" size={48} />
                    <p className="font-medium">Aucune commande trouvée</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredOrders.map(order => {
                      const statusInfo = getStatusInfo(order.order_status);
                      const productName = order.product_name || order.product_title || "Produit";
                      const price = getOrderPrice(order);
                      const isExpanded = expandedOrder === order.id;

                      return (
                        <div key={order.id + order._table} className="hover:bg-blue-50/30 transition">
                          {/* Main row */}
                          <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{order._table === "wholesale_orders" ? "AliExpress" : "Boutique"}</span>
                              </div>
                              <p className="font-semibold text-gray-900 truncate">{productName}</p>
                              <p className="text-sm text-gray-600">{order.user_email || "Email non renseigné"}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-bold text-blue-700 text-lg">${price.toFixed(2)}</span>
                              <div className="relative">
                                <select value={order.order_status || "awaiting_payment"} onChange={e => updateOrderStatus(order.id, order._table, e.target.value)} disabled={savingOrder === order.id}
                                  className={`appearance-none px-3 py-2 pr-8 rounded-xl text-xs font-semibold border cursor-pointer ${statusInfo.color} ${savingOrder === order.id ? 'opacity-50' : ''}`}>
                                  {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" size={14} />
                              </div>
                              <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                                <Eye size={18} />
                              </button>
                            </div>
                          </div>
                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50">
                              <div className="space-y-2 text-sm">
                                <p><span className="font-semibold text-gray-700">ID:</span> <span className="text-gray-600 text-xs">{order.id}</span></p>
                                <p><span className="font-semibold text-gray-700">Client:</span> {order.user_email || "-"}</p>
                                <p><span className="font-semibold text-gray-700">Produit:</span> {productName}</p>
                                {order.ali_item_id && <p><span className="font-semibold text-gray-700">AliExpress ID:</span> {order.ali_item_id}</p>}
                                <p><span className="font-semibold text-gray-700">Prix total:</span> <span className="font-bold text-blue-700">${price.toFixed(2)}</span></p>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tracking Miami</label>
                                  <input type="text" value={order.miami_tracking_number || ""}
                                    onChange={e => setAllOrders(prev => prev.map(o => o.id === order.id ? { ...o, miami_tracking_number: e.target.value } : o))}
                                    onBlur={e => updateOrderTracking(order.id, order._table, e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    placeholder="Numéro de tracking..." />
                                </div>
                                {order.haiti_tracking_number && (
                                  <p className="text-sm"><span className="font-semibold text-gray-700">Tracking Haïti:</span> {order.haiti_tracking_number}</p>
                                )}
                                {order.shipping_address && (
                                  <p className="text-sm"><span className="font-semibold text-gray-700">Adresse:</span> {order.shipping_address}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ============ USERS TAB ============ */}
            {activeTab === "users" && (
              <section className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Rechercher par email, nom, téléphone, ville..." value={searchUsers} onChange={e => setSearchUsers(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Users className="mx-auto mb-3 text-gray-300" size={48} />
                    <p className="font-medium">Aucun utilisateur trouvé</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredUsers.map(u => {
                      const isExpanded = expandedUser === u.id;
                      const orderCount = userOrderCounts[u.email] || 0;
                      return (
                        <div key={u.id} className="hover:bg-purple-50/30 transition">
                          <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.is_admin ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                  {u.is_admin ? "Admin" : "Client"}
                                </span>
                                {orderCount > 0 && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{orderCount} commande{orderCount > 1 ? 's' : ''}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                <p className="font-semibold text-gray-900">{u.email}</p>
                              </div>
                              <p className="text-sm text-gray-600">
                                {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : "Nom non renseigné"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button onClick={() => toggleUserAdmin(u.id, u.is_admin)} disabled={savingUser === u.id || u.id === currentUserId}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${u.is_admin ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} ${(savingUser === u.id || u.id === currentUserId) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {u.is_admin ? <><ShieldOff size={16} />Rétrograder</> : <><Shield size={16} />Promouvoir</>}
                              </button>
                              <button onClick={() => setExpandedUser(isExpanded ? null : u.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                                <Eye size={18} />
                              </button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-4 bg-purple-50/50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2"><User size={14} className="text-gray-400" /><span className="font-semibold">Prénom:</span> {u.first_name || "-"}</div>
                                  <div className="flex items-center gap-2"><User size={14} className="text-gray-400" /><span className="font-semibold">Nom:</span> {u.last_name || "-"}</div>
                                  <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="font-semibold">Email:</span> {u.email}</div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span className="font-semibold">Téléphone:</span> {u.phone || "-"}</div>
                                  <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /><span className="font-semibold">Ville:</span> {u.city || "-"}</div>
                                  <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /><span className="font-semibold">Adresse:</span> {u.address || "-"}</div>
                                </div>
                              </div>
                              {u.created_at && <p className="text-xs text-gray-400 mt-3">Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}</p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ============ REVENUE TAB ============ */}
            {activeTab === "revenue" && (
              <section className="space-y-6">
                {/* Date Range Filter */}
                <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={20} className="text-green-600" /> Période d&apos;analyse</h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Du</label>
                      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Au</label>
                      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { const d = new Date(); d.setDate(d.getDate() - 7); setDateFrom(d.toISOString().split("T")[0]); setDateTo(new Date().toISOString().split("T")[0]); }}
                        className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200">7 jours</button>
                      <button onClick={() => { const d = new Date(); d.setMonth(d.getMonth() - 1); setDateFrom(d.toISOString().split("T")[0]); setDateTo(new Date().toISOString().split("T")[0]); }}
                        className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200">30 jours</button>
                      <button onClick={() => { const d = new Date(); d.setMonth(d.getMonth() - 3); setDateFrom(d.toISOString().split("T")[0]); setDateTo(new Date().toISOString().split("T")[0]); }}
                        className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200">3 mois</button>
                    </div>
                  </div>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><DollarSign className="text-green-600" size={24} /></div>
                      <div>
                        <p className="text-2xl font-bold text-green-700">${periodRevenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Revenus (période)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center"><TrendingUp className="text-emerald-600" size={24} /></div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-700">${deliveredRevenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Livrés (période)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><Package className="text-blue-600" size={24} /></div>
                      <div>
                        <p className="text-2xl font-bold text-blue-700">{revenueOrders.length}</p>
                        <p className="text-sm text-gray-500">Commandes (période)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><BarChart3 className="text-purple-600" size={24} /></div>
                      <div>
                        <p className="text-2xl font-bold text-purple-700">${revenueOrders.length > 0 ? (periodRevenue / revenueOrders.length).toFixed(2) : "0.00"}</p>
                        <p className="text-sm text-gray-500">Moyenne / commande</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition par statut (période)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {ORDER_STATUSES.map(status => {
                      const count = revenueOrders.filter(o => o.order_status === status.value).length;
                      const amount = revenueOrders.filter(o => o.order_status === status.value).reduce((s, o) => s + getOrderPrice(o), 0);
                      return (
                        <div key={status.value} className={`rounded-xl p-4 border ${status.color}`}>
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-xs font-semibold">{status.label}</p>
                          <p className="text-xs mt-1 opacity-75">${amount.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revenue Orders List */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <h3 className="font-bold text-gray-900">Détail des commandes ({revenueOrders.length})</h3>
                  </div>
                  {revenueOrders.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">Aucune commande pour cette période</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Client</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Produit</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Montant</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {revenueOrders.map(order => {
                            const statusInfo = getStatusInfo(order.order_status);
                            return (
                              <tr key={order.id + order._table} className="hover:bg-green-50/30">
                                <td className="px-4 py-3 text-sm text-gray-900">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{order.user_email || "-"}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{order.product_name || order.product_title || "-"}</td>
                                <td className="px-4 py-3 text-sm font-bold text-green-700">${getOrderPrice(order).toFixed(2)}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${statusInfo.color}`}>{statusInfo.label}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
