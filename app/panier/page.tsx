"use client";

import { useCart } from '../context/CartContext';
import Navbar from '@/app/components/Navbar';
import { ShoppingCart, Trash2, Package, Minus, Plus, LogIn, UserPlus, Wallet, MessageCircle, Copy, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getPriceBreakdown, USD_TO_GDS_RATE, formatGourdes } from '@/app/utils/pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false } }
);

const MONCASH_NUMBER = "39934388";

export default function PanierPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showMonCashModal, setShowMonCashModal] = useState(false);
  const [savingOrders, setSavingOrders] = useState(false);
  const [ordersSaved, setOrdersSaved] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [copiedMoncash, setCopiedMoncash] = useState(false);

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
            notes: [
              item.source ? `Source: ${item.source}` : "",
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

  const buildWhatsAppMessage = () => {
    const itemsList = cartWithPricing.map((item, i) => {
      const lines = [`${i + 1}. *${item.name}*`];
      lines.push(`   Qté: ${item.qty}`);
      if (item.color) lines.push(`   Couleur: ${item.color}`);
      if (item.size) lines.push(`   Taille: ${item.size}`);
      if (item.notes) lines.push(`   Notes: ${item.notes}`);
      if (item.source) lines.push(`   Source: ${item.source}`);
      lines.push(`   Prix: *$${item.baseTotal.toFixed(2)}*${isShopItem(item) ? ' (en stock)' : ''}`);
      if (item.url) lines.push(`   Lien: ${item.url}`);
      if (item.image && item.image.startsWith('http')) lines.push(`   Image: ${item.image}`);
      return lines.join('\n');
    }).join("\n\n");

    return encodeURIComponent(
`🛒 *NOUVELLE COMMANDE*

👤 *Client:* ${user?.email || "Non connecté"}

📦 *Produits (${cartWithPricing.length}):*
${itemsList}

💰 *Résumé:*
• Sous-total: $${grandBaseTotal.toFixed(2)}
• Frais de service: $${grandFee.toFixed(2)}
• *TOTAL USD: $${grandTotal.toFixed(2)}*
• *TOTAL GDS: ${formatGourdes(grandTotal)}*
_(Taux: 1 USD = ${USD_TO_GDS_RATE} GDS)_

Merci de confirmer ma commande!`
    );
  };

  const handleWhatsAppOrder = async () => {
    const msgText = buildWhatsAppMessage();
    // Open blank window immediately (user gesture = not blocked by popup blocker)
    const whatsappWindow = window.open('', '_blank');
    // Save to DB while browser is still in foreground
    const saved = await saveAllOrdersToDatabase("whatsapp");
    if (saved && whatsappWindow) {
      whatsappWindow.location.href = `https://wa.me/50932836938?text=${msgText}`;
    } else if (whatsappWindow) {
      whatsappWindow.close();
    }
  };

  const buildMonCashWhatsAppMessage = () => {
    const itemsList = cartWithPricing.map((item, i) => {
      const lines = [`${i + 1}. *${item.name}* (×${item.qty})`];
      if (item.color) lines.push(`   Couleur: ${item.color}`);
      if (item.size) lines.push(`   Taille: ${item.size}`);
      if (item.url) lines.push(`   Lien: ${item.url}`);
      if (item.image && item.image.startsWith('http')) lines.push(`   Image: ${item.image}`);
      lines.push(`   Prix: $${item.baseTotal.toFixed(2)}`);
      return lines.join('\n');
    }).join('\n\n');

    return encodeURIComponent(
`💳 *PAIEMENT MONCASH EFFECTUÉ*

👤 *Client:* ${user?.email || ""}

📦 *Produits commandés (${cartWithPricing.length}):*
${itemsList}

💰 *Montant payé:*
• USD: $${grandTotal.toFixed(2)}
• GDS: ${formatGourdes(grandTotal)}

📱 *Envoyé au:* ${MONCASH_NUMBER}

⏳ J'attends la confirmation de mon paiement. Merci!`
    );
  };

  const handleMonCashConfirm = async () => {
    const msgText = buildMonCashWhatsAppMessage();
    // Open blank window immediately (user gesture = not blocked by popup blocker)
    const whatsappWindow = window.open('', '_blank');
    // Save to DB while browser is still in foreground
    const saved = await saveAllOrdersToDatabase("moncash");
    setShowMonCashModal(false);
    if (saved && whatsappWindow) {
      whatsappWindow.location.href = `https://wa.me/50932836938?text=${msgText}`;
    } else if (whatsappWindow) {
      whatsappWindow.close();
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
                        {item.source && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded capitalize">{item.source}</span>}
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
                  <button onClick={() => setShowMonCashModal(true)} disabled={savingOrders}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    <Wallet size={20} /> Payer avec MonCash
                  </button>
                  <button onClick={handleWhatsAppOrder} disabled={savingOrders}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {savingOrders ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <MessageCircle size={20} />
                    )}
                    Commander sur WhatsApp
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

      {/* MonCash Modal */}
      {showMonCashModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMonCashModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2 text-white">
                <Wallet size={20} />
                <span className="font-bold">Paiement MonCash</span>
              </div>
              <button onClick={() => setShowMonCashModal(false)} className="text-white/80 hover:text-white"><X size={22} /></button>
            </div>

            <div className="p-5 space-y-4">
              {/* Amount */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Montant à envoyer</p>
                <p className="text-3xl font-extrabold text-orange-600">{formatGourdes(grandTotal)}</p>
                <p className="text-sm text-gray-400">(${grandTotal.toFixed(2)} USD)</p>
              </div>

              {/* MonCash number */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">Numéro MonCash :</p>
                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-orange-200">
                  <span className="text-xl font-bold text-orange-600 tracking-wider">{MONCASH_NUMBER}</span>
                  <button onClick={() => { navigator.clipboard.writeText(MONCASH_NUMBER); setCopiedMoncash(true); setTimeout(() => setCopiedMoncash(false), 2000); }}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-md transition flex items-center gap-1">
                    {copiedMoncash ? <><CheckCircle size={14} /> Copié</> : <><Copy size={14} /> Copier</>}
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="text-sm space-y-2">
                <p className="font-bold text-gray-900">Étapes :</p>
                <ol className="list-decimal list-inside text-gray-600 space-y-1">
                  <li>Envoyez <strong>{formatGourdes(grandTotal)}</strong> au <strong>{MONCASH_NUMBER}</strong></li>
                  <li>Cliquez le bouton ci-dessous pour confirmer</li>
                  <li>Envoyez le numéro de transaction sur WhatsApp</li>
                </ol>
              </div>

              <button onClick={handleMonCashConfirm} disabled={savingOrders}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                {savingOrders ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MessageCircle size={20} />
                )}
                J&apos;ai payé - Confirmer
              </button>

              <button onClick={() => setShowMonCashModal(false)} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 font-medium hover:border-gray-300 transition text-sm">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}