"use client";

import { useCart } from '../context/CartContext';
import Navbar from '@/app/components/Navbar';
import { ShoppingCart, Trash2, Package, Minus, Plus, LogIn, UserPlus, Wallet, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getPriceBreakdown, USD_TO_GDS_RATE, formatGourdes } from '@/app/utils/pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false } }
);

export default function PanierPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [savingOrders, setSavingOrders] = useState(false);
  const [ordersSaved, setOrdersSaved] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);


  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setCheckingAuth(false);
    };
    checkUser();
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const isShopItem = (item: { source?: string }) => item.source === 'shop';

  const cartWithPricing = cart.map(item => {
    const qty = item.quantity || 1;
    const baseTotal = (item.price || 0) * qty;
    return { ...item, qty, baseTotal };
  });

  // Fee is calculated ONCE on the combined total of all import (non-shop) items
  const importSubtotal = cartWithPricing.filter(item => !isShopItem(item)).reduce((sum, item) => sum + item.baseTotal, 0);
  const grandBaseTotal = cartWithPricing.reduce((sum, item) => sum + item.baseTotal, 0);
  const grandFee = importSubtotal > 0 ? getPriceBreakdown(importSubtotal).fee : 0;
  const grandTotal = grandBaseTotal + grandFee;

  const saveAllOrdersToDatabase = async (paymentMethod: string) => {
    if (!user || cart.length === 0) return false;
    setSavingOrders(true);
    setOrderError(null);
    let savedCount = 0;
    let lastError = "";
    try {
      for (const item of cartWithPricing) {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
            productName: item.name,
            productUrl: item.url || "",
            productImage: item.image || "",
            basePrice: item.baseTotal,
            serviceFee: (!isShopItem(item) && importSubtotal > 0) ? Math.round((item.baseTotal / importSubtotal) * grandFee * 100) / 100 : 0,
            totalWithFees: item.baseTotal + ((!isShopItem(item) && importSubtotal > 0) ? Math.round((item.baseTotal / importSubtotal) * grandFee * 100) / 100 : 0),
            platform: item.source || (isShopItem(item) ? "shop" : "other"),
            notes: [
              item.color ? `Couleur: ${item.color}` : "",
              item.size ? `Taille: ${item.size}` : "",
              item.notes || "",
              `Qté: ${item.qty}`,
              `Paiement: ${paymentMethod}`,
            ].filter(Boolean).join(" | "),
          }),
        });
        if (res.ok) {
          savedCount++;
        } else {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          lastError = err.error || `HTTP ${res.status}`;
        }
      }
      if (savedCount === 0) {
        setOrderError(`Erreur: ${lastError || "aucune commande n'a pu être enregistrée"}. Réessayez.`);
        return false;
      }
      setOrdersSaved(true);
      clearCart();
      return true;
    } catch (e: any) {
      setOrderError(`Erreur de connexion: ${e?.message || "Vérifiez votre internet"}. Réessayez.`);
      return false;
    } finally {
      setSavingOrders(false);
    }
  };

  const handleMonCashConfirm = async () => {
    setSavingOrders(true);
    setOrderError(null);
    try {
      // 1. Store cart data in localStorage for the success page to save later
      const pendingOrder = {
        userId: user.id,
        userEmail: user.email,
        items: cartWithPricing.map(item => ({
          name: item.name,
          url: item.url || "",
          image: item.image || "",
          baseTotal: item.baseTotal,
          price: item.price,
          qty: item.qty,
          color: item.color || "",
          size: item.size || "",
          notes: item.notes || "",
          source: item.source || "",
          isShop: isShopItem(item),
          serviceFee: (!isShopItem(item) && importSubtotal > 0) ? Math.round((item.baseTotal / importSubtotal) * grandFee * 100) / 100 : 0,
          totalWithFees: item.baseTotal + ((!isShopItem(item) && importSubtotal > 0) ? Math.round((item.baseTotal / importSubtotal) * grandFee * 100) / 100 : 0),
          platform: item.source || (isShopItem(item) ? "shop" : "other"),
        })),
        grandTotal,
        grandFee,
        grandBaseTotal,
        importSubtotal,
      };
      localStorage.setItem("moncash_pending_order", JSON.stringify(pendingOrder));

      // 2. Convert total to Gourdes for MonCash
      const amountGDS = Math.round(grandTotal * USD_TO_GDS_RATE);

      // 3. Create MonCash payment
      const res = await fetch("/api/moncash/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountGDS, orderId: `ORDER-${Date.now()}` }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirectUrl) throw new Error(data.error || "Erreur MonCash");

      // 4. Clear cart and redirect to MonCash
      clearCart();
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setOrderError(err.message || "Erreur de paiement MonCash. Réessayez.");
      setSavingOrders(false);
    }
  };

  const handleRemoveItem = (item: typeof cartWithPricing[0]) => {
    // Use composite key matching: filter out the exact item by id + color + size
    removeFromCart(item.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="text-purple-600" size={28} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Mon Panier</h1>
          {cart.length > 0 && (
            <span className="bg-purple-100 text-purple-700 text-sm font-bold px-3 py-1 rounded-full">
              {totalItems} article{totalItems > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Empty state */}
        {cart.length === 0 && !ordersSaved && (
          <div className="bg-white rounded-2xl shadow p-8 sm:p-12 text-center">
            <Package className="text-gray-300 mx-auto mb-4" size={56} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-500 mb-6">Ajoutez des produits pour commencer</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/produits" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">
                Nos produits
              </Link>
              <Link href="/aliexpress" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">
                AliExpress
              </Link>
            </div>
          </div>
        )}

        {/* Order confirmed */}
        {ordersSaved && (
          <div className="bg-white rounded-2xl shadow p-8 sm:p-12 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={56} />
            <h2 className="text-xl font-bold text-green-800 mb-2">Commande enregistrée !</h2>
            <p className="text-gray-600 mb-6">Votre commande a été sauvegardée. Suivez son état dans vos commandes.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/my-orders" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">
                Voir mes commandes
              </Link>
              <button onClick={() => { clearCart(); setOrdersSaved(false); }} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition">
                Continuer mes achats
              </button>
            </div>
          </div>
        )}

        {/* Cart content */}
        {cart.length > 0 && !ordersSaved && (
          <div className="space-y-6">
            {/* Cart items */}
            <div className="space-y-3">
              {cartWithPricing.map((item) => (
                <div key={`${item.id}-${item.color}-${item.size}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={32} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2">{item.name}</h3>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.color && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.color}</span>}
                        {item.size && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.size}</span>}
                        {item.source && (() => {
                          const platformLabels: Record<string, { label: string; bg: string; text: string }> = {
                            aliexpress: { label: "AliExpress", bg: "bg-red-50", text: "text-red-700" },
                            shein: { label: "Shein", bg: "bg-gray-100", text: "text-black" },
                            temu: { label: "Temu", bg: "bg-orange-50", text: "text-orange-700" },
                            amazon: { label: "Amazon", bg: "bg-amber-50", text: "text-amber-800" },
                            alibaba: { label: "Alibaba", bg: "bg-orange-50", text: "text-orange-800" },
                            ebay: { label: "eBay", bg: "bg-blue-50", text: "text-blue-700" },
                            shop: { label: "Boutique", bg: "bg-emerald-50", text: "text-emerald-700" },
                          };
                          const p = platformLabels[item.source!] || { label: item.source, bg: "bg-gray-100", text: "text-gray-600" };
                          return <span className={`text-xs ${p.bg} ${p.text} px-2 py-0.5 rounded font-semibold`}>{p.label}</span>;
                        })()}
                      </div>
                      {item.notes && <p className="text-xs text-gray-400 mt-1 truncate">{item.notes}</p>}

                      {/* Price + Qty + Remove */}
                      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                        {/* Quantity */}
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQuantity(item.id, item.qty - 1)} disabled={item.qty <= 1}
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30">
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900">{item.qty}</span>
                          <button onClick={() => updateQuantity(item.id, item.qty + 1)}
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          {item.price ? (
                            <>
                              <p className="font-bold text-purple-700 text-sm sm:text-base">${item.baseTotal.toFixed(2)}</p>
                              <p className="text-[11px] text-gray-400">
                                ${item.price.toFixed(2)} × {item.qty}
                                {isShopItem(item) && <span className="text-green-600 ml-1">(en stock)</span>}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400">Prix sur devis</p>
                          )}
                        </div>

                        {/* Remove */}
                        <button onClick={() => handleRemoveItem(item)}
                          className="w-8 h-8 rounded-md flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="font-bold text-lg text-gray-900">Résumé</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total ({totalItems} article{totalItems > 1 ? "s" : ""})</span>
                  <span>${grandBaseTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Frais de service</span>
                  <span>${grandFee.toFixed(2)}</span>
                </div>
                {cart.some(i => i.source === 'shop') && (
                  <p className="text-xs text-green-600 font-medium">* Les produits en stock (Boutique) sont sans frais de service</p>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total USD</span>
                  <span className="font-extrabold text-lg text-purple-700">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between bg-orange-50 -mx-5 px-5 py-2 rounded-lg">
                  <span className="font-bold text-orange-800">Total GDS</span>
                  <span className="font-extrabold text-lg text-orange-600">{formatGourdes(grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-400 text-center">1 USD = {USD_TO_GDS_RATE} GDS</p>
              </div>

              {/* Error message */}
              {orderError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-700 font-semibold text-sm">{orderError}</p>
                  <button onClick={() => setOrderError(null)} className="mt-2 text-xs text-red-500 underline">Fermer</button>
                </div>
              )}

              {/* Auth + Payment */}
              {checkingAuth ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !user ? (
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                  <LogIn className="text-blue-600 mx-auto mb-2" size={28} />
                  <p className="font-bold text-gray-900 mb-1 text-sm">Connexion requise</p>
                  <p className="text-xs text-gray-500 mb-3">Connectez-vous pour finaliser</p>
                  <div className="flex gap-2">
                    <Link href="/auth" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition text-center">
                      Se connecter
                    </Link>
                    <Link href="/auth" className="flex-1 py-2.5 border-2 border-purple-300 text-purple-700 rounded-lg font-bold text-sm hover:bg-purple-50 transition text-center">
                      Créer un compte
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={handleMonCashConfirm} disabled={savingOrders}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {savingOrders ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Wallet size={20} />
                    )}
                    Payer avec MonCash
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <Link href="/produits" className="flex-1 py-2 text-center text-sm text-gray-500 hover:text-purple-600 font-medium transition">
                  Continuer mes achats
                </Link>
                <button onClick={clearCart} className="py-2 px-3 text-sm text-red-400 hover:text-red-600 font-medium transition">
                  Vider le panier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}