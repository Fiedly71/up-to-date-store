"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import { useCart } from "@/app/context/CartContext";
import { getPriceBreakdown, USD_TO_GDS_RATE, formatGourdes } from "@/app/utils/pricing";
import Link from "next/link";
import { Link2, ShoppingCart, CheckCircle, Package, Plus, Minus, AlertCircle, ShoppingBag, Globe, ArrowRight, MessageCircle, Trash2 } from "lucide-react";

const PLATFORMS = [
  { value: "aliexpress", label: "AliExpress", color: "bg-red-500 text-white", icon: "🛒" },
  { value: "shein", label: "Shein", color: "bg-black text-white", icon: "👗" },
  { value: "temu", label: "Temu", color: "bg-orange-500 text-white", icon: "🛍️" },
  { value: "amazon", label: "Amazon", color: "bg-yellow-400 text-black", icon: "📦" },
  { value: "alibaba", label: "Alibaba", color: "bg-orange-600 text-white", icon: "🏭" },
  { value: "ebay", label: "eBay", color: "bg-blue-500 text-white", icon: "🏷️" },
  { value: "other", label: "Autre", color: "bg-gray-600 text-white", icon: "🌐" },
];

function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("aliexpress")) return "aliexpress";
  if (lower.includes("shein.com") || lower.includes("shein.")) return "shein";
  if (lower.includes("temu.com") || lower.includes("temu.")) return "temu";
  if (lower.includes("amazon.com") || lower.includes("amazon.")) return "amazon";
  if (lower.includes("alibaba.com") || lower.includes("alibaba.")) return "alibaba";
  if (lower.includes("ebay.com") || lower.includes("ebay.")) return "ebay";
  return "";
}

interface ProductItem {
  id: string;
  url: string;
  name: string;
  price: string;
  quantity: number;
  color: string;
  size: string;
  notes: string;
}

function newProduct(): ProductItem {
  return { id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, url: "", name: "", price: "", quantity: 1, color: "", size: "", notes: "" };
}

export default function CommanderPage() {
  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState<ProductItem[]>([newProduct()]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [error, setError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  const updateProduct = (id: string, field: keyof ProductItem, value: string | number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addProduct = () => {
    setProducts(prev => [...prev, newProduct()]);
  };

  const removeProduct = (id: string) => {
    if (products.length <= 1) return;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const totalBase = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0) * p.quantity, 0);
  const breakdown = getPriceBreakdown(totalBase);

  const handleSubmit = () => {
    setError("");

    if (!selectedPlatform) {
      setError("Choisissez la plateforme sur laquelle vous avez trouvé le(s) produit(s).");
      return;
    }

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.url.trim()) {
        setError(`Produit ${i + 1}: Collez le lien du produit.`);
        return;
      }
      try { new URL(p.url.trim()); } catch {
        setError(`Produit ${i + 1}: Le lien n'est pas valide.`);
        return;
      }
      if (!p.name.trim()) {
        setError(`Produit ${i + 1}: Décrivez le produit.`);
        return;
      }
    }

    const source = selectedPlatform;
    products.forEach(p => {
      const uniqueId = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      addToCart({
        id: uniqueId,
        name: p.name.trim(),
        image: "",
        price: parseFloat(p.price) || undefined,
        url: p.url.trim(),
        color: p.color.trim(),
        size: p.size.trim(),
        notes: p.notes.trim(),
        source,
      }, p.quantity);
    });

    setAddedToCart(true);
    setTimeout(() => {
      setProducts([newProduct()]);
      setSelectedPlatform("");
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
            Vous avez trouvé un produit sur <strong>AliExpress</strong>, <strong>Shein</strong>, <strong>Temu</strong>, <strong>Amazon</strong> ou un autre site ?
            <span className="block mt-1">Collez le lien ici et nous nous occupons de tout !</span>
          </p>

          {/* Supported sites badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {PLATFORMS.map(p => (
              <span key={p.value} className={`${p.color} px-4 py-1.5 rounded-full text-sm font-bold shadow`}>
                {p.icon} {p.label}
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
              { step: "1", title: "Choisissez", desc: "Sélectionnez la plateforme (Shein, Temu, Amazon...)", emoji: "🎯" },
              { step: "2", title: "Collez", desc: "Copiez le lien du produit et collez-le ici", emoji: "📋" },
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

                {/* Step 1: Platform selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold mr-2">1</span>
                    Sur quel site avez-vous trouvé le(s) produit(s) ? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 ml-8">
                    {PLATFORMS.map(p => (
                      <button key={p.value} type="button" onClick={() => { setSelectedPlatform(p.value); setError(""); }}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          selectedPlatform === p.value
                            ? `${p.color} ring-2 ring-offset-1 ring-purple-400 shadow-md border-transparent`
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}>
                        <span>{p.icon}</span> {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Products */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold mr-2">2</span>
                    Produit(s) à commander <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-4 ml-8">
                    {products.map((product, idx) => (
                      <div key={product.id} className="border-2 border-gray-200 rounded-xl p-4 space-y-3 relative bg-gray-50/50">
                        {/* Product header */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-purple-700">Produit {idx + 1}</span>
                          {products.length > 1 && (
                            <button onClick={() => removeProduct(product.id)} className="text-red-400 hover:text-red-600 transition p-1">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        {/* Link */}
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="url"
                            value={product.url}
                            onChange={(e) => {
                              updateProduct(product.id, "url", e.target.value);
                              setError("");
                              const detected = detectPlatform(e.target.value);
                              if (detected) setSelectedPlatform(detected);
                            }}
                            placeholder="Lien du produit *"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm"
                          />
                        </div>

                        {/* Name */}
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => { updateProduct(product.id, "name", e.target.value); setError(""); }}
                          placeholder="Nom / Description du produit *"
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm"
                        />

                        {/* Price, Color, Size, Quantity row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={product.price}
                              onChange={(e) => updateProduct(product.id, "price", e.target.value)}
                              placeholder="Prix"
                              className="w-full pl-7 pr-2 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            value={product.color}
                            onChange={(e) => updateProduct(product.id, "color", e.target.value)}
                            placeholder="Couleur"
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm"
                          />
                          <input
                            type="text"
                            value={product.size}
                            onChange={(e) => updateProduct(product.id, "size", e.target.value)}
                            placeholder="Taille"
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm"
                          />
                          <div className="flex items-center gap-1 justify-center">
                            <button onClick={() => updateProduct(product.id, "quantity", Math.max(1, product.quantity - 1))}
                              className="w-8 h-8 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm">
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-gray-900">{product.quantity}</span>
                            <button onClick={() => updateProduct(product.id, "quantity", Math.min(99, product.quantity + 1))}
                              className="w-8 h-8 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Notes */}
                        <textarea
                          value={product.notes}
                          onChange={(e) => updateProduct(product.id, "notes", e.target.value)}
                          placeholder="Notes (optionnel)"
                          className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm resize-none"
                          rows={1}
                        />
                      </div>
                    ))}

                    {/* Add another product */}
                    <button onClick={addProduct} type="button"
                      className="w-full py-3 rounded-xl border-2 border-dashed border-purple-300 text-purple-600 font-bold hover:bg-purple-50 transition flex items-center justify-center gap-2 text-sm">
                      <Plus size={18} />
                      Ajouter un autre produit
                    </button>
                  </div>
                </div>

                {/* Price preview */}
                {totalBase > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">💰 Estimation du prix ({products.length} produit{products.length > 1 ? "s" : ""})</h4>
                    <div className="space-y-1 text-sm">
                      {products.map((p, i) => {
                        const pPrice = (parseFloat(p.price) || 0) * p.quantity;
                        return pPrice > 0 ? (
                          <div key={p.id} className="flex justify-between text-gray-600">
                            <span className="truncate mr-2">{p.name || `Produit ${i + 1}`} (×{p.quantity})</span>
                            <span className="flex-shrink-0">${pPrice.toFixed(2)}</span>
                          </div>
                        ) : null;
                      })}
                      <div className="flex justify-between text-gray-600 pt-1 border-t border-purple-200">
                        <span>Sous-total</span>
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
