"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, MessageCircle, Search } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { products } from "@/app/data/products";

export default function Produits() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuyProduct = (productName: string) => {
    const message = `Bonjour Up-to-date Store, je suis intéressé par le ${productName}. Est-il disponible ?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/50932836938?text=${encodedMessage}`, "_blank");
  };
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        [data-nextjs-dialog] {
          display: none !important;
        }
      `}</style>

      <Navbar />

      {/* Featured Products Section */}
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
                  placeholder="Rechercher un produit (ex: Smart, USB, LED)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {product.name}
                    </h3>
                    <button
                      onClick={() => handleBuyProduct(product.name)}
                      className="mt-auto bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ShoppingCart size={18} />
                      Commander
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600 mb-6">
                Nous n'avons pas trouvé de produits correspondant à "{searchQuery}". Essayez une autre recherche.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/50932836938"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        title="Contact us on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
