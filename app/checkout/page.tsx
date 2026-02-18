"use client";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import Navbar from "@/app/components/Navbar";
import { ShoppingCart, Wallet, MessageCircle, CheckCircle, MapPin } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Products don't have prices in this version - using contact-based ordering
  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="max-w-2xl mx-auto py-20 px-4 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="text-gray-400" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8">Ajoutez des produits pour continuer</p>
          <Link
            href="/produits"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Voir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingCart className="text-purple-600" />
          Finaliser votre commande
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              Récapitulatif ({itemCount} article{itemCount > 1 ? 's' : ''})
            </h2>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantité: {item.quantity || 1}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                💡 <span className="font-semibold">Prix sur demande</span> - Contactez-nous via WhatsApp pour obtenir un devis personnalisé.
              </p>
            </div>
          </div>

          {/* Payment & Delivery Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vos informations</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Jean Pierre"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: 509 XX XX XXXX"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="text-purple-600" size={20} />
                Point de retrait
              </h3>
              <p className="text-gray-700">
                <span className="font-semibold">Up-to-date Electronic Store</span><br />
                Champin, Cap-Haïtien<br />
                <span className="text-sm text-gray-500">Lun-Sam: 9h - 18h</span>
              </p>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Commander</h2>
              
              <div className="space-y-3">
                {/* WhatsApp - Primary for products without prices */}
                <a
                  href={`https://wa.me/50932836938?text=${encodeURIComponent(
`🛒 *NOUVELLE COMMANDE*

👤 *Client:* ${customerName || "Non spécifié"}
📱 *Téléphone:* ${customerPhone || "Non spécifié"}

📦 *Produits demandés:*
${cart.map(item => `• ${item.name} (x${item.quantity || 1})`).join('\n')}

📍 *Retrait:* Champin, Cap-Haïtien

Merci de me confirmer les prix et la disponibilité!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle size={24} />
                  Demander un devis sur WhatsApp
                </a>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Options de paiement</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                    <Wallet className="mx-auto text-orange-500 mb-1" size={24} />
                    <p className="text-xs font-medium text-gray-700">MonCash</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                    <span className="text-2xl">💵</span>
                    <p className="text-xs font-medium text-gray-700">Cash</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="text-2xl">💳</span>
                    <p className="text-xs font-medium text-gray-700">Carte</p>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-500">
                  Le paiement se fait après confirmation du devis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
