"use client";

import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Flame, MessageCircle } from "lucide-react";

export default function Restrictions() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto p-8 pt-8">
        <h1 className="font-bold text-2xl sm:text-3xl mb-4">Produits Interdits &amp; Sécurité</h1>

        <p className="text-gray-700 mb-6">Veuillez vérifier ces catégories d'articles avant de commander. Le non-respect des règles peut entrainer le refus ou le retour de l'envoi aux frais du client.</p>

        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <ul className="space-y-4 text-gray-800">
            <li className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 mt-1" size={22} />
              <div>
                <div className="font-bold">🚫 Armes et Munitions</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Flame className="text-orange-600 mt-1" size={22} />
              <div>
                <div className="font-bold">🔥 Produits inflammables</div>
                <div className="text-sm text-gray-600">(Parfums, Aérosols, batteries non emballées)</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <ShieldCheck className="text-yellow-600 mt-1" size={22} />
              <div>
                <div className="font-bold">🔞 Produits à caractère sexuel</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="text-xl mt-1">💊</span>
              <div>
                <div className="font-bold">Drogues et substances illicites</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="text-xl mt-1">💰</span>
              <div>
                <div className="font-bold">Argent liquide et Bijoux de luxe</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="text-xl mt-1">🥩</span>
              <div>
                <div className="font-bold">Produits périssables</div>
              </div>
            </li>
          </ul>
        </section>

        <div className="mt-6">
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold">
            Retour à l'accueil
          </Link>
          <a
            href="https://wa.me/50932836938"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 ml-4 bg-green-500 text-white px-4 py-2 rounded font-bold"
          >
            <MessageCircle size={18} /> <span className="font-bold">Contact WhatsApp</span>
          </a>
        </div>
      </main>
    </div>
  );
}
