"use client";
import { useCart } from '@/app/context/CartContext';
import { useState } from "react";
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
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { products as allProducts } from "@/app/data/products";

export default function Home() {
  const [weight, setWeight] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const calculatePrice = () => {
    if (!weight) return "0,00 $";
    const weightNum = parseFloat(weight);
    const perPoundRate = 5; // Cap-Haïtien only
    const total = 10 + weightNum * perPoundRate;
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

  const products = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productQuery.toLowerCase())
  );
const { addToCart } = useCart();
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
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
              Qui sommes-nous
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              <span className="font-semibold text-blue-600">Up-to-date Electronic Store</span> est votre partenaire de confiance pour tous vos besoins en électronique et vos exigences d'expédition vers Haïti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <IconComponent className="text-blue-600" size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shipping & Tracking Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Expédiez des électroniques vers Haïti aujourd'hui
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Expédition rapide, fiable et abordable de Miami vers Cap-Haïtien. Suivez vos colis en temps réel.
            </p>
          </div>

          {/* Hero focused on shipping service (search removed from Home) */}

          {/* Tracking Bar */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Search className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Suivre votre colis</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Entrez le numéro de suivi"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                onClick={handleTrack}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                aria-label="Suivre le colis"
              >
                Suivre
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingCart className="text-blue-600" size={32} />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Nos Produits
              </h2>
            </div>
            <p className="text-lg text-gray-600">
              Découvrez nos meilleures sélections
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {allProducts.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                <div className="relative h-40 sm:h-44 bg-gray-100 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">
                    {product.name}
                  </h3>
               <button
  onClick={() => addToCart(product)}
  className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
>
  <ShoppingCart size={16} />
  Ajouter au panier
</button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/produits"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 shadow-md hover:shadow-lg"
            >
              See All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Up-to-date Electronic Store ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez ce qui nous rend différents et pourquoi les clients nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Meilleurs prix */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Meilleurs prix au Cap
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nous offrons des prix compétitifs sur tous les biens électroniques à Cap-Haïtien. Qualité garantie au meilleur coût.
              </p>
            </div>

            {/* Livraison Rapide */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
                <Truck className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Livraison Rapide & Shipping USA
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Expédition rapide depuis les USA directement vers notre emplacement à Champin. Suivi en temps réel garanti.
              </p>
            </div>

            {/* Support 24/7 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
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
                  <p className="text-sm text-gray-600 mb-2">Frais de service : 10,00 $</p>
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
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Tarifs
                  </a>
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
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/50932836938"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        title="Contact us on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
