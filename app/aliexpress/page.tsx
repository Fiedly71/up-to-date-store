"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Link2, ShoppingCart, ExternalLink, MessageCircle, Sparkles, Package, CheckCircle, AlertCircle, Star, Shield, Truck, Clock, ArrowRight, Wallet, X, Copy } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getPriceBreakdown, USD_TO_GDS_RATE, formatGourdes } from "@/app/utils/pricing";
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

// Wrapper component that uses useSearchParams
function SearchParamsHandler({ onSearch }: { onSearch: (query: string) => void }) {
  const searchParams = useSearchParams();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch && !handled) {
      setHandled(true);
      onSearch(urlSearch);
    }
  }, [searchParams, handled, onSearch]);

  return null;
}

function AliExpressContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"search" | "link">("search");
  const [hasSearched, setHasSearched] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderColor, setOrderColor] = useState("");
  const [orderSize, setOrderSize] = useState("");
  const [showMonCashModal, setShowMonCashModal] = useState(false);

  const MONCASH_NUMBER = "39934388";

  const popularSearches = ["iPhone case", "Écouteurs Bluetooth", "LED lights", "Smartwatch", "USB-C cable", "Power bank"];
  const commonColors = ["Noir", "Blanc", "Rouge", "Bleu", "Rose", "Vert"];
  const commonSizes = ["S", "M", "L", "XL", "XXL", "Unique"];

  // Handle search from URL parameter (called by SearchParamsHandler)
  const handleSearchFromUrl = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setSearchQuery(searchTerm);
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
        setError("Erreur API. Veuillez réessayer plus tard.");
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
    // Reset order options when viewing a new product
    setOrderQuantity(1);
    setOrderNotes("");
    setOrderColor("");
    setOrderSize("");

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
      
      {/* Handle URL search params */}
      <Suspense fallback={null}>
        <SearchParamsHandler onSearch={handleSearchFromUrl} />
      </Suspense>
      
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
            <div className="max-w-5xl mx-auto">
              <button
                onClick={() => setSelectedProduct(null)}
                className="mb-6 text-purple-600 font-semibold hover:text-purple-800 flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg"
              >
                <ArrowRight className="rotate-180" size={18} />
                Retour aux résultats
              </button>
              
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} />
                      <span className="font-semibold">Produit trouvé sur AliExpress</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                      <Shield size={16} />
                      <span className="text-sm font-medium">Achat sécurisé</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Product Image */}
                    <div className="lg:w-1/2">
                      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-square shadow-lg">
                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                          <img
                            src={selectedProduct.images[0].startsWith("//") ? `https:${selectedProduct.images[0]}` : selectedProduct.images[0]}
                            alt={selectedProduct.title}
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="text-gray-300" size={80} />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          AliExpress
                        </div>
                      </div>
                      
                      {/* Trust Badges */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <Truck className="mx-auto text-blue-600 mb-1" size={20} />
                          <p className="text-xs text-gray-600 font-medium">7-15 jours</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <Shield className="mx-auto text-green-600 mb-1" size={20} />
                          <p className="text-xs text-gray-600 font-medium">Garanti</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <Star className="mx-auto text-yellow-500 mb-1" size={20} />
                          <p className="text-xs text-gray-600 font-medium">Top qualité</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Info & Order Form */}
                    <div className="lg:w-1/2 flex flex-col">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 leading-tight">
                        {selectedProduct.title}
                      </h2>

                      {/* Ratings */}
                      <div className="flex flex-wrap gap-4 mb-6 text-sm">
                        {selectedProduct.ratings && (
                          <span className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                            <Star className="text-yellow-500" size={16} fill="currentColor" />
                            <span className="font-semibold text-yellow-700">{selectedProduct.ratings.toFixed(1)}</span>
                          </span>
                        )}
                        {selectedProduct.reviews && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">{selectedProduct.reviews} avis</span>
                        )}
                        {selectedProduct.orders && (
                          <span className="bg-green-50 px-3 py-1 rounded-full text-green-700 font-medium">{selectedProduct.orders}+ vendus</span>
                        )}
                      </div>

                      {/* Order Options */}
                      <div className="space-y-4 mb-6">
                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Quantité</label>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                              className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold text-lg"
                            >
                              -
                            </button>
                            <span className="w-16 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg font-bold text-lg">
                              {orderQuantity}
                            </span>
                            <button
                              onClick={() => setOrderQuantity(Math.min(99, orderQuantity + 1))}
                              className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold text-lg"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Color Selection */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Couleur (optionnel)</label>
                          <div className="flex flex-wrap gap-2">
                            {commonColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => setOrderColor(orderColor === color ? "" : color)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  orderColor === color
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Size Selection */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Taille (optionnel)</label>
                          <div className="flex flex-wrap gap-2">
                            {commonSizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => setOrderSize(orderSize === size ? "" : size)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  orderSize === size
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Notes supplémentaires (optionnel)</label>
                          <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="Ex: Précisez la couleur exacte, variante, ou toute demande spéciale..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none resize-none text-gray-700"
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-5 mb-6 border border-purple-100">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <ShoppingCart size={18} className="text-purple-600" />
                          Récapitulatif
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Taux: 1 USD = {USD_TO_GDS_RATE} GDS</p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Prix unitaire</span>
                            <span className="font-medium">${selectedProduct.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Quantité</span>
                            <span className="font-medium">× {orderQuantity}</span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Sous-total produit</span>
                            <span className="font-semibold">${(selectedProduct.price * orderQuantity).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-orange-600">
                            <span>Frais de service</span>
                            <span className="font-semibold">${calculateTotalPrice(selectedProduct.price * orderQuantity).fee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t-2 border-purple-200">
                            <span className="font-bold text-lg text-gray-900">Total USD</span>
                            <span className="font-extrabold text-xl text-purple-700">
                              ${calculateTotalPrice(selectedProduct.price * orderQuantity).total.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-orange-100 -mx-5 px-5 py-3 rounded-b-xl">
                            <span className="font-bold text-lg text-orange-800">Total en Gourdes</span>
                            <span className="font-extrabold text-2xl text-orange-600">
                              {formatGourdes(calculateTotalPrice(selectedProduct.price * orderQuantity).total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {/* MonCash Payment */}
                        <button
                          onClick={() => setShowMonCashModal(true)}
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02]"
                        >
                          <Wallet size={24} />
                          Payer avec MonCash
                        </button>
                        
                        {/* WhatsApp Order */}
                        <a
                          href={`https://wa.me/50932836938?text=${encodeURIComponent(
`🛒 *NOUVELLE COMMANDE ALIEXPRESS*

📦 *Produit:* ${selectedProduct.title}

📊 *Détails de la commande:*
• Quantité: ${orderQuantity}${orderColor ? `\n• Couleur: ${orderColor}` : ''}${orderSize ? `\n• Taille: ${orderSize}` : ''}${orderNotes ? `\n• Notes: ${orderNotes}` : ''}

💰 *Prix:*
• Prix unitaire: $${selectedProduct.price.toFixed(2)}
• Sous-total: $${(selectedProduct.price * orderQuantity).toFixed(2)}
• Frais de service: $${calculateTotalPrice(selectedProduct.price * orderQuantity).fee.toFixed(2)}
• *TOTAL USD: $${calculateTotalPrice(selectedProduct.price * orderQuantity).total.toFixed(2)}*
• *TOTAL GDS: ${formatGourdes(calculateTotalPrice(selectedProduct.price * orderQuantity).total)}*
_(Taux: 1 USD = ${USD_TO_GDS_RATE} GDS)_

🔗 *Lien du produit:*
${selectedProduct.url}

Merci de confirmer ma commande!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02]"
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

                  {/* Next Steps */}
                  <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                      <Clock size={20} />
                      Prochaines étapes après votre commande
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { step: "1", title: "Confirmez", desc: "Via WhatsApp avec notre équipe" },
                        { step: "2", title: "Payez", desc: "MonCash, Cash ou Carte" },
                        { step: "3", title: "Suivez", desc: "Recevez votre numéro de tracking" },
                        { step: "4", title: "Récupérez", desc: "À Champin en 7-15 jours" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {item.step}
                          </div>
                          <div>
                            <p className="font-semibold text-green-800">{item.title}</p>
                            <p className="text-sm text-green-600">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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

      {/* MonCash Payment Modal */}
      {showMonCashModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3 text-white">
                <Wallet size={24} />
                <span className="font-bold text-lg">Paiement MonCash</span>
              </div>
              <button
                onClick={() => setShowMonCashModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Résumé de la commande</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{selectedProduct.title}</p>
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total USD:</span>
                    <span className="font-bold text-lg text-gray-900">
                      ${calculateTotalPrice(selectedProduct.price * orderQuantity).total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-orange-100 -mx-4 px-4 py-2 rounded-lg">
                    <span className="text-orange-800 font-medium">Total en Gourdes:</span>
                    <span className="font-extrabold text-xl text-orange-600">
                      {formatGourdes(calculateTotalPrice(selectedProduct.price * orderQuantity).total)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">Taux: 1 USD = {USD_TO_GDS_RATE} GDS</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Envoyez le montant via MonCash
                </h4>
                
                {/* MonCash Number Box */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-5">
                  <p className="text-sm text-gray-600 mb-2">Numéro MonCash:</p>
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-orange-200">
                    <span className="text-2xl font-bold text-orange-600 tracking-wider">{MONCASH_NUMBER}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(MONCASH_NUMBER);
                        alert("Numéro copié!");
                      }}
                      className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Copy size={16} />
                      Copier
                    </button>
                  </div>
                  <div className="mt-3 bg-white rounded-lg p-3 border border-orange-200">
                    <p className="text-sm text-gray-700 font-medium">Montant à envoyer:</p>
                    <p className="text-2xl font-bold text-orange-600">{formatGourdes(calculateTotalPrice(selectedProduct.price * orderQuantity).total)}</p>
                    <p className="text-xs text-gray-500">(${calculateTotalPrice(selectedProduct.price * orderQuantity).total.toFixed(2)} USD)</p>
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 flex items-center gap-2 pt-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Confirmez votre paiement
                </h4>
                
                <p className="text-gray-600 text-sm">
                  Après avoir effectué le transfert MonCash, envoyez-nous une confirmation sur WhatsApp avec:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Votre nom complet</li>
                  <li>• Le numéro de transaction MonCash</li>
                  <li>• Capture d&apos;écran du paiement (optionnel)</li>
                </ul>

                {/* Confirm Button */}
                <a
                  href={`https://wa.me/50932836938?text=${encodeURIComponent(
`💳 *PAIEMENT MONCASH EFFECTUÉ*

📦 *Commande:* ${selectedProduct.title}

📊 *Détails:*
• Quantité: ${orderQuantity}${orderColor ? `\n• Couleur: ${orderColor}` : ''}${orderSize ? `\n• Taille: ${orderSize}` : ''}${orderNotes ? `\n• Notes: ${orderNotes}` : ''}

💰 *Montant payé:*
• USD: $${calculateTotalPrice(selectedProduct.price * orderQuantity).total.toFixed(2)}
• GDS: ${formatGourdes(calculateTotalPrice(selectedProduct.price * orderQuantity).total)}

📱 *Envoyé au:* ${MONCASH_NUMBER}

🔗 *Produit:* ${selectedProduct.url}

⏳ J'attends la confirmation de mon paiement. Merci!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  <MessageCircle size={22} />
                  J&apos;ai payé - Confirmer sur WhatsApp
                </a>

                <button
                  onClick={() => setShowMonCashModal(false)}
                  className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-all"
                >
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

// Default export with Suspense wrapper for useSearchParams
export default function AliExpressPage() {
  return <AliExpressContent />;
}
