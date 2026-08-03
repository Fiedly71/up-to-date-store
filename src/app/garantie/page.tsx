import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function WarrantyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-2xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-semibold">Garantie & Support</h1>

        <div className="space-y-6 text-sm text-[#6C757D]">
          <section>
            <h2 className="mb-2 text-base font-medium text-[#1A1A1A]">Garantie produit</h2>
            <p>
              [À compléter par Gui] — ex. Tous nos produits neufs sont couverts
              par une garantie de X mois contre les défauts de fabrication, à
              compter de la date d&apos;achat (facture ou reçu requis).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-[#1A1A1A]">
              Comment faire une réclamation ?
            </h2>
            <p>
              [À compléter] — ex. Contacte-nous sur WhatsApp avec ton numéro
              de commande et une description du problème. On te recontacte
              sous 48h.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-[#1A1A1A]">
              Ce qui n&apos;est pas couvert
            </h2>
            <p>
              [À compléter] — ex. Dommages liés à une mauvaise utilisation,
              chute, contact avec l&apos;eau, ou modifications non autorisées.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
