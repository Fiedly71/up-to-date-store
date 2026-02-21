"use client";
import { useState, useEffect } from "react";

import Navbar from "@/app/components/Navbar";
import PriceCalculator from "./components/PriceCalculator";
import { Search, Truck, ShoppingCart, Package, LogIn, UserPlus } from "lucide-react";
import { Headphones, ChevronRight, MessageCircle, ChevronDown, Star, Facebook, Instagram, Clock, MapPin, Zap, ArrowRight } from "lucide-react";
import { calculateFinalPrice, USD_TO_GDS_RATE, formatGourdes, getPriceBreakdown } from "@/app/utils/pricing";
import Link from "next/link";
import { products as allProducts } from "@/app/data/products";
import { useCart } from '@/app/context/CartContext';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false } }
);

export default function Home() {
  const [productQuery, setProductQuery] = useState("");
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [productQuantities, setProductQuantities] = useState<{[key: number]: number}>({});

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setCheckingAuth(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Synchronisation des quantités
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

  const { addToCart, removeFromCart } = useCart();

  // AliExpress Search Handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productQuery.trim()) {
      setError("Veuillez entrer un mot-clé ou un lien AliExpress.");
      return;
    }
    window.location.href = `/aliexpress?search=${encodeURIComponent(productQuery)}`;
  };

  const services = [
    {
      id: 1,
      title: "Expédition rapide",
      description: "Expédition fiable vers Cap-Haïtien",
      icon: Truck,
    },
    {
      id: 2,
      title: "Achat personnel",
      description: "Nous achetons pour vous sur AliExpress",
      icon: ShoppingCart,
    },
    {
      id: 3,
      title: "Vente d'électronique",
      description: "Gadgets et accessoires de qualité",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Qui sommes-nous */}
      <section className="pt-8 pb-12 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 animate-fadeInUp">
            <h2 className="text-4xl sm:text-6xl font-extrabold mb-6">
              <span className="gradient-text">Qui sommes-nous</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Up-to-date Electronic Store</span> est votre partenaire de confiance à <span className="font-bold text-blue-700">Champin, Cap-Haïtien</span> pour tous vos besoins en électronique et vos commandes AliExpress.
            </p>
            <div className="mt-6 text-blue-700 font-semibold text-lg">
              Payez localement à Champin ou via <span className="font-bold text-orange-600">MonCash</span> (coordination simple)
            </div>

            {/* Auth Buttons */}
            {!checkingAuth && !user && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <LogIn size={22} />
                  Se connecter
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-purple-300 text-purple-700 rounded-xl font-bold text-lg shadow-md hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
                >
                  <UserPlus size={22} />
                  Créer un compte
                </Link>
              </div>
            )}

            {!checkingAuth && user && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Connecté: {user.email}
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/aliexpress"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                  >
                    <ShoppingCart size={20} />
                    Commander sur AliExpress
                  </Link>
                  <Link
                    href="/my-orders"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-300 text-blue-700 rounded-xl font-bold shadow-md hover:bg-blue-50 transition-all duration-300"
                  >
                    <Package size={20} />
                    Mes commandes
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              const gradients = [
                "from-blue-500 to-cyan-500",
                "from-purple-500 to-pink-500",
                "from-orange-500 to-red-500",
              ];
              return (
                <div
                  key={service.id}
                  className="premium-card rounded-2xl p-8 text-center group hover:shadow-xl transition-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-center mb-6">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${gradients[index]} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-300`}
                    >
                      <IconComponent className="text-white" size={36} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AliExpress Search - PREMIUM SECTION */}
      <section className="relative w-full py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white text-sm font-semibold">Service actif 24/7</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-xl">
              Commandez sur <span className="text-yellow-300">AliExpress</span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Des millions de produits à portée de main. Nous achetons pour vous et livrons directement à <span className="font-bold text-yellow-200">Champin, Cap-Haïtien</span>.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white/15 rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  value={productQuery}
                  onChange={e => setProductQuery(e.target.value)}
                  placeholder="Que recherchez-vous ? (ex: écouteurs, montre, téléphone...)"
                  className="w-full pl-14 pr-6 py-5 rounded-2xl border-0 text-lg text-gray-900 bg-white placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
                />
              </div>
              
              {/* Quick Search Tags */}
              <div className="flex flex-wrap gap-2 justify-center">
                {['Smartphone', 'Écouteurs', 'Montre', 'LED', 'Accessoires'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setProductQuery(tag)}
                    className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all border border-white/30"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full md:w-auto md:mx-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-lg shadow-xl hover:from-yellow-500 hover:to-orange-600 transition-all flex items-center justify-center gap-3"
              >
                <Search size={22} />
                Rechercher sur AliExpress
              </button>
            </form>
            {error && <div className="mt-4 text-center text-red-200 font-semibold bg-red-500/20 py-2 rounded-lg">{error}</div>}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="flex items-center gap-4 bg-white/15 rounded-2xl p-5 border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold">Paiement local</h4>
                <p className="text-white/70 text-sm">MonCash, Cash, Carte</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/15 rounded-2xl p-5 border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Truck className="text-white" size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold">Livraison rapide</h4>
                <p className="text-white/70 text-sm">7-15 jours à Champin</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/15 rounded-2xl p-5 border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Headphones className="text-white" size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold">Support WhatsApp</h4>
                <p className="text-white/70 text-sm">Assistance complète</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Link
              href="/aliexpress"
              className="inline-flex items-center gap-2 text-white font-semibold hover:text-yellow-200 transition-colors"
            >
              Accéder à la page complète AliExpress
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Nos produits - Compact Grid */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                <span className="gradient-text">Nos Produits</span>
              </h2>
            </div>
            <p className="text-gray-600">En stock à Cap-Haïtien</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {allProducts.slice(0, 4).map((product, index) => (
              <div key={index} className="premium-card rounded-xl overflow-hidden flex flex-col group relative aspect-square">
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  En stock
                </div>
                <div className="relative h-1/2 bg-gray-100 overflow-hidden">
                  {product.image && (
                    <img src={product.image} alt={product.name} loading="lazy"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="p-3 flex flex-col flex-grow bg-white justify-between">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <button type="button"
                      className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        const current = productQuantities[product.id] || 0;
                        setProductQuantities({ ...productQuantities, [product.id]: Math.max(0, current - 1) });
                      }}>-</button>
                    <span className="px-2 font-semibold text-gray-900 text-sm min-w-[24px] text-center">
                      {productQuantities[product.id] || 0}
                    </span>
                    <button type="button"
                      className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        const current = productQuantities[product.id] || 0;
                        setProductQuantities({ ...productQuantities, [product.id]: Math.min(99, current + 1) });
                      }}>+</button>
                  </div>
                  <button
                    onClick={() => {
                      const quantity = productQuantities[product.id] || 0;
                      if (quantity <= 0) return;
                      removeFromCart(product.id);
                      addToCart(product, quantity);
                    }}
                    disabled={!productQuantities[product.id]}
                    className={`w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1 ${!productQuantities[product.id] ? 'opacity-40 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'}`}
                  >
                    <ShoppingCart size={14} /> Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/produits"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>

      {/* Commandes Assistées - UNIQUE */}
      <section className="py-16 sm:py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Headphones className="text-blue-600 flex-shrink-0" size={32} />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Commandes assistées
              </h2>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-blue-600">
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Vous n'avez pas de carte de crédit ou besoin d'aide pour acheter des articles sur <span className="font-semibold">Amazon, Shein, Temu ou d'autres plateformes en ligne</span> ? 
                Nous vous couvrons !
              </p>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold text-blue-600">Notre service d'achat personnel</span> vous permet de :
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <ChevronRight className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                    <span>Demander n'importe quel produit de vos magasins en ligne préférés</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ChevronRight className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                    <span>Nous gérons l'achat avec notre carte de crédit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ChevronRight className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                    <span>Expédition directe à notre entrepôt</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ChevronRight className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                    <span>Nous transférons ensuite vos articles en Haïti à des tarifs compétitifs</span>
                  </li>
                </ul>
              </div>
              <a
                href="https://wa.me/50932836938"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <MessageCircle size={20} />
                Nous contacter sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Grille Tarifaire - UNIQUE */}
      <section id="pricing-grid" className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-100">
<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-4 tracking-tight">Grille Tarifaire</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Voici nos frais d'assistance pour vos commandes AliExpress, Amazon, Shein, Temu, etc.</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold">
              <span>💵 Taux de change:</span>
              <span className="font-bold">1 USD = {USD_TO_GDS_RATE} GDS</span>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl shadow-xl border border-blue-100 bg-white">
            <table className="min-w-full text-base">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-6 py-5 text-left font-bold text-blue-700 text-lg">Prix du produit</th>
                  <th className="px-6 py-5 text-left font-bold text-blue-700 text-lg">Frais d'assistance</th>
                  <th className="px-6 py-5 text-left font-bold text-blue-700 text-lg">Total USD</th>
                  <th className="px-6 py-5 text-left font-bold text-orange-600 text-lg">Total GDS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '0$ - 49$', value: 49 },
                  { label: '50$ - 99$', value: 99 },
                  { label: '100$ - 199$', value: 199 },
                  { label: '200$ et plus', value: 250 },
                ].map((row, i) => {
                  const breakdown = getPriceBreakdown(row.value);
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-blue-50/40 transition">
                      <td className="px-6 py-5 text-gray-900 font-semibold">{row.label}</td>
                      <td className="px-6 py-5 text-gray-700">{breakdown.feeType} <span className="font-bold text-blue-700">({breakdown.fee.toFixed(2)} $)</span></td>
                      <td className="px-6 py-5 text-blue-700 font-bold text-lg">${breakdown.total.toFixed(2)}</td>
                      <td className="px-6 py-5 text-orange-600 font-bold text-lg">{formatGourdes(breakdown.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center text-gray-600 text-base">
            <p className="mb-1">Les frais incluent uniquement l’achat du produit sur la plateforme choisie.</p>
            <p className="mb-2">Pour un devis précis, contactez-nous sur WhatsApp.</p>
            <p className="text-sm text-orange-600 font-medium">💡 Paiement accepté en Gourdes ou en Dollars</p>
          </div>
        </div>
      </section>

      {/* Calculateur de Prix */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-purple-50 to-blue-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 premium-card rounded-2xl shadow-2xl border border-blue-100">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-blue-900 mb-2 tracking-tight">Calculez votre prix final</h2>
            <p className="text-lg text-gray-600">Simulez le coût total d'un produit importé (frais inclus)</p>
          </div>
          <PriceCalculator />
        </div>
      </section>

      {/* Section Suivi de Colis */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="text-white" size={32} />
            </div>
            <h2 className="text-4xl font-extrabold text-emerald-900 mb-4 tracking-tight">Suivez votre Colis</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Entrez votre numéro de suivi pour voir où en est votre commande
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('tracking') as HTMLInputElement)?.value;
                if (input?.trim()) {
                  window.location.href = `/suivi?numero=${encodeURIComponent(input.trim())}`;
                }
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-emerald-400" />
                </div>
                <input
                  type="text"
                  name="tracking"
                  placeholder="Entrez votre numéro de suivi..."
                  className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-lg font-medium transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Truck size={20} />
                Suivre
              </button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="text-emerald-500" size={18} />
                <span>Suivi en temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-emerald-500" size={18} />
                <span>Miami → Cap-Haïtien</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="text-emerald-500" size={18} />
                <span>Mises à jour instantanées</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/suivi"
                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Accéder à la page de suivi complète
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - INTERACTIVE */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-100 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-purple-900 mb-4 tracking-tight">Questions Fréquemment Posées</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">Trouvez les réponses aux questions les plus courantes sur nos services, paiements et livraisons.</p>
          </div>
          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="rounded-2xl border border-purple-200 bg-white shadow-md overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-white transition-colors"
              >
                <h3 className="text-lg font-semibold text-purple-900 text-left">Combien de temps dure le shipping ?</h3>
                <ChevronDown size={24} className={`text-purple-600 flex-shrink-0 ml-4 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 1 && (
                <div className="px-6 py-5 bg-white border-t border-purple-100">
                  <p className="text-gray-700">Nos délais sont rapides, entre <span className="font-semibold">3 à 5 jours depuis les USA</span>. Nous nous engageons à livrer vos commandes dans les meilleurs délais possibles.</p>
                </div>
              )}
            </div>
            
            {/* FAQ Item 2 */}
            <div className="rounded-2xl border border-purple-200 bg-white shadow-md overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-white transition-colors"
              >
                <h3 className="text-lg font-semibold text-purple-900 text-left">Puis-je payer en Gourdes ou en Dollars ?</h3>
                <ChevronDown size={24} className={`text-purple-600 flex-shrink-0 ml-4 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 2 && (
                <div className="px-6 py-5 bg-white border-t border-purple-100">
                  <p className="text-gray-700"><span className="font-semibold">Nous acceptons les deux devises</span> (Gourdes et Dollars) pour vous faciliter la vie. Contactez-nous sur WhatsApp pour connaître les tarifs actuels et discuter des modalités de paiement.</p>
                </div>
              )}
            </div>
            
            {/* FAQ Item 3 */}
            <div className="rounded-2xl border border-purple-200 bg-white shadow-md overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-white transition-colors"
              >
                <h3 className="text-lg font-semibold text-purple-900 text-left">Où récupère-je mon colis ?</h3>
                <ChevronDown size={24} className={`text-purple-600 flex-shrink-0 ml-4 transition-transform duration-300 ${openFaq === 3 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 3 && (
                <div className="px-6 py-5 bg-white border-t border-purple-100">
                  <p className="text-gray-700">Directement à notre boutique à <span className="font-semibold">Champin, Cap-Haïtien</span> (#J-123). Vous pouvez vous présenter à notre adresse durant nos horaires d'ouverture (Lun-Sam: 9h - 18h) ou nous contacter pour organiser un rendez-vous.</p>
                </div>
              )}
            </div>
            
            {/* FAQ Item 4 */}
            <div className="rounded-2xl border border-purple-200 bg-white shadow-md overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-white transition-colors"
              >
                <h3 className="text-lg font-semibold text-purple-900 text-left">Comment commander sur AliExpress ?</h3>
                <ChevronDown size={24} className={`text-purple-600 flex-shrink-0 ml-4 transition-transform duration-300 ${openFaq === 4 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 4 && (
                <div className="px-6 py-5 bg-white border-t border-purple-100">
                  <p className="text-gray-700">C'est simple ! Utilisez notre <span className="font-semibold">barre de recherche AliExpress</span> ci-dessus, trouvez votre produit, et contactez-nous sur WhatsApp avec le lien. Nous nous occupons de la commande, de l'expédition et de la livraison à Champin.</p>
                </div>
              )}
            </div>
            
            {/* FAQ Item 5 */}
            <div className="rounded-2xl border border-purple-200 bg-white shadow-md overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
                className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-white transition-colors"
              >
                <h3 className="text-lg font-semibold text-purple-900 text-left">Quels moyens de paiement acceptez-vous ?</h3>
                <ChevronDown size={24} className={`text-purple-600 flex-shrink-0 ml-4 transition-transform duration-300 ${openFaq === 5 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 5 && (
                <div className="px-6 py-5 bg-white border-t border-purple-100">
                  <p className="text-gray-700">Nous acceptons <span className="font-semibold">MonCash, Cash (espèces)</span>, et <span className="font-semibold">Carte bancaire</span>. Le paiement se fait localement à notre boutique ou via MonCash pour plus de commodité.</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-700 text-lg mb-4">Vous avez d'autres questions ?</p>
            <a href="https://wa.me/50932836938" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
              <MessageCircle size={24} /> Nous contacter sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Avis Clients */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-4 tracking-tight">Avis Clients</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Découvrez ce que nos clients pensent de notre service.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
              <Star className="text-yellow-400 mb-2" size={32} />
              <p className="text-gray-700 text-lg mb-4">Service rapide et fiable, j'ai reçu mon colis en 4 jours !</p>
              <div className="font-bold text-blue-900">Jean, Cap-Haïtien</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
              <Star className="text-yellow-400 mb-2" size={32} />
              <p className="text-gray-700 text-lg mb-4">Paiement facile avec MonCash, très satisfait !</p>
              <div className="font-bold text-blue-900">Marie, Champin</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
              <Star className="text-yellow-400 mb-2" size={32} />
              <p className="text-gray-700 text-lg mb-4">Support WhatsApp très réactif, je recommande.</p>
              <div className="font-bold text-blue-900">David, Limbé</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><Link href="/">Accueil</Link></li>
                <li><Link href="/about">À propos</Link></li>
                <li><Link href="/produits">Produits</Link></li>
                <li><Link href="/aliexpress" className="text-orange-400 font-semibold">AliExpress</Link></li>
                <li><Link href="/panier">Panier</Link></li>
                <li><Link href="/my-orders">Mes commandes</Link></li>
                <li><Link href="/checkout">Checkout</Link></li>
                <li><Link href="/restrictions">Restrictions</Link></li>
                <li><Link href="/privacy">Confidentialité</Link></li>
                <li><Link href="/terms">Conditions</Link></li>
                <li><Link href="/cookies">Cookies</Link></li>
                <li><Link href="/admin">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li><span className="font-semibold text-white">Adresse:</span> Champin, Cap-Haïtien</li>
                <li><span className="font-semibold text-white">WhatsApp:</span> <a href="https://wa.me/50932836938" className="underline" target="_blank" rel="noopener noreferrer">+509 32 83 6938</a></li>
                <li><span className="font-semibold text-white">Email:</span> <a href="mailto:contact@up-to-date-store.com" className="underline">contact@up-to-date-store.com</a></li>
                <li><span className="font-semibold text-white">Horaires:</span> Lun-Sam: 9h - 18h</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Réseaux</h3>
              <div className="flex items-center gap-4">
                <a href="https://facebook.com/up-to-date-store" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-300">
                  <Facebook size={28} />
                </a>
                <a href="https://instagram.com/up-to-date-store" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-300">
                  <Instagram size={28} />
                </a>
                <a href="https://wa.me/50932836938" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-300">
                  <MessageCircle size={28} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Paiements acceptés</h3>
              <ul className="space-y-2 text-gray-400">
                <li>MonCash</li>
                <li>Cash</li>
                <li>Carte bancaire</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Up-to-date Electronic Store. Tous droits réservés.<br />
            <span className="text-gray-400">Site made by </span>
            <a href="https://www.gf-digital-studio.space/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">GF DIGITAL STUDIO</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
