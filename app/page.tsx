"use client";
import { useCart } from '@/app/context/CartContext';
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  MapPin,
  Calculator,
  LogIn,
  Search,
  Smartphone,
  ShieldCheck,
  Laptop,
  Wifi,
  ChevronRight,
  ShoppingCart,
  MessageCircle,
  Headphones,
  Truck,
  Zap,
  DollarSign,
  Clock,
  ChevronDown,
  Facebook,
  Instagram,
  Star,
  ClipboardList,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { products as allProducts } from "@/app/data/products";

export default function Home() {
  const [weight, setWeight] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [productQuantities, setProductQuantities] = useState<{[key: number]: number}>({});
  
  // Persistance des quantités sélectionnées sur la page d'accueil
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

  const calculatePrice = () => {
    if (!weight) return "0,00 $";
    const weightNum = parseFloat(weight);
    const perPoundRate = 5; // Cap-Haïtien only
    const total = 8 + weightNum * perPoundRate;
    return `${total.toFixed(2)} $`;
  };

  const handleTrack = () => {
    const num = trackingNumber?.toString().trim();
    if (!num) return;
    const url = `https://www.17track.net/fr/track?nums=${encodeURIComponent(num)}`;
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
  };

  const handleBuyProduct = (productName: string) => {
    const message = `Bonjour Up-to-date Store, je suis intéressé par le ${productName}. Est-il disponible ?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/50932836938?text=${encodedMessage}`, "_blank");
  };

  const services = [
    {
      id: 1,
      title: "Expédition rapide",
      description: "Expédition fiable de Miami vers Haïti",
      icon: Truck,
    },
    {
      id: 2,
      title: "Achat personnel",
      description: "Nous achetons pour vous dans n'importe quel magasin en ligne",
      icon: ShoppingCart,
    },
    {
      id: 3,
      title: "Vente d'électronique",
      description: "Gadgets de qualité et accessoires technologiques",
      icon: Zap,
    },
  ];

  const products = productQuery
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(productQuery.toLowerCase())
      )
    : allProducts;

  const { addToCart, removeFromCart } = useCart();
  return (
    <div className="min-h-screen bg-white">
      {/* Hide Next.js badge */}
      <style>{`
        [data-nextjs-dialog] {
          display: none !important;
        }
      `}</style>

      <Navbar />

      {/* Who We Are Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative mb-16 animate-fadeInUp">
            <div className="text-center">
              <h2 className="text-4xl sm:text-6xl font-extrabold mb-6">
                <span className="gradient-text">Qui sommes-nous</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Up-to-date Electronic Store</span> est votre partenaire de confiance pour tous vos besoins en électronique et vos exigences d'expédition vers Haïti.
              </p>
            </div>
            <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 sm:right-0 sm:translate-x-0 sm:translate-y-0">
              <img
                src="/2nd.png"
                alt="2nd Anniversary Celebration"
                className="h-40 sm:h-64 object-contain max-w-full"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              const gradients = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-orange-500 to-red-500'
              ];
              return (
                <div
                  key={service.id}
                  className="premium-card rounded-2xl p-8 text-center group hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-center mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${gradients[index]} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-300`}>
                      <IconComponent className="text-white" size={36} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shipping & Tracking Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20 sm:py-32 overflow-hidden">
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'}}></div>
          <div className="absolute top-0 right-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
              Expédiez des électroniques vers <span className="text-yellow-300">Haïti</span> aujourd'hui
            </h2>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light">
              Expédition rapide, fiable et abordable de Miami vers Cap-Haïtien. Suivez vos colis en temps réel.
            </p>
          </div>

          {/* Hero focused on shipping service (search removed from Home) */}

          {/* Tracking Bar */}
          <div className="premium-card rounded-2xl p-8 max-w-2xl mx-auto backdrop-blur-xl bg-white/95 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Search className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Suivre votre colis</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Entrez le numéro de suivi"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
              />
              <button
                onClick={handleTrack}
                className="premium-button bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-10 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-105"
                aria-label="Suivre le colis"
              >
                Suivre
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="text-white" size={28} />
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold">
                <span className="gradient-text">Nos Produits</span>
              </h2>
            </div>
            <p className="text-lg text-gray-600">
              Découvrez nos meilleures sélections
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { id: 101, name: "Sunset Light", image: "/Sunset light.jpg" },
              { id: 102, name: "Smart Watch", image: "/Smart watch.jpg" },
              { id: 103, name: "Smart Projector", image: "/Smart Projector.jpg" },
              { id: 104, name: "Phone Light", image: "/Phone Light.jpg" },
              { id: 105, name: "LED Light", image: "/Led2.jpg" },
              { id: 106, name: "Headphones/3", image: "/hp.jpg" }, // Correction du nom
            ].map((product, index) => (
              <div
                key={index}
                className="premium-card rounded-2xl overflow-hidden flex flex-col group relative"
              >
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  New Arrival
                </div>
                <div className="relative h-40 sm:h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 flex flex-col flex-grow bg-white">
                  <h3 className="text-md font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
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

          <div className="text-center">
            <Link
              href="/produits"
              className="premium-button inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute bottom-10 left-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
              <span className="gradient-text">Pourquoi choisir Up-to-date ?</span>
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Découvrez ce qui nous rend différents et pourquoi les clients nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Meilleurs prix */}
            <div className="premium-card rounded-2xl p-10 flex flex-col items-center text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-300">
                <DollarSign className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-emerald-600 group-hover:bg-clip-text transition-all">
                Meilleurs prix au Cap
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nous offrons des prix compétitifs sur tous les biens électroniques à Cap-Haïtien. Qualité garantie au meilleur coût.
              </p>
            </div>

            {/* Livraison Rapide */}
            <div className="premium-card rounded-2xl p-10 flex flex-col items-center text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-300">
                <Truck className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:bg-clip-text transition-all">
                Livraison Rapide & Shipping USA
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Expédition rapide depuis les USA directement vers notre emplacement à Champin. Suivi en temps réel garanti.
              </p>
            </div>

            {/* Support 24/7 */}
            <div className="premium-card rounded-2xl p-10 flex flex-col items-center text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-300">
                <MessageCircle className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-red-600 group-hover:bg-clip-text transition-all">
                Support WhatsApp 24/7
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nous sommes toujours disponibles pour répondre à vos questions et suivre vos commandes. Une équipe réactive à votre service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commandes Assistées Section */}
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
                    <span>Expédition directe à notre entrepôt de Miami</span>
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

      {/* Guide Express - Adresse de commande */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="premium-card rounded-2xl p-8 shadow-xl bg-white/70 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <ClipboardList size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Guide express</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Comment remplir l'adresse sur le marketplace</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl bg-white">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Nom et Prénom</p>
                <p className="text-lg font-bold text-gray-900">Votre nom et prénom</p>
                <p className="text-sm text-gray-600">Mettez uniquement votre nom et prénom (pas de nom de boutique).</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl bg-white">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Numéro de téléphone (USA)</p>
                <p className="text-lg font-bold text-gray-900">Numéro des USA (obligatoire)</p>
                <p className="text-sm text-gray-600">Utilisez un numéro US valide pour la confirmation de commande.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl bg-white md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase mb-2">
                  <MapPin size={16} />
                  Adresse de livraison
                </div>
                <p className="text-lg font-bold text-gray-900">8020 Northwest 66th Street, Miami, FL 33166</p>
                <p className="text-sm text-gray-600">Renseignez cette adresse dans le champ « Address line » du marketplace.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl bg-white">
                <p className="text-xs font-semibold text-red-600 uppercase mb-2">Appartement / Code (IMPORTANT)</p>
                <p className="text-lg font-bold text-red-600">BP-136835</p>
                <p className="text-sm text-red-600">Entrez ce code dans le champ « Apartment / Apt » (obligatoire).</p>
              </div>
              <div className="p-4 border border-blue-200 rounded-xl bg-blue-50 md:col-span-2">
                <p className="text-sm font-semibold text-blue-700 mb-1">Rappel rapide</p>
                <p className="text-sm text-blue-800">Ajoutez vos articles au panier, copiez ces informations (adresse + code BP-136835), puis finalisez la commande sur le marketplace. En cas de doute, envoyez-nous une capture d'écran sur WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price Calculator */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
            Calculateur de prix d'expédition
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Calculator Card */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="text-blue-600" size={28} />
                <h3 className="text-2xl font-bold text-gray-900">Calculer l'expédition</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Poids (livres)
                  </label>
                  <input
                    type="number"
                    placeholder="Entrez le poids"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 flex items-center">
                    <span className="font-semibold">Cap-Haïtien (5 $/lb)</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Frais de service : 8,00 $</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Tarif:{" "}
                    <span className="font-semibold text-gray-900">
                      5 $/lb
                    </span>
                  </p>
                  <div className="border-t border-blue-200 pt-4">
                    <p className="text-2xl font-bold text-blue-600">Total : {calculatePrice()}</p>
                  </div>
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors">
                  Obtenir un devis
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Comment ça fonctionne</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Entrez vos détails</p>
                    <p className="text-gray-600 text-sm">Spécifiez le poids et la destination</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Obtenez un devis instantané</p>
                    <p className="text-gray-600 text-sm">Voir la tarification exacte immédiatement</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Expédiez votre colis</p>
                    <p className="text-gray-600 text-sm">Déposez à l'entrepôt de Miami</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Suivi en temps réel</p>
                    <p className="text-gray-600 text-sm">Suivez l'état de votre livraison</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Miami Warehouse Address */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 sm:p-12 text-white">
            <div className="flex items-start gap-4">
              <MapPin className="flex-shrink-0 mt-1" size={32} />
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Entrepôt de Miami</h2>
                <p className="text-lg text-blue-100 mb-2">Lieu de dépôt :</p>
                <p className="text-2xl font-semibold">
                  8020 Northwest 66th Street
                </p>
                <p className="text-2xl font-semibold">Miami, FL 33166</p>
                <div className="mt-4 p-4 rounded-lg bg-white/10 border border-white/20">
                  <p className="text-white font-semibold">IMPORTANT : Appartement / Code</p>
                  <p className="text-red-300 text-lg font-bold">BP-136835</p>
                  <p className="text-blue-100 text-sm">Renseignez ce code dans le champ « Apartment / Apt » lorsque vous expédiez vers l'entrepôt.</p>
                </div>
                <p className="text-blue-100 mt-4">
                  Ouvert lundi - vendredi : 8h00 - 18h00 EST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs section removed per request; pricing handled via WhatsApp */}

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Questions Fréquemment Posées
            </h2>
            <p className="text-lg text-gray-600">
              Trouvez les réponses aux questions les plus courantes
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <button
                onClick={() => setOpenFaqId(openFaqId === 1 ? null : 1)}
                className="w-full px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  Combien de temps dure le shipping ?
                </h3>
                <ChevronDown
                  size={24}
                  className={`text-blue-600 flex-shrink-0 ml-4 transition-transform ${
                    openFaqId === 1 ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaqId === 1 && (
                <div className="px-6 py-4 sm:px-8 sm:py-5 bg-white border-t border-gray-200">
                  <p className="text-gray-700 text-lg">
                    Nos délais sont rapides, entre <span className="font-semibold">3 à 5 jours depuis les USA</span>. Nous nous engageons à livrer vos commandes dans les meilleurs délais possibles.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <button
                onClick={() => setOpenFaqId(openFaqId === 2 ? null : 2)}
                className="w-full px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  Puis-je payer en Gourdes ou en Dollars ?
                </h3>
                <ChevronDown
                  size={24}
                  className={`text-blue-600 flex-shrink-0 ml-4 transition-transform ${
                    openFaqId === 2 ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaqId === 2 && (
                <div className="px-6 py-4 sm:px-8 sm:py-5 bg-white border-t border-gray-200">
                  <p className="text-gray-700 text-lg">
                    <span className="font-semibold">Nous acceptons les deux devises</span> (Gourdes et Dollars) pour vous faciliter la vie. Contactez-nous sur WhatsApp pour connaître les tarifs actuels et discuter des modalités de paiement.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <button
                onClick={() => setOpenFaqId(openFaqId === 3 ? null : 3)}
                className="w-full px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  Où récupère-je mon colis ?
                </h3>
                <ChevronDown
                  size={24}
                  className={`text-blue-600 flex-shrink-0 ml-4 transition-transform ${
                    openFaqId === 3 ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaqId === 3 && (
                <div className="px-6 py-4 sm:px-8 sm:py-5 bg-white border-t border-gray-200">
                  <p className="text-gray-700 text-lg">
                    Directement à notre boutique à <span className="font-semibold">Champin, Cap-Haïtien</span> (#J-123). Vous pouvez vous présenter à notre adresse durant nos horaires d'ouverture (Lun-Sam: 9h - 18h) ou nous contacter pour organiser un rendez-vous.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-700 text-lg mb-4">
              Vous avez d'autres questions ?
            </p>
            <a
              href="https://wa.me/50932836938"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
            >
              <MessageCircle size={20} />
              Nous contacter sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Témoignages Clients
            </h2>
            <p className="text-lg text-gray-600">
              Ce que nos clients disent de nous
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-6 flex-grow italic">
                "Produits de haute qualité et livraison plus rapide que prévu à Champin !"
              </p>
              <div>
                <p className="font-bold text-gray-900">Jean-Baptiste Morissette</p>
                <p className="text-gray-600 text-sm">Client vérifié</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-6 flex-grow italic">
                "Le meilleur service de shipping USA au Cap. Très professionnel."
              </p>
              <div>
                <p className="font-bold text-gray-900">Rose-Marie Delvilus</p>
                <p className="text-gray-600 text-sm">Client vérifié</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-6 flex-grow italic">
                "Mon projecteur est arrivé en parfait état. Je recommande vivement Up-to-date."
              </p>
              <div>
                <p className="font-bold text-gray-900">Marc-Antoine Desroches</p>
                <p className="text-gray-600 text-sm">Client vérifié</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-700 text-lg mb-6">
              Rejoignez des centaines de clients satisfaits
            </p>
            <a
              href="https://wa.me/50932836938"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Commencer votre commande
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Company Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Up-to-date Electronic Store</h3>
              <p className="text-sm text-gray-400 mb-6">
                Expédition rapide et fiable de produits électroniques de qualité vers Haïti.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Liens Rapides</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/produits" className="text-gray-400 hover:text-white transition-colors">
                    Boutique
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    À Propos
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Vie Privée
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Horaires d'Ouverture</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Clock size={16} className="flex-shrink-0 mt-0.5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-white">Lun - Sam</p>
                    <p>9h00 - 18h00</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Clock size={16} className="flex-shrink-0 mt-0.5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-white">Dimanche</p>
                    <p>Fermé</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Contact</h4>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="flex-shrink-0 mt-1 text-orange-500" />
                  <div>
                    <p className="font-semibold text-white mb-1">Adresse</p>
                    <p className="text-gray-400">#J-123, Champin</p>
                    <p className="text-gray-400">Cap-Haïtien, Haïti</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle size={18} className="flex-shrink-0 mt-1 text-green-500" />
                  <div>
                    <p className="font-semibold text-white mb-1">WhatsApp</p>
                    <p className="text-gray-400">+509-3283-6938</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 pt-8">
            <div className="text-center text-sm text-gray-400">
              <p>&copy; 2024 Up-to-date Electronic Store. Tous droits réservés.</p>
              <p className="mt-2">
                Conçu avec passion pour servir la communauté de Cap-Haïtien
              </p>
              <p className="mt-2">
                Site réalisé par{' '}
                <a
                  href="https://gui-fiedly.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-200 font-semibold"
                >
                  GF Digital Studio
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Instagram Button */}
      <a
        href="https://instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        title="Visiter notre Instagram"
      >
        <Instagram size={28} />
      </a>
    </div>
  );
}
