"use client";


import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from '../context/CartContext';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar(): React.ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function checkUserAndRedirect() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
      if (data.user) {
        // Always check is_admin from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();
        if (profile && profile.is_admin) {
          if (window.location.pathname !== "/admin") window.location.href = "/admin";
        } else {
          if (window.location.pathname !== "/my-orders") window.location.href = "/my-orders";
        }
      }
    }
    checkUserAndRedirect();
    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        if (profile && profile.is_admin) {
          if (window.location.pathname !== "/admin") window.location.href = "/admin";
        } else {
          if (window.location.pathname !== "/my-orders") window.location.href = "/my-orders";
        }
      }
    });
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Email verification redirect handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      if (type === 'email_verification') {
        // Show a message and redirect after a short delay
        alert('Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.');
        window.location.href = '/auth';
      }
    }
  }, []);
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
            <h1 className="hidden sm:block text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
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
          {/* Auth Buttons */}
          {!loading && !user && (
            <>
              <Link href="/auth" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Login</Link>
              <Link href="/auth" className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">Sign Up</Link>
            </>
          )}
          {!loading && user && (
            <>
              <Link href="/my-orders" className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">My Orders</Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="ml-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-900 transition"
              >Logout</button>
            </>
          )}
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
          {/* Auth Buttons Mobile */}
          {!loading && !user && (
            <>
              <Link href="/auth" className="block w-full text-center mt-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">Login</Link>
              <Link href="/auth" className="block w-full text-center mt-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition">Sign Up</Link>
            </>
          )}
          {!loading && user && (
            <>
              <Link href="/my-orders" className="block w-full text-center mt-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition">My Orders</Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="block w-full text-center mt-2 px-4 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-900 transition"
              >Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}