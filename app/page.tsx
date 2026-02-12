"use client";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import { Search, Truck, ShoppingCart } from "lucide-react";
import { Headphones, ChevronRight, MessageCircle, ChevronDown, Star, Facebook, Instagram, Clock, MapPin, Zap } from "lucide-react";
import { calculateFinalPrice } from "@/app/utils/pricing";
import Link from "next/link";
import { products as allProducts } from "@/app/data/products";
import { useCart } from '@/app/context/CartContext';

export default function Home() {
  const [productQuery, setProductQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [productQuantities, setProductQuantities] = useState<{[key: number]: number}>({});

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
    setLoading(true);
    setError("");
    setSearchResults([]);
    try {
      const response = await fetch(
        `https://ali-express1.p.rapidapi.com/search?query=${encodeURIComponent(productQuery)}`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY ?? "",
            "X-RapidAPI-Host": "ali-express1.p.rapidapi.com",
          } as HeadersInit,
        }
      );
      const data = await response.json();
      setSearchResults(data.docs || []);
    } catch (err) {
      setError("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
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

      {/* Qui sommes-nous - FIRST SECTION */}
      <section className="pt-8 pb-12 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                  className="premium-card rounded-2xl p-8 text-center group hover:scale-105 transition-all duration-300"
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


      {/* AliExpress Search - SECOND SECTION */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-10 px-4 text-white flex flex-col items-center mb-8">
        {/* ...existing code... */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4 drop-shadow-lg">
          Tout AliExpress est ici. Commandez en toute sécurité.
        </h1>
        {/* ...existing code... */}
        {searchResults.length > 0 && (
          <div className="mt-8 w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* ...existing code... */}
          </div>
        )}
      </section>

      {/* Nos produits - SECTION (4 produits max) */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-50">
        {/* ...existing code for produits... */}
      </section>

      {/* Commandes Assistées Section */}
      <section className="py-16 sm:py-24 bg-blue-50">
        {/* ...existing code for commandes assistées... */}
      </section>


      {/* Grille Tarifaire - PRICING GRID */}
      <section id="pricing-grid" className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-4 tracking-tight">Grille Tarifaire</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Voici nos frais d’assistance pour vos commandes AliExpress, Amazon, Shein, Temu, etc.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl shadow-xl border border-blue-100 bg-white">
            <table className="min-w-full text-base">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-8 py-5 text-left font-bold text-blue-700 text-lg">Prix du produit</th>
                  <th className="px-8 py-5 text-left font-bold text-blue-700 text-lg">Frais d’assistance</th>
                  <th className="px-8 py-5 text-left font-bold text-blue-700 text-lg">Total à payer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '0$ - 49$', value: 49 },
                  { label: '50$ - 99$', value: 99 },
                  { label: '100$ - 199$', value: 199 },
                  { label: '200$ et plus', value: 250 },
                ].map((row, i) => {
                  const breakdown = require("@/app/utils/pricing").getPriceBreakdown(row.value);
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-blue-50/40 transition">
                      <td className="px-8 py-5 text-gray-900 font-semibold">{row.label}</td>
                      <td className="px-8 py-5 text-gray-700">{breakdown.feeType} <span className="font-bold text-blue-700">({breakdown.fee.toFixed(2)} $)</span></td>
                      <td className="px-8 py-5 text-blue-700 font-bold text-lg">{breakdown.total.toFixed(2)} $</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center text-gray-600 text-base">
            <p className="mb-1">Les frais incluent uniquement l’achat du produit sur la plateforme choisie.</p>
            <p>Pour un devis précis, contactez-nous sur WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section - Questions Fréquemment Posées */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-100 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-purple-900 mb-4 tracking-tight">Questions Fréquemment Posées</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">Trouvez les réponses aux questions les plus courantes sur nos services, paiements et livraisons.</p>
          </div>
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="rounded-2xl border border-purple-200 bg-white shadow-md hover:shadow-lg transition-shadow">
              <button className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-white transition-colors rounded-t-2xl">
                <h3 className="text-xl font-semibold text-purple-900 text-left">Combien de temps dure le shipping ?</h3>
                <ChevronDown size={28} className="text-purple-600 flex-shrink-0 ml-4" />
              </button>
              <div className="px-8 py-6 bg-white border-t border-purple-100 rounded-b-2xl">
                <p className="text-gray-700 text-lg">Nos délais sont rapides, entre <span className="font-semibold">3 à 5 jours depuis les USA</span>. Nous nous engageons à livrer vos commandes dans les meilleurs délais possibles.</p>
              </div>
            </div>
            {/* FAQ Item 2 */}
            <div className="rounded-2xl border border-purple-200 bg-white shadow-md hover:shadow-lg transition-shadow">
              <button className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-white transition-colors rounded-t-2xl">
                <h3 className="text-xl font-semibold text-purple-900 text-left">Puis-je payer en Gourdes ou en Dollars ?</h3>
                <ChevronDown size={28} className="text-purple-600 flex-shrink-0 ml-4" />
              </button>
              <div className="px-8 py-6 bg-white border-t border-purple-100 rounded-b-2xl">
                <p className="text-gray-700 text-lg"><span className="font-semibold">Nous acceptons les deux devises</span> (Gourdes et Dollars) pour vous faciliter la vie. Contactez-nous sur WhatsApp pour connaître les tarifs actuels et discuter des modalités de paiement.</p>
              </div>
            </div>
            {/* FAQ Item 3 */}
            <div className="rounded-2xl border border-purple-200 bg-white shadow-md hover:shadow-lg transition-shadow">
              <button className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-white transition-colors rounded-t-2xl">
                <h3 className="text-xl font-semibold text-purple-900 text-left">Où récupère-je mon colis ?</h3>
                <ChevronDown size={28} className="text-purple-600 flex-shrink-0 ml-4" />
              </button>
              <div className="px-8 py-6 bg-white border-t border-purple-100 rounded-b-2xl">
                <p className="text-gray-700 text-lg">Directement à notre boutique à <span className="font-semibold">Champin, Cap-Haïtien</span> (#J-123). Vous pouvez vous présenter à notre adresse durant nos horaires d'ouverture (Lun-Sam: 9h - 18h) ou nous contacter pour organiser un rendez-vous.</p>
              </div>
            </div>
          </div>
          <div className="mt-14 text-center">
            <p className="text-gray-700 text-lg mb-4">Vous avez d'autres questions ?</p>
            <a href="https://wa.me/50932836938" target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-3 justify-center">
              <MessageCircle size={24} /> Nous contacter sur WhatsApp
            </a>
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

      // ...existing code...

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
                className="w-full px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  Combien de temps dure le shipping ?
                </h3>
                <ChevronDown size={24} className="text-blue-600 flex-shrink-0 ml-4" />
              </button>
              <div className="px-6 py-4 sm:px-8 sm:py-5 bg-white border-t border-gray-200">
                <p className="text-gray-700 text-lg">
                  Nos délais sont rapides, entre <span className="font-semibold">3 à 5 jours depuis les USA</span>. Nous nous engageons à livrer vos commandes dans les meilleurs délais possibles.
                </p>
              </div>
            </div>
            {/* FAQ Item 2 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <button
                className="w-full px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  Puis-je payer en Gourdes ou en Dollars ?
                </h3>
                <ChevronDown size={24} className="text-blue-600 flex-shrink-0 ml-4" />
              </button>
              <div className="px-6 py-4 sm:px-8 sm:py-5 bg-white border-t border-gray-200">
                <p className="text-gray-700 text-lg">
                  <span className="font-semibold">Nous acceptons les deux devises</span> (Gourdes et Dollars) pour vous faciliter la vie. Contactez-nous sur WhatsApp pour connaître les tarifs actuels et discuter des modalités de paiement.
                </p>
              </div>
            </div>
            {/* FAQ Item 3 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <button
                className="w-full px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  Où récupère-je mon colis ?
                </h3>
                <ChevronDown size={24} className="text-blue-600 flex-shrink-0 ml-4" />
              </button>
              <div className="px-6 py-4 sm:px-8 sm:py-5 bg-white border-t border-gray-200">
                <p className="text-gray-700 text-lg">
                  Directement à notre boutique à <span className="font-semibold">Champin, Cap-Haïtien</span> (#J-123). Vous pouvez vous présenter à notre adresse durant nos horaires d'ouverture (Lun-Sam: 9h - 18h) ou nous contacter pour organiser un rendez-vous.
                </p>
              </div>
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

      {/* Nos produits - SECTION (4 produits max) */}
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
              Découvrez nos meilleures sélections en stock à Cap-Haïtien
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {allProducts.slice(0, 4).map((product, index) => (
              <div
                key={index}
                className="premium-card rounded-2xl overflow-hidden flex flex-col group relative"
              >
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  En stock
                </div>
                <div className="relative h-40 sm:h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
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
                  <div className="mt-auto flex flex-col gap-2 w-full">
                    <button
                      onClick={() => {
                        const quantity = productQuantities[product.id] || 0;
                        if (quantity <= 0) return;
                        removeFromCart(product.id);
                        addToCart(product, quantity);
                      }}
                      disabled={productQuantities[product.id] === 0}
                      className={`premium-button bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md w-full ${productQuantities[product.id] === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'}`}
                    >
                      <ShoppingCart size={16} />
                      <span>Ajouter au panier</span>
                    </button>
                    {productQuantities[product.id] > 0 && (
                      <button
                        onClick={() => {
                          removeFromCart(product.id);
                          setProductQuantities({ ...productQuantities, [product.id]: 0 });
                        }}
                        className="px-2 py-2 rounded-xl border-2 border-red-600 text-red-600 font-semibold text-xs hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center gap-1 self-stretch"
                      >
                        Supprimer
                      </button>
                    )}
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

      {/* Grille Tarifaire - PRICING GRID */}
      <section id="pricing-grid" className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Grille Tarifaire
            </h2>
            <p className="text-lg text-gray-600">
              Voici nos frais d’assistance pour vos commandes AliExpress, Amazon, Shein, Temu, etc.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-md">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-lg font-bold text-blue-700">Prix du produit</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-blue-700">Frais d’assistance</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-blue-700">Total à payer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '0$ - 49$', value: 49 },
                  { label: '50$ - 99$', value: 99 },
                  { label: '100$ - 199$', value: 199 },
                  { label: '200$ et plus', value: 250 },
                ].map((row, i) => {
                  const breakdown = require("@/app/utils/pricing").getPriceBreakdown(row.value);
                  return (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-6 py-4 text-gray-900 font-semibold">{row.label}</td>
                      <td className="px-6 py-4 text-gray-700">{breakdown.feeType} ({breakdown.fee.toFixed(2)} $)</td>
                      <td className="px-6 py-4 text-blue-700 font-bold">{breakdown.total.toFixed(2)} $</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>Les frais incluent uniquement l’achat du produit sur la plateforme choisie.</p>
            <p>Pour un devis précis, contactez-nous sur WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* Avis Clients Section */}
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
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
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
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
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
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
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
    </div>
  );
}
