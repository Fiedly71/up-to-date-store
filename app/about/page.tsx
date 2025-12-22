"use client";

import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { MessageCircle, Truck, MapPin } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="w-full bg-blue-900 text-white text-sm py-1 text-center fixed top-0 left-0 z-50">
        📦 Prochain départ des USA : Vendredi prochain ! | 📲 Devis gratuit via WhatsApp.
      </div>

      <Navbar />

      <main className="max-w-4xl mx-auto p-6 pt-12">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="text-blue-600" size={32} />
          <h1 className="font-bold text-2xl sm:text-3xl">À propos</h1>
        </div>

        <div className="space-y-4 text-base sm:text-lg text-gray-800">
          <p>
            <span className="font-bold">Up-to-date est une entreprise spécialisée dans la vente de produits technologiques et électroniques modernes, conçus pour répondre aux besoins du quotidien.</span> Nous proposons une sélection rigoureuse d’articles tels que des accessoires électroniques, des gadgets intelligents et des équipements innovants, alliant qualité, utilité et design contemporain.
          </p>

          <p>
            Dans une logique d’évolution et de proximité avec notre clientèle, <span className="font-bold">Up-to-date</span> offre désormais un service de shipping depuis les <span className="font-bold">États-Unis</span> vers le <span className="font-bold">Cap-Haïtien</span>. Ce service permet à nos clients de recevoir leurs commandes de manière <span className="font-bold">fiable</span>, sécurisée et dans des délais maîtrisés, en simplifiant l’accès aux produits disponibles sur le marché américain.
          </p>

          <p>
            Notre engagement repose sur trois piliers : <span className="font-bold">fiabilité</span>, <span className="font-bold">transparence</span> et <span className="font-bold">satisfaction client</span>. Chaque étape — de la sélection des produits jusqu’à la livraison finale — est pensée pour offrir une expérience fluide et professionnelle.
          </p>

          <p>
            <span className="font-semibold">Up-to-date</span>, c’est plus qu’une boutique en ligne : c’est un partenaire qui facilite l’accès à la technologie et aux services logistiques modernes, adaptés à la réalité locale.
          </p>
        </div>

        {/* Informations Utiles */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Informations Utiles</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/restrictions" className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded text-lg font-bold">
              <span className="text-xl">🚫</span>
              <span className="font-bold">Voir les Produits Interdits</span>
            </Link>

            <a href="https://wa.me/50932836938" target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded text-lg font-bold">
              <span className="text-xl">💬</span>
              <span className="font-bold">Nous contacter sur WhatsApp</span>
            </a>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={18} className="text-blue-600" />
            <span>Shipping: États-Unis → Cap-Haïtien</span>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Button (fixed, very high z-index) */}
      <a
        href="https://wa.me/50932836938"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-[9999] bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
      >
        <MessageCircle size={22} />
      </a>

    </div>
  );
}
