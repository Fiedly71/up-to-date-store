"use client";

import { useCart } from '../context/CartContext';
import Navbar from '@/app/components/Navbar';
import Image from 'next/image';
import { ShoppingCart, Trash2, ArrowRight, Package, Sparkles, MapPin, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function PanierPage() {
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <style>{`
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
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                <ShoppingCart className="text-white" size={32} />
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold">
                <span className="gradient-text">Mon Panier</span>
              </h1>
            </div>
            {cart.length > 0 && (
              <p className="text-lg text-gray-700">
                Vous avez <span className="font-bold text-purple-600">{total}</span> article{total > 1 ? 's' : ''} dans votre panier
              </p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="premium-card rounded-2xl p-12 sm:p-16 text-center max-w-lg mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Package className="text-gray-500" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Découvrez notre sélection de produits premium et ajoutez vos favoris au panier
              </p>
              <Link
                href="/produits"
                className="premium-button inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles size={20} />
                Découvrir nos produits
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="premium-card rounded-2xl p-6 flex flex-col sm:flex-row gap-6 group hover:scale-[1.02] transition-all duration-300"
                    >
                      {/* Product Image */}
                      <div className="relative w-full sm:w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || '/UPTODATE%20logo.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600">Quantité: {item.quantity || 1}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-2 text-red-600 hover:text-white hover:bg-red-600 px-4 py-2 rounded-xl font-semibold transition-all duration-300 border-2 border-red-600"
                          >
                            <Trash2 size={18} />
                            <span className="hidden sm:inline">Retirer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Card */}
                <div className="lg:col-span-1">
                  <div className="premium-card rounded-2xl p-8 sticky top-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Total d'articles</span>
                        <span className="text-xl font-bold text-gray-900">{total}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <a
                        href="https://wa.me/50932836938?text=Bonjour, je voudrais commander les produits de mon panier"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="premium-button w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        Commander sur WhatsApp
                        <ArrowRight size={20} />
                      </a>

                      <Link
                        href="/produits"
                        className="block text-center text-gray-700 hover:text-purple-600 font-semibold py-3 transition-colors duration-300"
                      >
                        Continuer mes achats
                      </Link>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-bold text-blue-600">💡 Astuce:</span> Contactez-nous sur WhatsApp pour obtenir un devis personnalisé et discuter des modalités de livraison.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
      </section>
    </div>
  );
}