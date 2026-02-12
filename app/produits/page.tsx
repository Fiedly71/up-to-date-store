"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, MessageCircle, Search, Sparkles } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useCart } from '../context/CartContext'; // Import correct

import { products as allProducts } from "../data/products";

const export default function Produits() {
  const [searchQuery, setSearchQuery] = useState("");
  const [productQuantities, setProductQuantities] = useState<{[key: number]: number}>({});
  
  // 1. ON PLACE LE HOOK ICI (à l'intérieur de la fonction)
  const { addToCart, removeFromCart } = useCart();

  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Persistance des quantités sélectionnées (page produits)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("selected-quantities");
      if (saved) setProductQuantities(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("selected-quantities", JSON.stringify(productQuantities));
    } catch {}
  }, [productQuantities]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <style>{`
        [data-nextjs-dialog] {
          display: none !important;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <Navbar />

      <section className="py-16 sm:py-24 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                <Sparkles className="text-white" size={32} />
              </div>
              <h2 className="text-4xl sm:text-6xl font-extrabold">
                <span className="gradient-text">Nos Produits</span>
              </h2>
            </div>
            <p className="text-lg sm:text-xl text-gray-700 mb-8 font-light">
              Explorez notre sélection complète d'électronique et de gadgets de qualité
            </p>

            {/* Search Bar Premium */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative premium-card p-2 rounded-2xl">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                    <Search className="text-white" size={20} />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-20 pr-6 py-4 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl text-gray-900 font-medium placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="premium-card rounded-2xl overflow-hidden flex flex-col group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <Image
                      src={product.image || "/UPTODATE%20logo.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badge Premium */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Premium
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col flex-grow bg-white">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                      {product.name}
                    </h3>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Quantité</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            const current = productQuantities[product.id] || 0;
                            const next = Math.max(0, current - 1);
                            setProductQuantities({ ...productQuantities, [product.id]: next });
                          }}
                        >
                          -
                        </button>
                        <div className="px-4 py-2 border border-gray-300 rounded-lg min-w-12 text-center font-semibold text-gray-900">
                          {productQuantities[product.id] || 0}
                        </div>
                        <button
                          type="button"
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            const current = productQuantities[product.id] || 0;
                            const next = Math.min(99, current + 1);
                            setProductQuantities({ ...productQuantities, [product.id]: next });
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                      {(() => {
                        const q = productQuantities[product.id] || 0;
                        return (
                          <>
                            <button
                              onClick={() => {
                                const quantity = q;
                                if (quantity <= 0) return;
                                removeFromCart(product.id);
                                addToCart(product, quantity);
                              }}
                              disabled={q === 0}
                              className={`premium-button bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md w-full sm:w-auto ${q === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'}`}
                            >
                              <ShoppingCart size={16} />
                              <span>Ajouter au panier</span>
                            </button>
                            {q > 0 && (
                              <button
                                onClick={() => {
                                  removeFromCart(product.id);
                                  setProductQuantities({ ...productQuantities, [product.id]: 0 });
                                }}
                                className="px-2 sm:px-3 py-2 rounded-xl border-2 border-red-600 text-red-600 font-semibold text-xs sm:text-sm hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center gap-1 sm:gap-2 self-stretch sm:self-auto"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                                Retirer
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 premium-card rounded-2xl max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="text-gray-500" size={40} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Aucun produit trouvé</h3>
              <p className="text-gray-600 mb-6">Essayez une autre recherche ou réinitialisez les filtres</p>
              <button
                onClick={() => setSearchQuery("")}
                className="premium-button bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
