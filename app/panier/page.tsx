"use client";

import { useCart } from '../context/CartContext';
import Navbar from '@/app/components/Navbar';
import Image from 'next/image';
import { ShoppingCart, Trash2, Package, Sparkles, Minus, Plus, LogIn, UserPlus, Wallet, MessageCircle, Copy, CheckCircle, X } from 'lucide-react';
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

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setCheckingAuth(false);
    };
    checkUser();
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Calculate pricing for each item and grand totals
  const cartWithPricing = cart.map(item => {
    const qty = item.quantity || 1;
    const baseTotal = (item.price || 0) * qty;
    const breakdown = getPriceBreakdown(baseTotal);
    return { ...item, qty, baseTotal, breakdown };
  });

  const grandBaseTotal = cartWithPricing.reduce((sum, item) => sum + item.baseTotal, 0);
  const grandFee = cartWithPricing.reduce((sum, item) => sum + item.breakdown.fee, 0);
  const grandTotal = cartWithPricing.reduce((sum, item) => sum + item.breakdown.total, 0);

  const saveAllOrdersToDatabase = async (paymentMethod: string) => {
    if (!user || cart.length === 0) return false;
    setSavingOrders(true);
    try {
      for (const item of cartWithPricing) {
        await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
            productName: item.name,
            productUrl: item.url || "",
            productImage: item.image || "",
            basePrice: item.baseTotal,
            serviceFee: item.breakdown.fee,
            totalWithFees: item.breakdown.total,
            notes: [
              item.color ? `Couleur: ${item.color}` : "",
              item.size ? `Taille: ${item.size}` : "",
              item.notes || "",
              `Qté: ${item.qty}`,
              `Paiement: ${paymentMethod}`,
            ].filter(Boolean).join(" | "),
          }),
        });
      }
      setOrdersSaved(true);
      return true;
    } catch {
      return false;
    } finally {
      setSavingOrders(false);
    }
  };

  const buildWhatsAppMessage = () => {
    const itemsList = cartWithPricing.map((item, i) =>
      `${i + 1}. ${item.name}\n   Qté: ${item.qty}${item.color ? ` | Couleur: ${item.color}` : ""}${item.size ? ` | Taille: ${item.size}` : ""}${item.notes ? ` | Notes: ${item.notes}` : ""}\n   Prix: $${item.breakdown.total.toFixed(2)}`
    ).join("\n\n");

    return encodeURIComponent(
`🛒 *NOUVELLE COMMANDE*

👤 *Client:* ${user?.email || "Non connecté"}

📦 *Produits:*
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
    const saved = await saveAllOrdersToDatabase("whatsapp");
    if (saved) {
      window.open(`https://wa.me/50932836938?text=${buildWhatsAppMessage()}`, '_blank');
    }
  };

  const handleMonCashConfirm = async () => {
    const saved = await saveAllOrdersToDatabase("moncash");
    if (saved) {
      window.open(`https://wa.me/50932836938?text=${encodeURIComponent(
`💳 *PAIEMENT MONCASH EFFECTUÉ*

👤 *Client:* ${user?.email || ""}

📦 *${cart.length} article(s) commandé(s)*

💰 *Montant payé:*
• USD: $${grandTotal.toFixed(2)}
• GDS: ${formatGourdes(grandTotal)}

📱 *Envoyé au:* ${MONCASH_NUMBER}

⏳ J'attends la confirmation de mon paiement. Merci!`
      )}`, '_blank');
      setShowMonCashModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />

      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                <ShoppingCart className="text-white" size={32} />
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mon Panier</span>
              </h1>
            </div>
            {cart.length > 0 && (
              <p className="text-lg text-gray-700">
                Vous avez <span className="font-bold text-purple-600">{totalItems}</span> article{totalItems > 1 ? 's' : ''} dans votre panier
              </p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 sm:p-16 text-center max-w-lg mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Package className="text-gray-500" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Découvrez notre sélection de produits premium et ajoutez vos favoris au panier
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/produits" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all">
                  <Sparkles size={20} /> Nos produits
                </Link>
                <Link href="/aliexpress" className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all">
                  <ShoppingCart size={20} /> AliExpress
                </Link>
              </div>
            </div>
          ) : ordersSaved ? (
            /* Order confirmed */
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-lg mx-auto">
              <CheckCircle className="text-green-600 mx-auto mb-4" size={64} />
              <h2 className="text-3xl font-bold text-green-800 mb-3">Commande enregistrée !</h2>
              <p className="text-gray-600 mb-6">Votre commande de {cart.length} article{cart.length > 1 ? "s" : ""} a été sauvegardée. Suivez son état dans vos commandes.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/my-orders" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">
                  <Package size={20} /> Voir mes commandes
                </Link>
                <button onClick={() => { clearCart(); setOrdersSaved(false); }} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition">
                  Continuer mes achats
                </button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartWithPricing.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-md p-5 flex flex-col sm:flex-row gap-5 group hover:shadow-lg transition-all">
                    {/* Product Image */}
                    <div className="relative w-full sm:w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.image || '/UPTODATE%20logo.jpg'} alt={item.name} fill className="object-cover" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                          {item.color && <span className="bg-gray-100 px-2 py-1 rounded">{item.color}</span>}
                          {item.size && <span className="bg-gray-100 px-2 py-1 rounded">{item.size}</span>}
                          {item.source === "aliexpress" && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">AliExpress</span>}
                        </div>
                        {item.notes && <p className="text-xs text-gray-500 truncate">{item.notes}</p>}
                      </div>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, item.qty - 1)} disabled={item.qty <= 1}
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition">
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-gray-900 w-8 text-center">{item.qty}</span>
                          <button onClick={() => updateQuantity(item.id, item.qty + 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          {item.price ? (
                            <>
                              <p className="font-bold text-purple-700">${item.breakdown.total.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">${(item.price).toFixed(2)} × {item.qty} + ${item.breakdown.fee.toFixed(2)} frais</p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Prix sur devis</p>
                          )}
                        </div>

                        {/* Remove */}
                        <button onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <Link href="/aliexpress" className="block text-center text-purple-600 hover:text-purple-800 font-semibold py-3 transition">
                  + Ajouter d&apos;autres produits AliExpress
                </Link>
              </div>

              {/* Summary & Payment */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Résumé</h2>

                  {/* Price breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total ({totalItems} article{totalItems > 1 ? "s" : ""})</span>
                      <span className="font-medium">${grandBaseTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Frais de service</span>
                      <span className="font-medium">${grandFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="font-bold text-lg text-gray-900">Total USD</span>
                      <span className="font-extrabold text-xl text-purple-700">${grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-orange-50 -mx-6 px-6 py-3 rounded-xl">
                      <span className="font-bold text-orange-800">Total GDS</span>
                      <span className="font-extrabold text-xl text-orange-600">{formatGourdes(grandTotal)}</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center">Taux: 1 USD = {USD_TO_GDS_RATE} GDS</p>
                  </div>

                  {/* Auth check */}
                  {checkingAuth ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : !user ? (
                    /* Not logged in */
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200 text-center">
                      <LogIn className="text-blue-600 mx-auto mb-3" size={32} />
                      <h4 className="font-bold text-gray-900 mb-2">Connexion requise</h4>
                      <p className="text-gray-600 text-sm mb-4">Connectez-vous pour finaliser votre commande</p>
                      <div className="flex flex-col gap-2">
                        <Link href="/auth" className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition">
                          <LogIn size={18} /> Se connecter
                        </Link>
                        <Link href="/auth" className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-300 text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition">
                          <UserPlus size={18} /> Créer un compte
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Logged in - Payment buttons */
                    <div className="space-y-3">
                      <button onClick={() => setShowMonCashModal(true)} disabled={savingOrders}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                        <Wallet size={22} /> Payer avec MonCash
                      </button>

                      <button onClick={handleWhatsAppOrder} disabled={savingOrders}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                        {savingOrders ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <MessageCircle size={22} />
                        )}
                        Commander sur WhatsApp
                      </button>
                    </div>
                  )}

                  <Link href="/produits" className="block text-center text-gray-600 hover:text-purple-600 font-semibold py-2 transition text-sm">
                    Continuer mes achats
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MonCash Payment Modal */}
      {showMonCashModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3 text-white">
                <Wallet size={24} />
                <span className="font-bold text-lg">Paiement MonCash</span>
              </div>
              <button onClick={() => setShowMonCashModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Résumé ({cart.length} article{cart.length > 1 ? "s" : ""})</h4>
                {cartWithPricing.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600 truncate mr-2">{item.name} ×{item.qty}</span>
                    <span className="font-medium text-gray-900 flex-shrink-0">${item.breakdown.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-gray-200">
                  <span className="font-bold text-gray-900">Total USD</span>
                  <span className="font-extrabold text-lg text-gray-900">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-orange-100 -mx-4 px-4 py-2 rounded-lg mt-2">
                  <span className="text-orange-800 font-medium">Total en Gourdes</span>
                  <span className="font-extrabold text-xl text-orange-600">{formatGourdes(grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">Taux: 1 USD = {USD_TO_GDS_RATE} GDS</p>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Envoyez le montant via MonCash
                </h4>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-5">
                  <p className="text-sm text-gray-600 mb-2">Numéro MonCash:</p>
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-orange-200">
                    <span className="text-2xl font-bold text-orange-600 tracking-wider">{MONCASH_NUMBER}</span>
                    <button onClick={() => { navigator.clipboard.writeText(MONCASH_NUMBER); alert("Numéro copié!"); }}
                      className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm bg-orange-50 px-3 py-2 rounded-lg transition">
                      <Copy size={16} /> Copier
                    </button>
                  </div>
                  <div className="mt-3 bg-white rounded-lg p-3 border border-orange-200">
                    <p className="text-sm text-gray-700 font-medium">Montant à envoyer:</p>
                    <p className="text-2xl font-bold text-orange-600">{formatGourdes(grandTotal)}</p>
                    <p className="text-xs text-gray-500">(${grandTotal.toFixed(2)} USD)</p>
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 flex items-center gap-2 pt-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Confirmez votre paiement
                </h4>
                <p className="text-gray-600 text-sm">
                  Après avoir effectué le transfert MonCash, confirmez sur WhatsApp avec:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Votre nom complet</li>
                  <li>• Le numéro de transaction MonCash</li>
                  <li>• Capture d&apos;écran du paiement (optionnel)</li>
                </ul>

                <button onClick={handleMonCashConfirm} disabled={savingOrders}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50">
                  {savingOrders ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MessageCircle size={22} />
                  )}
                  J&apos;ai payé - Confirmer sur WhatsApp
                </button>

                <button onClick={() => setShowMonCashModal(false)} className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}