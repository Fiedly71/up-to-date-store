"use client";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import { Search, Truck, ShoppingCart, Zap } from "lucide-react";
import { calculateFinalPrice } from "@/app/utils/pricing";
import Link from "next/link";
import { products as allProducts } from "@/app/data/products";

export default function Home() {
  const [productQuery, setProductQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState("");

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
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4 drop-shadow-lg">
          Tout AliExpress est ici. Commandez en toute sécurité.
        </h1>
        <p className="text-lg md:text-2xl text-center mb-8 max-w-2xl">
          Trouvez vos produits, payez localement à Champin ou via MonCash, et récupérez votre colis sans tracas.
        </p>
        <form
          className="w-full max-w-xl flex flex-col sm:flex-row gap-2 items-center justify-center mx-auto"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            className="flex-1 w-full sm:w-auto px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none placeholder-gray-400 border border-gray-200 focus:ring-2 focus:ring-orange-400"
            placeholder="Collez un lien AliExpress ou tapez un produit..."
            value={productQuery}
            onChange={e => setProductQuery(e.target.value)}
            required
            style={{ minWidth: 0 }}
          />
          <button
            type="submit"
            className={`flex items-center justify-center bg-[#FF4747] hover:bg-[#e63b3b] px-6 py-3 rounded-r-lg font-bold text-white transition w-full sm:w-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
            style={{ minWidth: "48px" }}
          >
            <Search className="mr-2" size={20} />
            <span className="hidden sm:inline">{loading ? "Recherche..." : "Rechercher"}</span>
          </button>
        </form>
        {/* Quick Search Category Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {[
            { label: "Solar", query: "solar" },
            { label: "Inverters", query: "inverter" },
            { label: "Smartwatches", query: "smartwatch" },
            { label: "Phones", query: "phone" },
          ].map(cat => (
            <button
              key={cat.label}
              className={`px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition ${loading && productQuery === cat.query ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                setProductQuery(cat.query);
                setLoading(true);
                setTimeout(() => handleSearch(), 0);
              }}
              type="button"
              disabled={loading && productQuery === cat.query}
            >
              {loading && productQuery === cat.query ? 'Chargement...' : cat.label}
            </button>
          ))}
        </div>
        <a
          href="#pricing-grid"
          className="mt-6 inline-block bg-white text-blue-700 font-bold px-6 py-3 rounded-lg shadow hover:bg-blue-50 transition"
        >
          Voir la grille tarifaire ↓
        </a>
        {/* Search Results */}
        {error && (
          <div className="mt-6 text-red-200 font-semibold">{error}</div>
        )}
        {searchResults.length > 0 && (
          <div className="mt-8 w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {searchResults.map((item, idx) => {
              const basePrice = parseFloat(item.sale_price || item.original_price || "0");
              const finalPrice = calculateFinalPrice(basePrice);
              return (
                <div key={idx} className="bg-white rounded-lg shadow p-4 text-gray-900 flex flex-col">
                  <div className="mb-3 w-full h-40 flex items-center justify-center overflow-hidden rounded">
                    {item.product_main_image_url ? (
                      <img src={item.product_main_image_url} alt={item.product_title || item.title} className="object-contain w-full h-full" />
                    ) : (
                      <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                    )}
                  </div>
                  <div className="mb-2 font-bold text-lg truncate">{item.product_title || item.title}</div>
                  <div className="mb-2 text-sm text-gray-700">
                    Prix original: <span className="line-through text-red-500">${basePrice.toFixed(2)}</span>
                  </div>
                  <div className="mb-2 text-sm text-blue-700 font-semibold">
                    Votre prix final: <span className="text-green-600">${finalPrice.toFixed(2)}</span>
                  </div>
                  <a
                    href={`/product/${item.product_id || item.id}`}
                    className="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-center transition"
                  >
                    Voir Détails
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Nos produits - SECTION */}
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
            {allProducts.map((product, index) => (
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
                  <div className="mt-auto flex flex-col gap-2 w-full">
                    <Link
                      href={`/product/${product.id}`}
                      className="premium-button bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md w-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                    >
                      Voir Détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grille des Tarifs - THIRD SECTION */}
      <section id="pricing-grid" className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-blue-700">
            Grille des Tarifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-blue-500">
              <span className="text-2xl font-bold text-blue-600 mb-2">$0 - $50</span>
              <span className="text-3xl font-extrabold text-gray-900 mb-1">$8</span>
              <span className="text-gray-500">Frais fixes</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-blue-500">
              <span className="text-2xl font-bold text-blue-600 mb-2">$50 - $100</span>
              <span className="text-3xl font-extrabold text-gray-900 mb-1">$12</span>
              <span className="text-gray-500">Frais fixes</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-blue-500">
              <span className="text-2xl font-bold text-blue-600 mb-2">$100 - $200</span>
              <span className="text-3xl font-extrabold text-gray-900 mb-1">$20</span>
              <span className="text-gray-500">Frais fixes</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-blue-500">
              <span className="text-2xl font-bold text-blue-600 mb-2">$200+</span>
              <span className="text-3xl font-extrabold text-gray-900 mb-1">20%</span>
              <span className="text-gray-500">du prix total</span>
            </div>
          </div>
          <div className="text-center text-blue-700 font-semibold text-lg">
            Paiement à Champin ou via <span className="font-bold text-orange-600">MonCash</span>
          </div>
        </div>
      </section>
    </div>
  );
}
