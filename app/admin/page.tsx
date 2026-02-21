"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import {
  Package, Users, Settings, Shield, ShieldOff, RefreshCw, Search, ChevronDown,
  DollarSign, Calendar, TrendingUp, Eye, MapPin, Phone, Mail, User, BarChart3,
  UserPlus, Trash2, X, Lock, Plus, Globe, ShoppingCart, Link as LinkIcon, Image as ImageIcon,
  Tag, Edit3, Check, Upload
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false } }
);

const PLATFORMS: { value: string; label: string; color: string; bg: string }[] = [
  { value: "aliexpress", label: "AliExpress", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  { value: "shein", label: "Shein", color: "text-black", bg: "bg-gray-100 border-gray-300" },
  { value: "temu", label: "Temu", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  { value: "amazon", label: "Amazon", color: "text-amber-800", bg: "bg-amber-50 border-amber-200" },
  { value: "alibaba", label: "Alibaba", color: "text-orange-800", bg: "bg-orange-50 border-orange-300" },
  { value: "ebay", label: "eBay", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  { value: "shop", label: "Boutique", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  { value: "other", label: "Autre", color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
];

const ORDER_STATUSES = [
  { value: "awaiting_payment", label: "En attente de paiement", color: "bg-amber-50 text-amber-800 border-amber-300", dot: "bg-amber-500" },
  { value: "payment_confirmed", label: "Paiement confirmé", color: "bg-lime-50 text-lime-800 border-lime-300", dot: "bg-lime-500" },
  { value: "processing", label: "En commande", color: "bg-blue-50 text-blue-800 border-blue-300", dot: "bg-blue-500" },
  { value: "shipped_to_usa", label: "Expédié vers USA", color: "bg-violet-50 text-violet-800 border-violet-300", dot: "bg-violet-500" },
  { value: "arrived_miami", label: "Arrivé à Miami", color: "bg-indigo-50 text-indigo-800 border-indigo-300", dot: "bg-indigo-500" },
  { value: "shipped_to_dr", label: "En route vers Haïti", color: "bg-cyan-50 text-cyan-800 border-cyan-300", dot: "bg-cyan-500" },
  { value: "available_champin", label: "Disponible (Champin)", color: "bg-green-50 text-green-800 border-green-300", dot: "bg-green-500" },
  { value: "delivered", label: "Livré", color: "bg-emerald-50 text-emerald-800 border-emerald-300", dot: "bg-emerald-600" },
  { value: "payment_issue", label: "Problème paiement", color: "bg-orange-50 text-orange-800 border-orange-300", dot: "bg-orange-500" },
  { value: "cancelled", label: "Annulé", color: "bg-red-50 text-red-800 border-red-300", dot: "bg-red-500" },
];

function getPlatformInfo(order: any) {
  const p = order.platform || "other";
  if (p === "other" && order._table === "orders") return PLATFORMS.find(x => x.value === "shop")!;
  if (p === "other" && order.notes) {
    const n = (order.notes || "").toLowerCase();
    if (n.includes("aliexpress")) return PLATFORMS.find(x => x.value === "aliexpress")!;
    if (n.includes("shein")) return PLATFORMS.find(x => x.value === "shein")!;
    if (n.includes("temu")) return PLATFORMS.find(x => x.value === "temu")!;
    if (n.includes("amazon")) return PLATFORMS.find(x => x.value === "amazon")!;
    if (n.includes("alibaba")) return PLATFORMS.find(x => x.value === "alibaba")!;
  }
  return PLATFORMS.find(x => x.value === p) || PLATFORMS[PLATFORMS.length - 1];
}

export default function AdminPanel() {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "users" | "revenue" | "products">("orders");
  const [searchOrders, setSearchOrders] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Create order modal
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    clientEmail: "", productName: "", productUrl: "", productImage: "",
    basePrice: "", serviceFee: "", quantity: "1", platform: "aliexpress", notes: "", orderStatus: "awaiting_payment"
  });
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createOrderError, setCreateOrderError] = useState("");
  const [createOrderSuccess, setCreateOrderSuccess] = useState("");

  // Create user modal
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "", city: "", address: "", makeAdmin: false });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");
  const [inviteMode, setInviteMode] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  // Delete user confirmation
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Revenue date filters
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  // Products management
  const [products, setProducts] = useState<any[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", image_url: "", category: "", in_stock: true });
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productError, setProductError] = useState("");
  const [productSuccess, setProductSuccess] = useState("");
  const [searchProducts, setSearchProducts] = useState("");
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); setLoading(false); return; }
      setCurrentUserId(user.id);
      try {
        const res = await fetch("/api/check-admin", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const result = await res.json();
        if (result.isAdmin) { setIsAdmin(true); await refreshData(user.id); await loadProducts(); }
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const refreshData = async (userId?: string) => {
    const uid = userId || currentUserId;
    if (!uid) return;
    await loadProducts();
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      const data = await res.json();
      const parseExtra = (o: any) => {
        try {
          if (o.ali_item_id && o.ali_item_id.startsWith('{')) {
            const extra = JSON.parse(o.ali_item_id);
            return { ...o, product_url: extra.product_url, product_image: extra.product_image, base_price: extra.base_price, service_fee: extra.service_fee, notes: extra.notes, platform: extra.platform || "aliexpress" };
          }
        } catch {}
        return o;
      };
      const orders = (data.wholesaleOrders || []).map((o: any) => ({ ...parseExtra(o), _table: "wholesale_orders" }));
      const legacyOrders = (data.orders || []).map((o: any) => ({ ...o, _table: "orders", platform: "shop" }));
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
        method: "POST", headers: { "Content-Type": "application/json" },
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
        method: "POST", headers: { "Content-Type": "application/json" },
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, targetUserId, isAdmin: !currentIsAdmin }),
      });
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, is_admin: !currentIsAdmin } : u));
    } catch {}
    setSavingUser(null);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOrder(true);
    setCreateOrderError("");
    setCreateOrderSuccess("");
    try {
      const bp = parseFloat(newOrder.basePrice) || 0;
      const sf = parseFloat(newOrder.serviceFee) || 0;
      const qty = parseInt(newOrder.quantity) || 1;
      const total = bp * qty + sf;
      const res = await fetch("/api/admin/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          clientEmail: newOrder.clientEmail,
          productName: newOrder.productName,
          productUrl: newOrder.productUrl,
          productImage: newOrder.productImage,
          basePrice: bp, serviceFee: sf, totalWithFees: total,
          quantity: qty, platform: newOrder.platform,
          notes: newOrder.notes, orderStatus: newOrder.orderStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création");
      setCreateOrderSuccess("Commande créée avec succès !");
      await refreshData();
      setTimeout(() => { setShowCreateOrder(false); setCreateOrderSuccess(""); }, 1200);
      setNewOrder({ clientEmail: "", productName: "", productUrl: "", productImage: "", basePrice: "", serviceFee: "", quantity: "1", platform: "aliexpress", notes: "", orderStatus: "awaiting_payment" });
    } catch (err: any) { setCreateOrderError(err.message); }
    setCreatingOrder(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateUserError("");
    setCreateUserSuccess("");
    setInviteLink("");
    try {
      if (inviteMode) {
        const res = await fetch("/api/auth/invite-user", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, ...newUserForm }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        setUsers(prev => [data.user, ...prev]);
        setInviteLink(data.inviteLink);
        setCreateUserSuccess(`Utilisateur ${data.user.email} créé !`);
        setNewUserForm({ email: "", password: "", firstName: "", lastName: "", phone: "", city: "", address: "", makeAdmin: false });
      } else {
        const res = await fetch("/api/admin/create-user", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, ...newUserForm }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        setUsers(prev => [data.user, ...prev]);
        setCreateUserSuccess(`Utilisateur ${data.user.email} créé !`);
        setNewUserForm({ email: "", password: "", firstName: "", lastName: "", phone: "", city: "", address: "", makeAdmin: false });
        setTimeout(() => { setShowCreateUser(false); setCreateUserSuccess(""); }, 1500);
      }
    } catch (err: any) { setCreateUserError(err.message); }
    setCreatingUser(false);
  };

  const handleDeleteUser = async (targetUserId: string) => {
    setDeletingUserId(targetUserId);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, targetUserId }),
      });
      if (!res.ok) throw new Error();
      setUsers(prev => prev.filter(u => u.id !== targetUserId));
      setConfirmDeleteId(null);
    } catch {}
    setDeletingUserId(null);
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch { setProducts([]); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    setProductError("");
    setProductSuccess("");
    try {
      const action = editingProduct ? "update" : "create";
      const product = {
        ...(editingProduct ? { id: editingProduct.id } : {}),
        name: productForm.name,
        description: productForm.description,
        price: productForm.price ? parseFloat(productForm.price) : null,
        image_url: productForm.image_url,
        category: productForm.category,
        in_stock: productForm.in_stock,
      };
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, action, product }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setProductSuccess(editingProduct ? "Produit mis à jour !" : "Produit créé !");
      await loadProducts();
      setTimeout(() => { setShowProductForm(false); setProductSuccess(""); setEditingProduct(null); }, 1000);
      setProductForm({ name: "", description: "", price: "", image_url: "", category: "", in_stock: true });
    } catch (err: any) { setProductError(err.message); }
    setSavingProduct(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProductId(productId);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, action: "delete", product: { id: productId } }),
      });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.filter(p => p.id !== productId));
      setConfirmDeleteProductId(null);
    } catch {}
    setDeletingProductId(null);
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price ? String(p.price) : "",
      image_url: p.image_url || "",
      category: p.category || "",
      in_stock: p.in_stock !== false,
    });
    setShowProductForm(true);
    setProductError("");
    setProductSuccess("");
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", description: "", price: "", image_url: "", category: "", in_stock: true });
    setShowProductForm(true);
    setProductError("");
    setProductSuccess("");
  };

  const filteredProducts = products.filter(p =>
    (p.name || "").toLowerCase().includes(searchProducts.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(searchProducts.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchProducts.toLowerCase())
  );

  const getStatusInfo = (status: string) => ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  const getOrderFee = (o: any) => { const f = parseFloat(o.service_fee || 0); return isNaN(f) ? 0 : f; };
  const getOrderPrice = (o: any) => { const p = parseFloat(o.total_price_with_fees || o.price || 0); return isNaN(p) ? 0 : p; };

  const filteredOrders = allOrders.filter(order => {
    const matchSearch = !searchOrders ||
      (order.user_email || "").toLowerCase().includes(searchOrders.toLowerCase()) ||
      (order.product_name || order.product_title || "").toLowerCase().includes(searchOrders.toLowerCase()) ||
      (order.miami_tracking_number || "").toLowerCase().includes(searchOrders.toLowerCase());
    const matchPlatform = filterPlatform === "all" || getPlatformInfo(order).value === filterPlatform;
    const matchStatus = filterStatus === "all" || order.order_status === filterStatus;
    return matchSearch && matchPlatform && matchStatus;
  });

  const filteredUsers = users.filter(user =>
    (user.email || "").toLowerCase().includes(searchUsers.toLowerCase()) ||
    (user.first_name || "").toLowerCase().includes(searchUsers.toLowerCase()) ||
    (user.last_name || "").toLowerCase().includes(searchUsers.toLowerCase()) ||
    (user.phone || "").toLowerCase().includes(searchUsers.toLowerCase()) ||
    (user.city || "").toLowerCase().includes(searchUsers.toLowerCase())
  );

  const revenueOrders = allOrders.filter(o => {
    if (!o.created_at) return false;
    const d = new Date(o.created_at);
    return d >= new Date(dateFrom) && d <= new Date(dateTo + "T23:59:59");
  });

  const totalRevenue = allOrders.reduce((sum, o) => sum + getOrderFee(o), 0);
  const periodRevenue = revenueOrders.reduce((sum, o) => sum + getOrderFee(o), 0);
  const deliveredRevenue = revenueOrders.filter(o => o.order_status === "delivered").reduce((sum, o) => sum + getOrderFee(o), 0);

  const userOrderCounts: Record<string, number> = {};
  allOrders.forEach(o => { const key = o.user_email || "unknown"; userOrderCounts[key] = (userOrderCounts[key] || 0) + 1; });

  const statusCounts: Record<string, number> = {};
  allOrders.forEach(o => { statusCounts[o.order_status] = (statusCounts[o.order_status] || 0) + 1; });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-500 text-sm">Up-to-date Electronic Store</p>
            </div>
          </div>
          <button onClick={() => refreshData()} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm transition">
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>

        {!isAdmin && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-8 rounded-xl text-center">
            <ShieldOff className="mx-auto mb-3 text-red-400" size={40} />
            <h2 className="text-lg font-bold mb-1">Accès refusé</h2>
            <p className="text-sm">Vous devez être administrateur.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm">Chargement...</p>
          </div>
        )}

        {isAdmin && !loading && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Package, label: "Commandes", value: allOrders.length, accent: "text-blue-600", bg: "bg-blue-50" },
                { icon: Users, label: "Clients", value: users.length, accent: "text-purple-600", bg: "bg-purple-50" },
                { icon: DollarSign, label: "Revenus", value: `$${totalRevenue.toFixed(0)}`, accent: "text-green-600", bg: "bg-green-50" },
                { icon: TrendingUp, label: "En attente", value: statusCounts["awaiting_payment"] || 0, accent: "text-amber-600", bg: "bg-amber-50" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                      <s.icon className={s.accent} size={20} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-5">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-max min-w-full sm:w-fit">
                {([
                  { key: "orders" as const, label: "Commandes", icon: Package, count: allOrders.length },
                  { key: "users" as const, label: "Clients", icon: Users, count: users.length },
                  { key: "products" as const, label: "Produits", icon: Tag, count: products.length },
                  { key: "revenue" as const, label: "Revenus", icon: BarChart3, count: undefined as number | undefined },
                ]).map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition whitespace-nowrap ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    <tab.icon size={16} /> {tab.label} {tab.count !== undefined && <span className="text-xs opacity-60">({tab.count})</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* ============ ORDERS TAB ============ */}
            {activeTab === "orders" && (
              <section className="space-y-4">
                {/* Create Order Modal */}
                {showCreateOrder && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateOrder(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Plus size={20} className="text-blue-600" /> Nouvelle commande</h3>
                        <button onClick={() => setShowCreateOrder(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                      </div>
                      <form onSubmit={handleCreateOrder} className="space-y-4">
                        {/* Platform selector */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Plateforme *</label>
                          <div className="grid grid-cols-4 gap-2">
                            {PLATFORMS.filter(p => p.value !== "shop").map(p => (
                              <button key={p.value} type="button" onClick={() => setNewOrder(prev => ({ ...prev, platform: p.value }))}
                                className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${newOrder.platform === p.value ? `${p.bg} ${p.color} ring-2 ring-offset-1` : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Client email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Email du client *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="email" required value={newOrder.clientEmail} onChange={e => setNewOrder(p => ({ ...p, clientEmail: e.target.value }))}
                              list="user-emails"
                              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm" placeholder="client@email.com" />
                            <datalist id="user-emails">
                              {users.map(u => <option key={u.id} value={u.email} />)}
                            </datalist>
                          </div>
                        </div>

                        {/* Product name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du produit *</label>
                          <input type="text" required value={newOrder.productName} onChange={e => setNewOrder(p => ({ ...p, productName: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm" placeholder="Ex: iPhone 15 Case..." />
                        </div>

                        {/* URL + Image */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Lien produit</label>
                            <div className="relative">
                              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                              <input type="url" value={newOrder.productUrl} onChange={e => setNewOrder(p => ({ ...p, productUrl: e.target.value }))}
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm" placeholder="https://..." />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                            <div className="relative">
                              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                              <input type="url" value={newOrder.productImage} onChange={e => setNewOrder(p => ({ ...p, productImage: e.target.value }))}
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm" placeholder="https://..." />
                            </div>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Prix unitaire ($) *</label>
                            <input type="number" step="0.01" min="0" required value={newOrder.basePrice} onChange={e => setNewOrder(p => ({ ...p, basePrice: e.target.value }))}
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm" placeholder="0.00" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Frais de service ($)</label>
                            <input type="number" step="0.01" min="0" value={newOrder.serviceFee} onChange={e => setNewOrder(p => ({ ...p, serviceFee: e.target.value }))}
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm" placeholder="0.00" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantité</label>
                            <input type="number" min="1" value={newOrder.quantity} onChange={e => setNewOrder(p => ({ ...p, quantity: e.target.value }))}
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm" />
                          </div>
                        </div>

                        {/* Total display */}
                        {newOrder.basePrice && (
                          <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Prix × {newOrder.quantity || 1}</span><span className="font-medium">${((parseFloat(newOrder.basePrice) || 0) * (parseInt(newOrder.quantity) || 1)).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Frais de service</span><span className="font-medium">${(parseFloat(newOrder.serviceFee) || 0).toFixed(2)}</span></div>
                            <div className="flex justify-between border-t border-gray-200 mt-2 pt-2"><span className="font-semibold text-gray-900">Total</span><span className="font-bold text-blue-700">${((parseFloat(newOrder.basePrice) || 0) * (parseInt(newOrder.quantity) || 1) + (parseFloat(newOrder.serviceFee) || 0)).toFixed(2)}</span></div>
                          </div>
                        )}

                        {/* Status */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Statut initial</label>
                          <select value={newOrder.orderStatus} onChange={e => setNewOrder(p => ({ ...p, orderStatus: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm">
                            {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                          <textarea value={newOrder.notes} onChange={e => setNewOrder(p => ({ ...p, notes: e.target.value }))} rows={2}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm resize-none" placeholder="Taille, couleur, instructions..." />
                        </div>

                        {createOrderError && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium border border-red-200">{createOrderError}</div>}
                        {createOrderSuccess && <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium border border-green-200">{createOrderSuccess}</div>}

                        <button type="submit" disabled={creatingOrder}
                          className="w-full py-3 rounded-lg bg-gray-900 text-white font-bold text-sm shadow hover:bg-gray-800 transition disabled:opacity-50">
                          {creatingOrder ? "Création..." : "Créer la commande"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Toolbar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" placeholder="Rechercher par client, produit, tracking..." value={searchOrders} onChange={e => setSearchOrders(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">Toutes plateformes</option>
                        {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">Tous statuts</option>
                        {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <button onClick={() => { setShowCreateOrder(true); setCreateOrderError(""); setCreateOrderSuccess(""); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition whitespace-nowrap">
                        <Plus size={16} /> Nouvelle commande
                      </button>
                    </div>
                  </div>
                </div>

                {/* Orders list */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {filteredOrders.length === 0 ? (
                    <div className="px-6 py-16 text-center text-gray-400">
                      <Package className="mx-auto mb-3" size={40} />
                      <p className="font-medium text-sm">Aucune commande trouvée</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredOrders.map(order => {
                        const statusInfo = getStatusInfo(order.order_status);
                        const platformInfo = getPlatformInfo(order);
                        const productName = order.product_name || order.product_title || "Produit";
                        const price = getOrderPrice(order);
                        const fee = getOrderFee(order);
                        const isExpanded = expandedOrder === order.id;

                        return (
                          <div key={order.id + order._table} className={`transition ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}>
                            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {order.product_image ? (
                                  <img src={order.product_image} alt="" className="w-12 h-12 object-contain rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                                    <Package className="text-gray-300" size={20} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${platformInfo.bg} ${platformInfo.color}`}>
                                      {platformInfo.label}
                                    </span>
                                    <span className="text-[11px] text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                                    {order.miami_tracking_number && (
                                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono">{order.miami_tracking_number}</span>
                                    )}
                                  </div>
                                  <p className="font-semibold text-gray-900 text-sm truncate">{productName}</p>
                                  <p className="text-xs text-gray-500 truncate">{order.user_email || "—"}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 flex-wrap">
                                <div className="text-right mr-1">
                                  <p className="font-bold text-gray-900 text-sm">${price.toFixed(2)}</p>
                                  {fee > 0 && <p className="text-[10px] text-green-600 font-medium">+${fee.toFixed(2)} frais</p>}
                                </div>
                                <div className="relative">
                                  <select value={order.order_status || "awaiting_payment"} onChange={e => updateOrderStatus(order.id, order._table, e.target.value)} disabled={savingOrder === order.id}
                                    className={`appearance-none pl-5 pr-7 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${statusInfo.color} ${savingOrder === order.id ? 'opacity-50' : ''}`}>
                                    {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                  </select>
                                  <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
                                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={12} />
                                </div>
                                <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className={`p-1.5 rounded-lg transition ${isExpanded ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-400'}`}>
                                  <Eye size={16} />
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="px-4 pb-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2.5 text-sm">
                                      <div className="flex items-center gap-2"><span className="text-gray-400 text-xs w-16">ID</span><span className="text-gray-600 text-xs font-mono">{order.id.slice(0, 8)}...</span></div>
                                      <div className="flex items-center gap-2"><span className="text-gray-400 text-xs w-16">Client</span><span className="text-gray-900 font-medium text-sm">{order.user_email || "-"}</span></div>
                                      <div className="flex items-center gap-2"><span className="text-gray-400 text-xs w-16">Produit</span><span className="text-gray-900 text-sm">{productName}</span></div>
                                      <div className="flex items-center gap-2"><span className="text-gray-400 text-xs w-16">Prix</span><span className="text-gray-900 font-semibold">${(parseFloat(order.base_price || order.unit_price_usd || 0)).toFixed(2)} × {order.quantity || 1}</span></div>
                                      <div className="flex items-center gap-2"><span className="text-gray-400 text-xs w-16">Frais</span><span className="text-green-700 font-semibold">${fee.toFixed(2)}</span></div>
                                      <div className="flex items-center gap-2"><span className="text-gray-400 text-xs w-16">Total</span><span className="text-blue-700 font-bold">${price.toFixed(2)}</span></div>
                                      {order.notes && <div className="flex gap-2"><span className="text-gray-400 text-xs w-16">Notes</span><span className="text-gray-600 text-xs">{order.notes}</span></div>}
                                      {order.product_url && (
                                        <a href={order.product_url} target="_blank" rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                                          <Globe size={12} /> Voir le produit
                                        </a>
                                      )}
                                    </div>
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Numéro de suivi</label>
                                        <input type="text" value={order.miami_tracking_number || ""}
                                          onChange={e => setAllOrders(prev => prev.map(o => o.id === order.id ? { ...o, miami_tracking_number: e.target.value } : o))}
                                          onBlur={e => updateOrderTracking(order.id, order._table, e.target.value)}
                                          className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                          placeholder="Entrez le numéro..." />
                                      </div>
                                      {order.product_image && (
                                        <img src={order.product_image} alt="" className="w-24 h-24 object-contain rounded-lg bg-gray-50 border border-gray-200" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ============ USERS TAB ============ */}
            {activeTab === "users" && (
              <section className="space-y-4">
                {showCreateUser && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateUser(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><UserPlus size={20} className="text-purple-600" /> Créer un utilisateur</h3>
                        <button onClick={() => setShowCreateUser(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                      </div>
                      <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="flex bg-gray-100 rounded-lg p-1 mb-2">
                          <button type="button" onClick={() => setInviteMode(false)}
                            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${!inviteMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                            Création directe
                          </button>
                          <button type="button" onClick={() => setInviteMode(true)}
                            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${inviteMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                            Invitation (lien)
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label><input type="text" value={newUserForm.firstName} onChange={e => setNewUserForm(p => ({ ...p, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" placeholder="Jean" /></div>
                          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label><input type="text" value={newUserForm.lastName} onChange={e => setNewUserForm(p => ({ ...p, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" placeholder="Baptiste" /></div>
                        </div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label><input type="email" required value={newUserForm.email} onChange={e => setNewUserForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" placeholder="email@exemple.com" /></div>
                        {!inviteMode && <div><label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe *</label><input type="text" required={!inviteMode} minLength={6} value={newUserForm.password} onChange={e => setNewUserForm(p => ({ ...p, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" placeholder="Min. 6 caractères" /></div>}
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label><input type="tel" value={newUserForm.phone} onChange={e => setNewUserForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" placeholder="+509..." /></div>
                          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Ville</label><input type="text" value={newUserForm.city} onChange={e => setNewUserForm(p => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" placeholder="Cap-Haïtien" /></div>
                        </div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label><input type="text" value={newUserForm.address} onChange={e => setNewUserForm(p => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" placeholder="Rue, Quartier..." /></div>
                        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={newUserForm.makeAdmin} onChange={e => setNewUserForm(p => ({ ...p, makeAdmin: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-purple-600" /><span className="text-sm font-medium text-gray-700">Faire administrateur</span></label>
                        {createUserError && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-200">{createUserError}</div>}
                        {createUserSuccess && <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm border border-green-200">{createUserSuccess}</div>}
                        {inviteLink && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-semibold text-blue-700">Lien d&apos;invitation :</p>
                            <div className="flex gap-2">
                              <input type="text" readOnly value={inviteLink} className="flex-1 px-2 py-1.5 bg-white border border-blue-200 rounded text-xs text-gray-700 truncate" />
                              <button type="button" onClick={() => navigator.clipboard.writeText(inviteLink)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700">Copier</button>
                            </div>
                          </div>
                        )}
                        <button type="submit" disabled={creatingUser} className="w-full py-3 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50">
                          {creatingUser ? "Création..." : inviteMode ? "Inviter" : "Créer l'utilisateur"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" placeholder="Rechercher..." value={searchUsers} onChange={e => setSearchUsers(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
                    </div>
                    <button onClick={() => { setShowCreateUser(true); setCreateUserError(""); setCreateUserSuccess(""); setInviteLink(""); }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition whitespace-nowrap">
                      <UserPlus size={16} /> Ajouter un client
                    </button>
                  </div>
                  {filteredUsers.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-400"><Users className="mx-auto mb-3" size={40} /><p className="text-sm">Aucun utilisateur trouvé</p></div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredUsers.map(u => {
                        const isExp = expandedUser === u.id;
                        const oc = userOrderCounts[u.email] || 0;
                        return (
                          <div key={u.id} className={`transition ${isExp ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}>
                            <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {(u.first_name || u.email || "?")[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{u.email}</p>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${u.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>{u.is_admin ? "Admin" : "Client"}</span>
                                    {oc > 0 && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{oc} cmd</span>}
                                  </div>
                                  <p className="text-xs text-gray-500">{u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : "—"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button onClick={() => toggleUserAdmin(u.id, u.is_admin)} disabled={savingUser === u.id || u.id === currentUserId}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${u.is_admin ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'} ${(savingUser === u.id || u.id === currentUserId) ? 'opacity-40' : ''}`}>
                                  {u.is_admin ? "Rétrograder" : "Promouvoir"}
                                </button>
                                {confirmDeleteId === u.id ? (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleDeleteUser(u.id)} disabled={deletingUserId === u.id} className="px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50">{deletingUserId === u.id ? "..." : "Confirmer"}</button>
                                    <button onClick={() => setConfirmDeleteId(null)} className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300"><X size={14} /></button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDeleteId(u.id)} disabled={u.id === currentUserId} className={`p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 ${u.id === currentUserId ? 'opacity-40' : ''}`}><Trash2 size={15} /></button>
                                )}
                                <button onClick={() => setExpandedUser(isExp ? null : u.id)} className={`p-1.5 rounded-lg transition ${isExp ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-400'}`}><Eye size={15} /></button>
                              </div>
                            </div>
                            {isExp && (
                              <div className="px-4 pb-3">
                                <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  {[
                                    { icon: Mail, label: "Email", val: u.email },
                                    { icon: Phone, label: "Téléphone", val: u.phone || "—" },
                                    { icon: MapPin, label: "Ville", val: u.city || "—" },
                                    { icon: MapPin, label: "Adresse", val: u.address || "—" },
                                  ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                      <f.icon size={14} className="text-gray-400 flex-shrink-0" />
                                      <div><p className="text-[10px] text-gray-400 font-semibold">{f.label}</p><p className="text-gray-900 text-sm">{f.val}</p></div>
                                    </div>
                                  ))}
                                  <div className="sm:col-span-2 flex flex-wrap gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                                    {u.created_at && <span>Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}</span>}
                                    {u.last_sign_in_at && <span>Connexion: {new Date(u.last_sign_in_at).toLocaleDateString('fr-FR')}</span>}
                                    <span>{oc} commande{oc !== 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ============ PRODUCTS TAB ============ */}
            {activeTab === "products" && (
              <section className="space-y-4">
                {/* Product Form Modal */}
                {showProductForm && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowProductForm(false)}>
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-5 sm:p-6 sm:m-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2"><Tag size={20} className="text-purple-600" /> {editingProduct ? "Modifier le produit" : "Nouveau produit"}</h3>
                        <button onClick={() => setShowProductForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                      </div>
                      {productError && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-3">{productError}</div>}
                      {productSuccess && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-2 text-sm mb-3">{productSuccess}</div>}
                      <form onSubmit={handleSaveProduct} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du produit *</label>
                          <input required value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900" placeholder="Ex: Smart Watch Pro" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                          <textarea rows={2} value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900" placeholder="Description du produit..." />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Prix (USD)</label>
                            <input type="number" step="0.01" min="0" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900" placeholder="0.00" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
                            <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
                              <option value="">-- Choisir --</option>
                              <option value="electronique">Électronique</option>
                              <option value="accessoires">Accessoires</option>
                              <option value="maison">Maison</option>
                              <option value="mode">Mode</option>
                              <option value="beaute">Beauté</option>
                              <option value="sport">Sport</option>
                              <option value="jouets">Jouets</option>
                              <option value="autre">Autre</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Photo du produit</label>
                          <label className={`flex items-center justify-center gap-2 w-full px-3 py-3 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload size={18} className="text-purple-500" />
                            <span className="text-sm text-purple-700 font-semibold">{uploadingImage ? 'Envoi en cours...' : '📷 Choisir une photo depuis la galerie'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingImage(true);
                              setProductError("");
                              try {
                                const fd = new FormData();
                                fd.append("file", file);
                                fd.append("userId", currentUserId || "");
                                const res = await fetch("/api/upload", { method: "POST", body: fd });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error || "Erreur upload");
                                setProductForm(f => ({ ...f, image_url: data.url }));
                              } catch (err: any) { setProductError(err.message); }
                              setUploadingImage(false);
                            }} />
                          </label>
                          <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, WebP ou GIF • Max 5 Mo</p>
                          <div className="mt-2">
                            <label className="block text-[11px] text-gray-400 mb-1">Ou collez un lien image :</label>
                            <input value={productForm.image_url} onChange={e => setProductForm(f => ({ ...f, image_url: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900" placeholder="https://..." />
                          </div>
                        </div>
                        {productForm.image_url && (
                          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <img src={productForm.image_url} alt="Aperçu" className="max-h-32 mx-auto rounded object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={productForm.in_stock} onChange={e => setProductForm(f => ({ ...f, in_stock: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm text-gray-700 font-medium">En stock</span>
                          </label>
                        </div>
                        <button type="submit" disabled={savingProduct || uploadingImage} className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                          {savingProduct ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enregistrement...</> : <><Check size={16} /> {editingProduct ? "Mettre à jour" : "Créer le produit"}</>}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Products toolbar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input value={searchProducts} onChange={e => setSearchProducts(e.target.value)} placeholder="Rechercher un produit..." className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 shadow-sm" />
                  </div>
                  <button onClick={openNewProduct} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 shadow-sm transition">
                    <Plus size={16} /> Ajouter un produit
                  </button>
                </div>

                {/* Products grid */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center">
                    <Tag className="mx-auto mb-3 text-gray-300" size={40} />
                    <p className="text-gray-500 text-sm font-medium">Aucun produit</p>
                    <p className="text-gray-400 text-xs mt-1">Cliquez sur &quot;Ajouter un produit&quot; pour commencer</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(p => (
                      <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                        {p.image_url ? (
                          <div className="h-40 bg-gray-100 relative">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.currentTarget.parentElement as HTMLDivElement).innerHTML = '<div class="flex items-center justify-center h-full text-gray-300"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg></div>'; }} />
                          </div>
                        ) : (
                          <div className="h-40 bg-gray-50 flex items-center justify-center"><ImageIcon className="text-gray-300" size={40} /></div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight">{p.name}</h3>
                            <div className="flex items-center gap-1 shrink-0">
                              {p.in_stock !== false ? (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">En stock</span>
                              ) : (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Rupture</span>
                              )}
                            </div>
                          </div>
                          {p.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {p.price != null && <span className="text-lg font-bold text-purple-700">${Number(p.price).toFixed(2)}</span>}
                              {p.category && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{p.category}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEditProduct(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition" title="Modifier">
                                <Edit3 size={14} />
                              </button>
                              {confirmDeleteProductId === p.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDeleteProduct(p.id)} disabled={deletingProductId === p.id} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-xs font-bold transition">
                                    {deletingProductId === p.id ? "..." : "Oui"}
                                  </button>
                                  <button onClick={() => setConfirmDeleteProductId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs font-bold transition">Non</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteProductId(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition" title="Supprimer">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ============ REVENUE TAB ============ */}
            {activeTab === "revenue" && (
              <section className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div><label className="block text-xs font-semibold text-gray-500 mb-1">Du</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900" /></div>
                    <div><label className="block text-xs font-semibold text-gray-500 mb-1">Au</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900" /></div>
                    <div className="flex gap-1.5">
                      {[{ label: "7j", days: 7 }, { label: "30j", days: 30 }, { label: "90j", days: 90 }].map(p => (
                        <button key={p.days} onClick={() => { const d = new Date(); d.setDate(d.getDate() - p.days); setDateFrom(d.toISOString().split("T")[0]); setDateTo(new Date().toISOString().split("T")[0]); }}
                          className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200">{p.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Frais (période)", value: `$${periodRevenue.toFixed(2)}`, accent: "text-green-700" },
                    { label: "Frais livrés", value: `$${deliveredRevenue.toFixed(2)}`, accent: "text-emerald-700" },
                    { label: "Commandes", value: revenueOrders.length, accent: "text-blue-700" },
                    { label: "Moy./commande", value: `$${revenueOrders.length > 0 ? (periodRevenue / revenueOrders.length).toFixed(2) : "0.00"}`, accent: "text-purple-700" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <p className={`text-xl font-bold ${s.accent}`}>{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Par statut</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {ORDER_STATUSES.map(status => {
                      const count = revenueOrders.filter(o => o.order_status === status.value).length;
                      const amount = revenueOrders.filter(o => o.order_status === status.value).reduce((s, o) => s + getOrderFee(o), 0);
                      return (
                        <div key={status.value} className={`rounded-lg p-3 border ${status.color}`}>
                          <div className="flex items-center gap-1.5 mb-1"><span className={`w-2 h-2 rounded-full ${status.dot}`}></span><span className="text-xs font-semibold truncate">{status.label}</span></div>
                          <p className="text-lg font-bold">{count}</p>
                          <p className="text-[10px] opacity-60">${amount.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-3 border-b border-gray-100"><h3 className="font-semibold text-gray-900 text-sm">Détail ({revenueOrders.length})</h3></div>
                  {revenueOrders.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-400 text-sm">Aucune commande pour cette période</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Produit</th>
                            <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Plateforme</th>
                            <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Frais</th>
                            <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {revenueOrders.map(order => {
                            const si = getStatusInfo(order.order_status);
                            const pi = getPlatformInfo(order);
                            return (
                              <tr key={order.id + order._table} className="hover:bg-gray-50/50">
                                <td className="px-3 py-2.5 text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                                <td className="px-3 py-2.5 text-xs text-gray-700">{order.user_email || "-"}</td>
                                <td className="px-3 py-2.5 text-xs text-gray-900 max-w-[200px] truncate">{order.product_name || order.product_title || "-"}</td>
                                <td className="px-3 py-2.5"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${pi.bg} ${pi.color}`}>{pi.label}</span></td>
                                <td className="px-3 py-2.5 text-xs font-bold text-green-700">${getOrderFee(order).toFixed(2)}</td>
                                <td className="px-3 py-2.5"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${si.color}`}><span className={`w-1.5 h-1.5 rounded-full ${si.dot}`}></span>{si.label}</span></td>
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
