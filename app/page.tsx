"use client";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import { Search, Truck, ShoppingCart, Zap } from "lucide-react";
import { calculateFinalPrice } from "@/app/utils/pricing";

export default function Home() {
  const [productQuery, setProductQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  // AliExpress Search Handler
  const handleSearch = async () => {
    if (!productQuery) return;
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
      description: "Expédition fiable de Chine vers Cap-Haïtien",
      icon: Truck,
    },
    {
      id: 2,
      title: "Achat personnel",
      description: "Nous achetons pour vous sur AliExpress sans tracas",
      icon: ShoppingCart,
    },
    {
      id: 3,
      title: "Vente d'électronique",
      description: "Gadgets, solaire et accessoires de qualité",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* SECTION 1: QUI SOMMES-NOUS (PREMIER) */}
      <section className="pt-8 pb-12 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-6xl font-extrabold mb-6 text-gray-900">
              Qui sommes-nous
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <span className="font-bold text-blue-600">Up-to-date Electronic Store</span> est votre partenaire de confiance à <span className="font-bold text-blue-700 underline decoration-blue-300">Champin, Cap-Haïtien</span>. Nous rendons l'importation accessible à tous en gérant vos commandes de A à Z.
            </p>
            <div className="mt-8 p-4 bg-white/60 backdrop-blur inline-block rounded-2xl border border-blue-100 shadow-sm">
              <p className="text-blue-800 font-semibold text-lg">
                📍 Localisation : Champin, Cap-Haïtien <br className="sm:hidden" />
                | 📲 Paiement : <span className="text-orange-600">MonCash</span> ou Cash au Magasin
              </p>
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
                <div key={service.id} className="bg-white/80 backdrop-blur rounded-2xl p-8 text-center shadow-lg border border-white hover:scale-105 transition-all">
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${gradients[index]} rounded-2xl flex items-center justify-center shadow-lg text-white`}>
                      <IconComponent size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: MOTEUR DE RECHERCHE ALIEXPRESS */}
      <section className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 py-16 px-4 text-white flex flex-col items-center">
        <div className="max-w-4xl w-full text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            Tout AliExpress est ici.
          </h2>
          <p className="text-lg md:text-xl mb-8 text-blue-100">
            Accédez à des millions de produits. Payez à Champin ou via MonCash, et récupérez votre colis localement.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto" onSubmit={e => { e.preventDefault(); handleSearch(); }}>
            <input
              type="text"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none text-lg shadow-inner"
              placeholder="Cherchez un produit ou collez un lien..."
              value={productQuery}
              onChange={e => setProductQuery(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-xl font-bold text-white text-lg transition shadow-lg ${loading ? 'opacity-50' : ''}`}
            >
              <Search className="mr-2" size={24} />
              {loading ? "Chargement..." : "Rechercher"}
            </button>
          </form>

          {/* Catégories Rapides */}
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            {['Solar', 'Inverters', 'Smartwatches', 'Phones'].map(cat => (
              <button
                key={cat}
                onClick={() => { setProductQuery(cat); setTimeout(handleSearch, 0); }}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition text-sm font-medium"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Résultats de Recherche */}
        {error && <div className="mt-8 text-red-300 font-bold">{error}</div>}
        
        {searchResults.length > 0 && (
          <div className="mt-12 w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults.map((item, idx) => {
              const basePrice = parseFloat(item.sale_price || item.original_price || "0");
              const finalPrice = calculateFinalPrice(basePrice);
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-xl p-4 text-gray-900 flex flex-col hover:shadow-2xl transition">
                  <div className="mb-4 h-48 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                    <img 
                      src={item.product_main_image_url || "/placeholder.png"} 
                      alt={item.product_title} 
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <h3 className="font-bold text-sm mb-2 line-clamp-2 h-10">{item.product_title || item.title}</h3>
                  <div className="mt-auto">
                    <div className="text-xs text-gray-500 line-through">${basePrice.toFixed(2)}</div>
                    <div className="text-xl font-black text-green-600 mb-3">${finalPrice.toFixed(2)}</div>
                    <a
                      href={`/product/${item.product_id || item.id}`}
                      className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                      Voir Détails
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: GRILLE TARIFAIRE */}
      <section id="pricing-grid" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Grille des Tarifs</h2>
            <p className="text-gray-600">Transparence totale : Voici nos frais de service pour l'importation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { range: "$0 - $50", fee: "$8" },
              { range: "$50 - $100", fee: "$12" },
              { range: "$100 - $200", fee: "$20" },
              { range: "$200+", fee: "20%" },
            ].map((tier, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-center shadow-sm">
                <div className="text-blue-600 font-bold mb-2">{tier.range}</div>
                <div className="text-4xl font-black text-gray-900">{tier.fee}</div>
                <div className="text-sm text-gray-500 mt-2">Frais de service</div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-700 font-medium">
              Besoin d'aide ? Contactez-nous ou passez au magasin à <span className="text-blue-600 font-bold">Champin</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}