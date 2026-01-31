"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// On ajoute ShoppingCart ici pour l'icône
import { MessageCircle, Menu, X, ShoppingCart } from "lucide-react"; 
import { useCart } from '../context/CartContext'; 

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCart(); // Récupère les données du panier

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 shadow-lg border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 sm:gap-6 group">
          <div className="relative flex items-center gap-2">
            <Image 
              src="/UPTODATE%20logo.jpg" 
              alt="UPTOdate logo" 
              width={48} 
              height={48} 
              className="rounded-xl object-contain shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110" 
            />
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Up-to-date Store
              </h1>
              <Image
                src="/2nd.png"
                alt="2nd Anniversary Celebration"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div>
            <h1 className="hidden sm:block text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Up-to-date Store
            </h1>
            <h1 className="sm:hidden text-lg font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              UP-TO-DATE
            </h1>
          </div>
        </Link>
          
        {/* Liens Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/" className="px-4 py-2 text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text font-semibold transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">
            Accueil
          </Link>
          <Link href="/produits" className="premium-button bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Shop
          </Link>
          <Link href="/about" className="px-4 py-2 text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text font-semibold transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">
            À Propos
          </Link>
          <Link href="/restrictions" className="px-4 py-2 text-gray-700 hover:text-red-600 font-semibold transition-colors duration-300 rounded-lg hover:bg-red-50">
            Produits Interdits
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* --- ICÔNE PANIER AVEC BADGE DYNAMIQUE PREMIUM --- */}
          <Link href="/panier" className="relative p-2.5 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 rounded-xl group">
            <ShoppingCart size={26} className="group-hover:scale-110 transition-transform duration-300" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Bouton Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 rounded-xl"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Bouton WhatsApp Premium */}
          <a
            href="https://wa.me/50932836938"
            target="_blank"
            rel="noopener noreferrer"
            className="premium-button flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-2 border-green-700/20 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 text-sm sm:text-base"
          >
            <MessageCircle size={20} className="animate-pulse" />
            <span className="hidden sm:inline">Nous contacter</span>
          </a>
        </div>
      </div>

      {/* Mobile Menu Premium */}
      {mobileMenuOpen && (
        <div className="md:hidden backdrop-blur-xl bg-white/95 border-t border-gray-200/50 px-4 sm:px-6 py-6 space-y-3 shadow-2xl">
          <Link 
            href="/" 
            className="block text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r transition-all duration-300" 
            onClick={() => setMobileMenuOpen(false)}
          >
            Accueil
          </Link>
          <Link 
            href="/produits" 
            className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-bold text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
            onClick={() => setMobileMenuOpen(false)}
          >
            Shop
          </Link>
          <Link 
            href="/about" 
            className="block text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300" 
            onClick={() => setMobileMenuOpen(false)}
          >
            À Propos
          </Link>
          <Link 
            href="/panier" 
            className="block text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-between" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Mon Panier</span>
            {cart.length > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  );
}