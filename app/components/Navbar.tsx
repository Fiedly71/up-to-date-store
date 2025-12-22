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
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <Image src="/UPTODATE%20logo.jpg" alt="UPTOdate logo" width={40} height={40} className="rounded-md object-contain" />
          <h1 className="hidden sm:block text-lg sm:text-xl font-bold text-gray-900">Up-to-date Electronic Store</h1>
          <h1 className="sm:hidden text-lg font-bold text-gray-900">UP-TO-DATE</h1>
        </div>
          
        {/* Liens Desktop - SECTION TARIFS SUPPRIMÉE ICI */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">Accueil</Link>
          <Link href="/produits" className="bg-blue-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-blue-700">Shop</Link>
          <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">À Propos</Link>
          <Link href="/restrictions" className="text-gray-700 hover:text-red-600 font-medium">Produits Interdits</Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* --- ICÔNE PANIER AVEC BADGE DYNAMIQUE --- */}
          <Link href="/panier" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
            <ShoppingCart size={26} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-in zoom-in">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Bouton Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Bouton WhatsApp */}
          <a
            href="https://wa.me/50932836938"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 border-2 border-green-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Nous contacter</span>
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 sm:px-6 py-4 space-y-3">
          <Link href="/" className="block text-gray-700 font-medium py-2 border-b" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
          <Link href="/produits" className="block bg-blue-600 text-white px-3 py-2 rounded-md font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link href="/about" className="block text-gray-700 font-medium py-2 border-b" onClick={() => setMobileMenuOpen(false)}>À Propos</Link>
          <Link href="/panier" className="block text-gray-700 font-medium py-2 border-b" onClick={() => setMobileMenuOpen(false)}>Mon Panier ({cart.length})</Link>
        </div>
      )}
    </nav>
  );
}