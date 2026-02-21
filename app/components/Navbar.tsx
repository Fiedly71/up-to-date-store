"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Menu, X, ShoppingCart, Shield, User, LogOut, Package, ChevronDown, LogIn, UserPlus } from "lucide-react";
import { useCart } from '../context/CartContext';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false } }
);

export default function Navbar(): React.ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { cart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        try {
          const res = await fetch("/api/check-admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.user.id }),
          });
          const result = await res.json();
          setIsAdmin(result.isAdmin === true);
        } catch { setIsAdmin(false); }
      }
      setLoading(false);
    }
    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Email verification redirect handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      if (type === 'email_verification') {
        alert('Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.');
        window.location.href = '/auth';
      }
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 shadow-lg border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <Image src="/UPTODATE%20logo.jpg" alt="UPTOdate logo" width={44} height={44}
            className="rounded-xl object-contain shadow-md group-hover:shadow-xl transition-all group-hover:scale-110" />
          <h1 className="hidden sm:block text-lg lg:text-xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Up-to-date Store
          </h1>
          <Image src="/2nd.png" alt="2nd Anniversary" width={48} height={48} className="object-contain" />
        </Link>
          
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link href="/" className="px-3 py-2 text-gray-700 hover:text-purple-600 font-semibold transition rounded-lg hover:bg-purple-50 text-sm lg:text-base">
            Accueil
          </Link>
          <Link href="/produits" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition text-sm lg:text-base">
            Shop
          </Link>
          <Link href="/aliexpress" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg transition text-sm lg:text-base">
            AliExpress
          </Link>
          <Link href="/commander" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition text-sm lg:text-base">
            Shein/Temu
          </Link>
          <Link href="/about" className="px-3 py-2 text-gray-700 hover:text-purple-600 font-semibold transition rounded-lg hover:bg-purple-50 text-sm lg:text-base">
            À Propos
          </Link>
          <Link href="/restrictions" className="px-3 py-2 text-gray-700 hover:text-red-600 font-semibold transition rounded-lg hover:bg-red-50 text-sm lg:text-base">
            Interdit
          </Link>
        </div>

        {/* Right side: Cart, User Menu, WhatsApp, Mobile toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart icon */}
          <Link href="/panier" className="relative p-2 text-gray-700 hover:text-purple-600 transition rounded-xl group">
            <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Desktop User Dropdown */}
          {!loading && (
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition text-gray-700">
                {user ? (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {(user.email?.[0] || "U").toUpperCase()}
                  </div>
                ) : (
                  <User size={20} />
                )}
                <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {!user ? (
                    <div className="p-2 space-y-1">
                      <Link href="/auth" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                        <LogIn size={18} /> Se connecter
                      </Link>
                      <Link href="/auth" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition">
                        <UserPlus size={18} /> Créer un compte
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        {isAdmin ? (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-lg transition">
                            <Shield size={18} /> Dashboard Admin
                          </Link>
                        ) : (
                          <>
                            <Link href="/my-orders" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition">
                              <Package size={18} /> Mes commandes
                            </Link>
                            <Link href="/mes-infos" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                              <User size={18} /> Mes Infos
                            </Link>
                          </>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition">
                            <LogOut size={18} /> Déconnexion
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition rounded-xl">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* WhatsApp */}
          <a href="https://wa.me/50932836938" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 sm:px-5 py-2 rounded-xl font-bold transition shadow-lg hover:shadow-xl text-sm">
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Contacter</span>
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-xl">
          <Link href="/" className="block py-2.5 px-4 text-gray-700 font-semibold rounded-lg hover:bg-purple-50 transition" onClick={() => setMobileMenuOpen(false)}>
            Accueil
          </Link>
          <Link href="/produits" className="block py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-center shadow" onClick={() => setMobileMenuOpen(false)}>
            Shop
          </Link>
          <Link href="/aliexpress" className="block py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-center shadow" onClick={() => setMobileMenuOpen(false)}>
            AliExpress
          </Link>
          <Link href="/commander" className="block py-2.5 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-center shadow" onClick={() => setMobileMenuOpen(false)}>
            Shein / Temu / Amazon
          </Link>
          <Link href="/about" className="block py-2.5 px-4 text-gray-700 font-semibold rounded-lg hover:bg-purple-50 transition" onClick={() => setMobileMenuOpen(false)}>
            À Propos
          </Link>
          <Link href="/restrictions" className="block py-2.5 px-4 text-gray-700 font-semibold rounded-lg hover:bg-red-50 transition" onClick={() => setMobileMenuOpen(false)}>
            Produits Interdits
          </Link>
          <Link href="/panier" className="flex items-center justify-between py-2.5 px-4 text-gray-700 font-semibold rounded-lg hover:bg-blue-50 transition" onClick={() => setMobileMenuOpen(false)}>
            <span>Mon Panier</span>
            {cart.length > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
          {/* Auth/User Section */}
          <div className="border-t border-gray-100 pt-2 mt-2 space-y-2">
            {!loading && !user && (
              <>
                <Link href="/auth" className="block w-full text-center py-2.5 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition" onClick={() => setMobileMenuOpen(false)}>Se connecter</Link>
                <Link href="/auth" className="block w-full text-center py-2.5 px-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition" onClick={() => setMobileMenuOpen(false)}>Créer un compte</Link>
              </>
            )}
            {!loading && user && (
              <>
                <p className="text-xs text-gray-400 px-4 truncate">{user.email}</p>
                {isAdmin ? (
                  <Link href="/admin" className="block w-full text-center py-2.5 px-4 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition" onClick={() => setMobileMenuOpen(false)}>Dashboard Admin</Link>
                ) : (
                  <>
                    <Link href="/my-orders" className="block w-full text-center py-2.5 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition" onClick={() => setMobileMenuOpen(false)}>Mes commandes</Link>
                    <Link href="/mes-infos" className="block w-full text-center py-2.5 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition" onClick={() => setMobileMenuOpen(false)}>Mes Infos</Link>
                  </>
                )}
                <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                  className="block w-full text-center py-2.5 px-4 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-900 transition">
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}