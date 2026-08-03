import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-2xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-semibold">Politique de confidentialité</h1>
        <div className="space-y-6 text-sm text-[#6C757D]">
          <section>
            <h2 className="mb-2 text-base font-medium text-[#1A1A1A]">
              Données collectées
            </h2>
            <p>
              [À compléter par Gui] — ex. nom, email, téléphone et adresse de
              livraison lors d&apos;une commande ; historique d&apos;achat ;
              informations de paiement traitées directement par Stripe (nous
              ne stockons jamais ton numéro de carte).
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-medium text-[#1A1A1A]">
              Utilisation des données
            </h2>
            <p>
              [À compléter] — ex. traitement des commandes, communication
              relative à ta commande, amélioration du service.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-medium text-[#1A1A1A]">Tes droits</h2>
            <p>
              [À compléter] — ex. tu peux demander la suppression de tes
              données en nous contactant sur WhatsApp.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
