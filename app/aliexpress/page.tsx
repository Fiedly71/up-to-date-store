"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, ExternalLink, MessageCircle, Sparkles, Filter, Package, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getPriceBreakdown } from "@/app/utils/pricing";
import Link from "next/link";

interface AliExpressProduct {
  product_id?: string;
  product_title?: string;
  product_main_image_url?: string;
  app_sale_price?: string;
  app_sale_price_currency?: string;
  original_price?: string;
  product_detail_url?: string;
  evaluate_rate?: string;
  total_order_num?: number;
}

export default function AliExpressPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<AliExpressProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AliExpressProduct | null>(null);

  // Popular search suggestions
  const popularSearches = [
    "iPhone case", "Écouteurs Bluetooth", "LED lights", "Smartwatch",
    "USB-C cable", "Power bank", "Ring light", "Webcam"
  ];

  // Read search query from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      if (search) {
        setSearchQuery(search);
        handleSearch(search);
      }
    }
  }, []);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setError("Veuillez entrer un mot-clé de recherche.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);
    setSelectedProduct(null);

    try {
      const response = await fetch(`https://ali-express1.p.rapidapi.com/search?query=${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY ?? "",
          "X-RapidAPI-Host": "ali-express1.p.rapidapi.com",
        } as HeadersInit,
      });

      const data = await response.json();
      setProducts(data.docs || []);
      
      if (!data.docs || data.docs.length === 0) {
        setError("Aucun produit trouvé. Essayez un autre mot-clé.");
      }
    } catch (err) {
      setError("Erreur lors de la recherche. Veuillez réessayer.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (price: string): { basePrice: number; fee: number; total: number } => {
    const basePrice = parseFloat(price) || 0;
    const breakdown = getPriceBreakdown(basePrice);
    return {
      basePrice,
      fee: breakdown.fee,
      total: breakdown.total
    };
  };

  const handleOrderProduct = (product: AliExpressProduct) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <style>{`
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(20px, -50px) scale(1.1); } 50% { transform: translate(-20px, 20px) scale(0.9); } 75% { transform: translate(50px, 50px) scale(1.05); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-64 h-64 bg-red-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
              AliExpress
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Trouvez n'importe quel produit sur AliExpress et nous nous occupons de tout ! 
            <span className="block mt-2 font-semibold">Paiement local • Livraison à Champin • Service complet</span>
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Recherchez un produit AliExpress..."
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-white/30 focus:border-white text-lg text-gray-900 bg-white placeholder-gray-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
              >
                <Search size={22} />
                <span className="hidden sm:inline">Rechercher</span>
              </button>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {popularSearches.map((term, idx) => (
              <button
                key={idx}
                onClick={() => { setSearchQuery(term); handleSearch(term); }}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all duration-300"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Recherchez", desc: "Trouvez le produit souhaité" },
              { step: "2", title: "Commandez", desc: "Cliquez sur 'Commander via Up-to-date'" },
              { step: "3", title: "Payez", desc: "Payez en Gourdes ou via MonCash" },
              { step: "4", title: "Recevez", desc: "Récupérez à Champin sous 3-5 jours" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">Recherche en cours sur AliExpress...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-red-500" size={40} />
              </div>
              <p className="text-lg font-semibold text-red-600 mb-4">{error}</p>
              <p className="text-gray-600">Essayez avec d'autres mots-clés comme "écouteurs", "montre", "lumière LED"...</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && products.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  <span className="gradient-text">{products.length} produits trouvés</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, idx) => {
                  const priceInfo = calculateTotalPrice(product.app_sale_price || "0");
                  return (
                    <div 
                      key={product.product_id || idx}
                      className="premium-card rounded-2xl overflow-hidden flex flex-col group"
                    >
                      {/* Product Image */}
                      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {product.product_main_image_url && (
                          <img
                            src={product.product_main_image_url}
                            alt={product.product_title}
                            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        {/* AliExpress Badge */}
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          AliExpress
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex flex-col flex-grow bg-white">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[40px]">
                          {product.product_title}
                        </h3>
                        
                        {/* Prices */}
                        <div className="mb-4 space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-500">Prix AliExpress:</span>
                            <span className="text-sm font-medium text-gray-700">${priceInfo.basePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-500">+ Frais service:</span>
                            <span className="text-sm font-medium text-orange-600">${priceInfo.fee.toFixed(2)}</span>
                          </div>
                          <div className="flex items-baseline gap-2 pt-1 border-t border-gray-100">
                            <span className="text-sm font-bold text-gray-900">Total:</span>
                            <span className="text-lg font-bold text-purple-700">${priceInfo.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto flex flex-col gap-2">
                          <button
                            onClick={() => handleOrderProduct(product)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={16} />
                            Commander via Up-to-date
                          </button>
                          <a
                            href={product.product_detail_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-xs hover:border-orange-500 hover:text-orange-500 transition-all duration-300 flex items-center justify-center gap-1"
                          >
                            <ExternalLink size={14} />
                            Voir sur AliExpress
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Initial State */}
          {!loading && !hasSearched && products.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-orange-500" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Commencez votre recherche</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Entrez le nom d'un produit ci-dessus et nous vous montrerons les meilleures offres AliExpress.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                {selectedProduct.product_main_image_url && (
                  <img
                    src={selectedProduct.product_main_image_url}
                    alt={selectedProduct.product_title}
                    className="w-24 h-24 object-contain rounded-xl bg-gray-100"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2">
                    {selectedProduct.product_title}
                  </h3>
                  <div className="text-2xl font-extrabold text-purple-700">
                    ${calculateTotalPrice(selectedProduct.app_sale_price || "0").total.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Détail du prix</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix du produit</span>
                    <span className="font-semibold">${parseFloat(selectedProduct.app_sale_price || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de service Up-to-date</span>
                    <span className="font-semibold text-orange-600">${calculateTotalPrice(selectedProduct.app_sale_price || "0").fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold">Total à payer</span>
                    <span className="font-bold text-purple-700">${calculateTotalPrice(selectedProduct.app_sale_price || "0").total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-green-50 rounded-2xl p-4 mb-6">
                <h4 className="font-bold text-green-800 mb-2">Comment commander ?</h4>
                <ol className="text-sm text-green-700 space-y-2">
                  <li>1. Cliquez sur le bouton WhatsApp ci-dessous</li>
                  <li>2. Envoyez-nous le lien du produit</li>
                  <li>3. Nous confirmons le prix total et la disponibilité</li>
                  <li>4. Payez via MonCash, cash ou carte</li>
                  <li>5. Récupérez votre colis à Champin (3-5 jours)</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/50932836938?text=${encodeURIComponent(`Bonjour! Je souhaite commander ce produit AliExpress:\n\n📦 ${selectedProduct.product_title}\n💵 Prix total: $${calculateTotalPrice(selectedProduct.app_sale_price || "0").total.toFixed(2)}\n🔗 ${selectedProduct.product_detail_url}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <MessageCircle size={24} />
                  Commander sur WhatsApp
                </a>
                <button
                  onClick={closeModal}
                  className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Besoin d'aide pour votre commande ?</h2>
          <p className="text-white/90 text-lg mb-8">
            Notre équipe est disponible sur WhatsApp pour vous accompagner dans vos achats AliExpress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/50932836938"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle size={24} />
              Nous contacter
            </a>
            <Link
              href="/produits"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              <ShoppingCart size={24} />
              Voir nos produits en stock
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
