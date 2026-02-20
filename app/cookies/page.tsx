import Navbar from "@/app/components/Navbar";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold">&larr; Retour à l'accueil</Link>
        </div>
        <div className="premium-card rounded-2xl p-8 bg-white">
          <h1 className="text-3xl font-extrabold mb-6">Politique de Cookies</h1>
          <p className="text-gray-700 mb-4">
            Nous utilisons des cookies et technologies similaires pour améliorer les fonctionnalités du site,
            analyser l’audience et personnaliser le contenu.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">1. Qu’est-ce qu’un cookie ?</h2>
          <p className="text-gray-700 mb-4">
            Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez notre site.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">2. Types de cookies utilisés</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Cookies essentiels : nécessaires au fonctionnement du site.</li>
            <li>Cookies de performance : mesure d’audience et analytics.</li>
            <li>Cookies de personnalisation : préférences utilisateur.</li>
          </ul>
          <h2 className="text-xl font-bold mt-6 mb-3">3. Gestion des cookies</h2>
          <p className="text-gray-700 mb-4">
            Vous pouvez accepter ou refuser les cookies via notre bandeau d’acceptation et paramétrer votre navigateur
            pour les bloquer ou les supprimer.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">4. Durée de vie des cookies</h2>
          <p className="text-gray-700 mb-4">Les cookies ont une durée variable, généralement de quelques minutes à 13 mois.</p>
          <h2 className="text-xl font-bold mt-6 mb-3">5. Droit applicable</h2>
          <p className="text-gray-700 mb-4">Cette Politique de Cookies est régie par les lois d’Haïti.</p>
          <h2 className="text-xl font-bold mt-6 mb-3">6. Contact</h2>
          <p className="text-gray-700">Pour toute question, consultez notre Politique de Confidentialité ou contactez-nous.</p>
        </div>
      </div>
    </section>
    </div>
  );
}
