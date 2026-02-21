"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import { useCart } from "@/app/context/CartContext";
import { getPriceBreakdown, USD_TO_GDS_RATE, formatGourdes } from "@/app/utils/pricing";
import Link from "next/link";
import { Link2, ShoppingCart, CheckCircle, Package, Plus, Minus, AlertCircle, ShoppingBag, Globe, ArrowRight, MessageCircle } from "lucide-react";

const SUPPORTED_SITES = [
  { name: "Shein", color: "bg-black text-white", icon: "👗", domain: "shein.com" },
  { name: "Temu", color: "bg-orange-500 text-white", icon: "🛍️", domain: "temu.com" },
  { name: "Amazon", color: "bg-yellow-400 text-black", icon: "📦", domain: "amazon.com" },
  { name: "Autre site", color: "bg-gray-600 text-white", icon: "🌐", domain: "" },
];

function detectSite(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("shein.com") || lower.includes("shein.")) return "Shein";
  if (lower.includes("temu.com") || lower.includes("temu.")) return "Temu";
  if (lower.includes("amazon.com") || lower.includes("amazon.")) return "Amazon";
  if (lower.includes("aliexpress")) return "AliExpress";
  return "Autre";
}

export default function CommanderPage() {
  const { addToCart, cart } = useCart();
  const [productUrl, setProductUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  const detectedSite = productUrl ? detectSite(productUrl) : "";
  const priceNum = parseFloat(productPrice) || 0;
  const totalBase = priceNum * quantity;
  const breakdown = getPriceBreakdown(totalBase);

  const handleSubmit = () => {
    setError("");

    if (!productUrl.trim()) {
      setError("Collez le lien du produit que vous voulez commander.");
      return;
    }

    try {
      new URL(productUrl.trim());
    } catch {
      setError("Ce lien n'est pas valide. Copiez le lien complet depuis le site.");
      return;
    }

    if (!productName.trim()) {
      setError("Décrivez le produit (ex: Robe noire taille M, Chaussures Nike 42...)");
      return;
    }

    const source = detectSite(productUrl).toLowerCase();
    const uniqueId = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    addToCart({
      id: uniqueId,
      name: productName.trim(),
      image: "",
      price: priceNum || undefined,
      url: productUrl.trim(),
      color: color.trim(),
      size: size.trim(),
      notes: notes.trim(),
      source,
    }, quantity);

    setAddedToCart(true);

    // Reset form after short delay
    setTimeout(() => {
      setProductUrl("");
      setProductName("");
      setProductPrice("");
      setQuantity(1);
      setColor("");
      setSize("");
      setNotes("");
    }, 300);
  };

  const resetForm = () => {
    setAddedToCart(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Globe className="text-white" size={28} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Commander un Produit</h1>
          </div>
          <p className="text-white/90 text-lg max-w-xl mx-auto">
            Vous avez trouvé un produit sur <strong>Shein</strong>, <strong>Temu</strong>, <strong>Amazon</strong> ou un autre site ?
            <span className="block mt-1">Collez le lien ici et nous nous occupons de tout !</span>
          </p>

          {/* Supported sites badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {SUPPORTED_SITES.map(site => (
              <span key={site.name} className={`${site.color} px-4 py-1.5 rounded-full text-sm font-bold shadow`}>
                {site.icon} {site.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Comment ça marche ?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { step: "1", title: "Trouvez", desc: "Trouvez le produit sur Shein, Temu, Amazon...", emoji: "🔍" },
              { step: "2", title: "Collez", desc: "Copiez le lien et collez-le ici", emoji: "📋" },
              { step: "3", title: "Décrivez", desc: "Ajoutez le nom, couleur, taille, prix", emoji: "✏️" },
              { step: "4", title: "Commandez", desc: "Ajoutez au panier et payez", emoji: "✅" },
            ].map((item) => (
              <div key={item.step} className="p-3">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">{item.step}</div>
                <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Form */}
      <section className="py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4">

          {addedToCart ? (
            /* Success */
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <CheckCircle className="text-green-500 mx-auto mb-4" size={56} />
              <h2 className="text-2xl font-bold text-green-800 mb-2">Produit ajouté au panier !</h2>
              <p className="text-gray-600 mb-6">
                Vous avez maintenant <strong>{cart.length}</strong> article{cart.length > 1 ? "s" : ""} dans votre panier.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/panier" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow">
                  <ShoppingCart size={20} /> Voir mon panier
                </Link>
                <button onClick={resetForm} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow">
                  <Plus size={20} /> Ajouter un autre produit
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <ShoppingBag size={22} />
                  Nouveau produit à commander
                </h2>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Step 1: Product link */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold mr-2">1</span>
                    Lien du produit <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2 ml-8">
                    Allez sur Shein, Temu, Amazon (ou autre) → trouvez le produit → copiez le lien → collez-le ici
                  </p>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="url"
                      value={productUrl}
                      onChange={(e) => { setProductUrl(e.target.value); setError(""); }}
                      placeholder="https://www.shein.com/... ou https://www.temu.com/..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700"
                    />
                  </div>
                  {detectedSite && (
                    <p className="text-xs mt-1.5 ml-8 text-purple-600 font-medium">
                      Site détecté : <strong>{detectedSite}</strong> ✓
                    </p>
                  )}
                </div>

                {/* Step 2: Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold mr-2">2</span>
                    Nom / Description du produit <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2 ml-8">
                    Décrivez bien le produit pour qu&apos;on puisse le trouver facilement
                  </p>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => { setProductName(e.target.value); setError(""); }}
                    placeholder="Ex: Robe longue noire avec fleurs, Taille L"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700"
                  />
                </div>

                {/* Step 3: Details */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold mr-2">3</span>
                    Détails du produit
                  </label>

                  <div className="space-y-3 ml-8">
                    {/* Price */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Prix en dollars USD (si visible sur le site)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Si vous ne connaissez pas le prix, laissez vide. Nous vous le donnerons.</p>
                    </div>

                    {/* Color & Size */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Couleur</label>
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          placeholder="Ex: Noir, Rouge..."
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Taille</label>
                        <input
                          type="text"
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          placeholder="Ex: M, L, 42..."
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm"
                        />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quantité</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-9 h-9 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-lg text-gray-900">{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(99, quantity + 1))}
                          className="w-9 h-9 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Notes supplémentaires</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Toute information utile : variante spécifique, instructions..."
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Price preview (only if price entered) */}
                {priceNum > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 ml-0">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">💰 Estimation du prix</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Prix : ${priceNum.toFixed(2)} × {quantity}</span>
                        <span>${totalBase.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <span>Frais de service</span>
                        <span>${breakdown.fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-purple-200">
                        <span>Total USD</span>
                        <span className="text-purple-700">${breakdown.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-orange-700 bg-orange-100 -mx-4 px-4 py-2 rounded-lg mt-1">
                        <span>Total GDS</span>
                        <span>{formatGourdes(breakdown.total)}</span>
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-1">1 USD = {USD_TO_GDS_RATE} GDS</p>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button onClick={handleSubmit}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-600 transition flex items-center justify-center gap-2">
                  <ShoppingCart size={22} />
                  Ajouter au panier
                </button>

                {/* Cart shortcut */}
                {cart.length > 0 && (
                  <Link href="/panier" className="block text-center text-purple-600 hover:text-purple-800 font-semibold text-sm py-2 transition">
                    <ShoppingCart size={16} className="inline mr-1" />
                    Voir mon panier ({cart.length} article{cart.length > 1 ? "s" : ""})
                    <ArrowRight size={14} className="inline ml-1" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={20} className="text-purple-600" />
              Informations importantes
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Paiement local :</strong> Payez en Gourdes via MonCash ou WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Livraison :</strong> Récupérez votre commande à Champin en 7-15 jours.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Prix :</strong> Si vous ne savez pas le prix, nous vous le communiquerons avant d&apos;acheter.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Aide :</strong> En cas de doute, contactez-nous sur WhatsApp !</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-gradient-to-r from-purple-600 to-pink-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Besoin d&apos;aide ?</h2>
          <p className="text-white/90 mb-6">Nous sommes disponibles pour vous aider à trouver et commander vos produits.</p>
          <a href="https://wa.me/50932836938" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition">
            <MessageCircle size={22} />
            Nous contacter sur WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
