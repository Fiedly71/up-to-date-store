import Navbar from "@/app/components/Navbar";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold">&larr; Retour à l'accueil</Link>
        </div>
        <div className="premium-card rounded-2xl p-8 bg-white">
          <h1 className="text-3xl font-extrabold mb-6">Conditions Générales d’Utilisation</h1>
          <h2 className="text-xl font-bold mt-6 mb-3">1. Objet</h2>
          <p className="text-gray-700 mb-4">
            Les présentes Conditions régissent l’accès et l’utilisation du site Up-to-date Electronic Store et de ses services.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">2. Commandes et paiements</h2>
          <p className="text-gray-700 mb-4">
            Toute commande implique l’acceptation des prix et modalités affichés. Les paiements sont effectués selon les options
            convenues et peuvent être soumis à vérification.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">3. Expédition et livraison</h2>
          <p className="text-gray-700 mb-4">
            Les délais d’expédition sont indicatifs. Nous nous efforçons de livrer dans les meilleurs délais, sans garantie absolue
            en cas d’aléas logistiques.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">4. Retours et réclamations</h2>
          <p className="text-gray-700 mb-4">
            Les retours sont acceptés selon nos politiques internes et la nature du produit. Les réclamations doivent être faites
            dans un délai raisonnable après réception.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">5. Responsabilité</h2>
          <p className="text-gray-700 mb-4">
            Nous ne saurions être tenus responsables des dommages indirects ou résultant d’une mauvaise utilisation des produits.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">6. Propriété intellectuelle</h2>
          <p className="text-gray-700 mb-4">
            Le contenu du site (textes, images, logos) est protégé. Toute reproduction non autorisée est interdite.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">7. Modifications</h2>
          <p className="text-gray-700 mb-4">
            Nous nous réservons le droit de modifier les présentes Conditions. Les mises à jour seront publiées sur cette page.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">8. Droit applicable</h2>
          <p className="text-gray-700 mb-4">Les présentes Conditions sont régies par les lois d’Haïti.</p>
        </div>
      </div>
    </section>    </div>  );
}
