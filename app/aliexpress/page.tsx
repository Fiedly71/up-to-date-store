"use client";

import { useState } from "react";
import { Search, Link2, ShoppingCart, ExternalLink, MessageCircle, Sparkles, Package, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getPriceBreakdown } from "@/app/utils/pricing";
import Link from "next/link";

interface SearchProduct {
  itemId: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  sales?: string;
  url: string;
}

interface ProductDetails {
  itemId: string;
  title: string;
  images: string[];
  price: number;
  originalPrice?: number;
  currency: string;
  available: boolean;
  shipping?: string;
  ratings?: number;
  reviews?: number;
  orders?: number;
  url: string;
}

export default function AliExpressPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"search" | "link">("search");
  const [hasSearched, setHasSearched] = useState(false);

  const popularSearches = ["iPhone case", "Écouteurs Bluetooth", "LED lights", "Smartwatch", "USB-C cable", "Power bank"];

  // Search products by keyword
  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setError("Veuillez entrer un mot-clé de recherche.");
      return;
    }

    setLoading(true);
    setError("");
    setSearchResults([]);
    setSelectedProduct(null);
    setHasSearched(true);

    try {
      const response = await fetch(`https://aliexpress-datahub.p.rapidapi.com/item_search_2?q=${encodeURIComponent(searchTerm)}&page=1`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY ?? "",
          "X-RapidAPI-Host": "aliexpress-datahub.p.rapidapi.com",
        },
      });

      const data = await response.json();
      
      if (data.message && data.message.includes("not subscribed")) {
        setError("Erreur API. Veuillez vous abonner au plan sur RapidAPI.");
        return;
      }

      if (!data.result?.resultList || data.result.resultList.length === 0) {
        setError("Aucun produit trouvé. Essayez un autre mot-clé.");
        return;
      }

      const products: SearchProduct[] = data.result.resultList.map((item: any) => {
        const product = item.item;
        let price = 0;
        if (product.sku?.def?.promotionPrice) {
          price = parseFloat(product.sku.def.promotionPrice);
        } else if (product.sku?.def?.price) {
          price = parseFloat(product.sku.def.price);
        }
        
        return {
          itemId: product.itemId,
          title: product.title,
          image: product.image?.startsWith("//") ? `https:${product.image}` : product.image,
          price: price,
          originalPrice: product.sku?.def?.price ? parseFloat(product.sku.def.price) : undefined,
          sales: product.sales,
          url: `https://www.aliexpress.com/item/${product.itemId}.html`
        };
      });

      setSearchResults(products);
    } catch (err) {
      console.error("API Error:", err);
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  };

  // Get product details by ID
  const getProductDetails = async (itemId: string, url: string) => {
    setLoadingDetails(true);
    setError("");

    try {
      const response = await fetch(`https://aliexpress-datahub.p.rapidapi.com/item_detail_2?itemId=${itemId}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY ?? "",
          "X-RapidAPI-Host": "aliexpress-datahub.p.rapidapi.com",
        },
      });

      const data = await response.json();
      
      if (!data.result || !data.result.item) {
        setError("Impossible de charger les détails du produit.");
        return;
      }

      const item = data.result.item;
      
      let price = 0;
      if (item.sku?.def?.promotionPrice) {
        price = parseFloat(item.sku.def.promotionPrice);
      } else if (item.sku?.def?.price) {
        price = parseFloat(item.sku.def.price);
      } else if (item.price) {
        price = parseFloat(item.price);
      }

      const productDetails: ProductDetails = {
        itemId: itemId,
        title: item.title || "Produit AliExpress",
        images: item.images || [],
        price: price,
        originalPrice: item.sku?.def?.originalPrice ? parseFloat(item.sku.def.originalPrice) : undefined,
        currency: data.result.settings?.currency || "USD",
        available: item.available !== false,
        ratings: item.averageStarRate,
        reviews: item.totalReviews,
        orders: item.sales,
        url: url
      };

      setSelectedProduct(productDetails);
    } catch (err) {
      console.error("API Error:", err);
      setError("Erreur de connexion.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Extract item ID from AliExpress URL
  const extractItemId = (url: string): string | null => {
    const patterns = [
      /aliexpress\.[a-z]+\/item\/(\d+)/i,
      /item\/(\d+)\.html/i,
      /\/(\d{10,20})(?:\.html|\?|$)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  // Handle link paste
  const handleLinkSubmit = async () => {
    if (!productUrl.trim()) {
      setError("Veuillez coller un lien AliExpress.");
      return;
    }

    const itemId = extractItemId(productUrl);
    if (!itemId) {
      setError("Lien invalide. Copiez le lien complet depuis AliExpress.");
      return;
    }

    await getProductDetails(itemId, productUrl);
  };

  const calculateTotalPrice = (price: number) => {
    const breakdown = getPriceBreakdown(price);
    return { basePrice: price, fee: breakdown.fee, total: breakdown.total };
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
            Trouvez n'importe quel produit et nous nous occupons de tout !
            <span className="block mt-2 font-semibold">Paiement local • Livraison à Champin • Service complet</span>
          </p>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 flex gap-1">
              <button
                onClick={() => { setMode("search"); setError(""); setSelectedProduct(null); }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${mode === "search" ? "bg-white text-orange-600 shadow-md" : "text-white hover:bg-white/10"}`}
              >
                <Search size={18} className="inline mr-2" />
                Rechercher
              </button>
              <button
                onClick={() => { setMode("link"); setError(""); setSearchResults([]); }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${mode === "link" ? "bg-white text-orange-600 shadow-md" : "text-white hover:bg-white/10"}`}
              >
                <Link2 size={18} className="inline mr-2" />
                Coller un lien
              </button>
            </div>
          </div>

          {/* Search Form */}
          {mode === "search" && (
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="max-w-2xl mx-auto">
              <div className="relative flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Recherchez un produit (ex: écouteurs bluetooth)..."
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-white/30 focus:border-white text-lg text-gray-900 bg-white placeholder-gray-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Search size={22} />
                      <span>Rechercher</span>
                    </>
                  )}
                </button>
              </div>
              {/* Popular Searches */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {popularSearches.map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSearchQuery(term); handleSearch(term); }}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          )}

          {/* Link Form */}
          {mode === "link" && (
            <form onSubmit={(e) => { e.preventDefault(); handleLinkSubmit(); }} className="max-w-2xl mx-auto">
              <div className="relative flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                  <input
                    type="text"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="Collez le lien AliExpress ici..."
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-white/30 focus:border-white text-lg text-gray-900 bg-white placeholder-gray-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingDetails}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingDetails ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle size={22} />
                      <span>Vérifier</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Recherchez", desc: "Trouvez le produit souhaité" },
              { step: "2", title: "Sélectionnez", desc: "Cliquez sur le produit" },
              { step: "3", title: "Commandez", desc: "Contactez-nous via WhatsApp" },
              { step: "4", title: "Recevez", desc: "Récupérez à Champin (7-15 jours)" },
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
          {(loading || loadingDetails) && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">
                {loading ? "Recherche en cours..." : "Chargement du produit..."}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && !loadingDetails && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-500" size={40} />
              </div>
              <p className="text-lg font-semibold text-red-600 mb-4">{error}</p>
            </div>
          )}

          {/* Search Results Grid */}
          {!loading && !loadingDetails && searchResults.length > 0 && !selectedProduct && (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchResults.length} produits trouvés
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((product, idx) => {
                  const priceInfo = calculateTotalPrice(product.price);
                  return (
                    <div 
                      key={product.itemId || idx}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => getProductDetails(product.itemId, product.url)}
                    >
                      {/* Product Image */}
                      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          AliExpress
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[40px]">
                          {product.title}
                        </h3>
                        
                        {product.sales && (
                          <p className="text-xs text-gray-500 mb-2">{product.sales} vendus</p>
                        )}
                        
                        {/* Prices */}
                        <div className="mb-4 space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-500">Prix:</span>
                            <span className="text-sm font-medium text-gray-700">${product.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-baseline gap-2 pt-1 border-t border-gray-100">
                            <span className="text-sm font-bold text-gray-900">Total:</span>
                            <span className="text-lg font-bold text-purple-700">${priceInfo.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <button
                          className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm shadow-md hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={16} />
                          Voir détails
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Selected Product Details */}
          {!loading && !loadingDetails && selectedProduct && (
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedProduct(null)}
                className="mb-6 text-purple-600 font-semibold hover:text-purple-800 flex items-center gap-2"
              >
                ← Retour aux résultats
              </button>
              
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Produit trouvé sur AliExpress</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                      <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                          <img
                            src={selectedProduct.images[0].startsWith("//") ? `https:${selectedProduct.images[0]}` : selectedProduct.images[0]}
                            alt={selectedProduct.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="text-gray-300" size={80} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:w-1/2 flex flex-col">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 leading-tight">
                        {selectedProduct.title}
                      </h2>

                      <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                        {selectedProduct.ratings && (
                          <span className="flex items-center gap-1">⭐ {selectedProduct.ratings.toFixed(1)}</span>
                        )}
                        {selectedProduct.reviews && <span>{selectedProduct.reviews} avis</span>}
                        {selectedProduct.orders && <span>{selectedProduct.orders}+ vendus</span>}
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 mb-6">
                        <h3 className="font-bold text-gray-900 mb-4">Détail du prix</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Prix AliExpress</span>
                            <span className="font-semibold text-lg">${selectedProduct.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Frais de service</span>
                            <span className="font-semibold text-orange-600">${calculateTotalPrice(selectedProduct.price).fee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t-2 border-purple-200">
                            <span className="font-bold text-lg text-gray-900">Total à payer</span>
                            <span className="font-extrabold text-2xl text-purple-700">
                              ${calculateTotalPrice(selectedProduct.price).total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mt-auto">
                        <a
                          href={`https://wa.me/50932836938?text=${encodeURIComponent(`Bonjour! Je souhaite commander ce produit AliExpress:\n\n📦 ${selectedProduct.title}\n💵 Prix total: $${calculateTotalPrice(selectedProduct.price).total.toFixed(2)}\n🔗 ${selectedProduct.url}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3"
                        >
                          <MessageCircle size={24} />
                          Commander sur WhatsApp
                        </a>
                        <a
                          href={selectedProduct.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={18} />
                          Voir sur AliExpress
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-green-50 rounded-2xl p-5">
                    <h4 className="font-bold text-green-800 mb-3">📦 Prochaines étapes</h4>
                    <ol className="text-sm text-green-700 space-y-2">
                      <li>1. Cliquez sur "Commander sur WhatsApp"</li>
                      <li>2. Confirmez votre commande avec notre équipe</li>
                      <li>3. Payez via MonCash, cash ou carte bancaire</li>
                      <li>4. Récupérez votre colis à Champin (délai: 7-15 jours)</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!loading && !loadingDetails && searchResults.length === 0 && !selectedProduct && !error && !hasSearched && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-orange-500" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Recherchez un produit</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Tapez le nom d'un produit ci-dessus ou utilisez les suggestions populaires.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Besoin d'aide ?</h2>
          <p className="text-white/90 text-lg mb-8">
            Notre équipe est disponible sur WhatsApp pour vous accompagner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/50932836938"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <MessageCircle size={24} />
              Nous contacter
            </a>
            <Link
              href="/produits"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
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
