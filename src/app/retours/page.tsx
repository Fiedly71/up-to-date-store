import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-2xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-semibold">Politique de retours</h1>
        <div className="space-y-6 text-sm text-[#6C757D]">
          <section>
            <h2 className="mb-2 text-base font-medium text-[#1A1A1A]">
              Délai de retour
            </h2>
            <p>
              [À compléter par Gui] — ex. tu as X jours après réception pour
              signaler un défaut ou une erreur de commande.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-medium text-[#1A1A1A]">
              Conditions
            </h2>
            <p>
              [À compléter] — ex. produit non ouvert, emballage d&apos;origine,
              facture ou reçu requis.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-medium text-[#1A1A1A]">
              Comment faire une demande
            </h2>
            <p>
              [À compléter] — ex. contacte-nous sur WhatsApp avec ton numéro
              de commande. Voir aussi notre page Garantie &amp; Support.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
