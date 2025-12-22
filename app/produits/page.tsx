"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, MessageCircle, Search } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { products } from "@/app/data/products";
import { useCart } from '../context/CartContext'; // Import correct

export default function Produits() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // 1. ON PLACE LE HOOK ICI (à l'intérieur de la fonction)
  const { addToCart } = useCart();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        [data-nextjs-dialog] {
          display: none !important;
        }
      `}</style>

      <Navbar />

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingCart className="text-blue-600" size={32} />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Nos Produits
              </h2>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Explorez notre sélection complète d'électronique et de gadgets de qualité
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
                />
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden">
                    <Image
                      src={product.image || "/UPTODATE%20logo.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {/* 2. LE BOUTON EST DÉSORMAIS BIEN DANS LA BOUCLE .MAP */}
                    <button
  onClick={() => {
    addToCart(product);
  }}
  className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95 text-sm"
>
  <ShoppingCart size={18} />
  Ajouter au panier
</button> 
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
              <button
                onClick={() => setSearchQuery("")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
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
