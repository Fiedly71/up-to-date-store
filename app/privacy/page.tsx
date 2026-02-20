import Navbar from "@/app/components/Navbar";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold">&larr; Retour à l'accueil</Link>
        </div>
        <div className="premium-card rounded-2xl p-8 bg-white">
          <h1 className="text-3xl font-extrabold mb-6">Politique de Confidentialité</h1>
          <p className="text-gray-700 mb-4">
            Cette politique explique comment Up-to-date Electronic Store (« nous », « notre », « nos ») collecte, utilise,
            divulgue et protège vos informations personnelles lorsque vous utilisez notre site et nos services.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">1. Informations collectées</h2>
          <p className="text-gray-700 mb-2">Nous collectons :</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Données d’identification (nom, e-mail, téléphone)</li>
            <li>Informations de commande et de livraison</li>
            <li>Données techniques (adresse IP, logs, cookies)</li>
          </ul>
          <h2 className="text-xl font-bold mt-6 mb-3">2. Finalités du traitement</h2>
          <p className="text-gray-700 mb-4">
            Nous utilisons vos données pour traiter vos commandes, fournir le support client, personnaliser votre
            expérience, communiquer des mises à jour, et assurer la sécurité du site.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">3. Partage des données</h2>
          <p className="text-gray-700 mb-4">
            Nous ne vendons pas vos données. Elles peuvent être partagées avec des prestataires (paiement, livraison,
            hébergement) strictement pour l’exécution du service.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">4. Cookies et traçeurs</h2>
          <p className="text-gray-700 mb-4">
            Nous utilisons des cookies fonctionnels et analytiques. Vous pouvez gérer vos préférences via le bandeau
            d’acceptation et les paramètres de votre navigateur.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">5. Durées de conservation</h2>
          <p className="text-gray-700 mb-4">Vos données sont conservées le temps nécessaire aux finalités décrites ci-dessus.</p>
          <h2 className="text-xl font-bold mt-6 mb-3">6. Vos droits</h2>
          <p className="text-gray-700 mb-4">
            Vous disposez des droits d’accès, rectification, effacement, opposition et limitation. Contactez-nous pour
            exercer ces droits.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">7. Sécurité</h2>
          <p className="text-gray-700 mb-4">Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données.</p>
          <h2 className="text-xl font-bold mt-6 mb-3">8. Droit applicable</h2>
          <p className="text-gray-700 mb-4">Cette Politique est régie par les lois d’Haïti.</p>
          <h2 className="text-xl font-bold mt-6 mb-3">9. Responsable du traitement</h2>
          <p className="text-gray-700 mb-4">Up-to-date Electronic Store agit en qualité de responsable du traitement des données collectées.</p>
          <h2 className="text-xl font-bold mt-6 mb-3">10. Contact</h2>
          <p className="text-gray-700">Pour toute question, contactez notre support via WhatsApp ou e-mail.</p>
        </div>
      </div>
    </section>
    </div>
  );
}
