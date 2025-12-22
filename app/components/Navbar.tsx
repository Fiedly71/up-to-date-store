"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
          <Image src="/UPTODATE%20logo.jpg" alt="UPTOdate logo" width={40} height={40} className="rounded-md object-contain" />
          <h1 className="hidden sm:block text-lg sm:text-xl font-bold text-gray-900">Up-to-date Electronic Store</h1>
          <h1 className="sm:hidden text-lg font-bold text-gray-900">UP-TO-DATE</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">Accueil</Link>
            <Link href="/produits" className="bg-blue-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-blue-700">Shop</Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">À Propos</Link>
            <Link href="/restrictions" className="text-gray-700 hover:text-red-600 font-medium">Produits Interdits</Link>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Tarifs</a>
          </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

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
          <Link 
            href="/" 
            className="block text-gray-700 hover:text-gray-900 font-medium py-2 border-b border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Accueil
          </Link>
          <Link 
            href="/produits" 
            className="block bg-blue-600 text-white px-3 py-2 rounded-md font-semibold hover:bg-blue-700 text-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            Shop
          </Link>
          <Link 
            href="/about" 
            className="block text-gray-700 hover:text-gray-900 font-medium py-2 border-b border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            À Propos
          </Link>
          <Link 
            href="/restrictions" 
            className="block text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Produits Interdits
          </Link>
          <a 
            href="#" 
            className="block text-gray-700 hover:text-gray-900 font-medium py-2"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
            }}
          >
            Tarifs
          </a>
        </div>
      )}
    </nav>
  );
}
