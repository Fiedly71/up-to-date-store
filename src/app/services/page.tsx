import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { servicePacks } from "@/lib/servicePacks";
import { PriceTag } from "@/components/public/PriceTag";

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-7xl px-4 py-16">
        <h1 className="mb-2 text-2xl font-semibold">Services digitaux & tarifs</h1>
        <p className="mb-10 text-sm text-[#6C757D]">
          Sites, applications et dashboards sur mesure. Les packs à prix fixe
          se paient directement après le brief ; les projets sur mesure
          passent par une demande de devis, sans paiement immédiat.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {servicePacks.map((pack) => (
            <div
              key={pack.slug}
              className="flex flex-col rounded-2xl border border-[#E9ECEF] bg-[#F8F9FA] p-6"
            >
              <h3 className="mb-2 text-lg font-semibold">{pack.name}</h3>
              <p className="mb-4 text-sm text-[#6C757D]">{pack.description}</p>
              <ul className="mb-6 flex-1 space-y-2 text-sm text-[#6C757D]">
                {pack.features.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>

              {pack.kind === "FIXED_PACK" ? (
                <p className="mb-4 text-xl font-semibold text-[#FF523B]">
                  <PriceTag cents={pack.price} />
                </p>
              ) : (
                <p className="mb-4 text-sm font-medium text-[#6C757D]">
                  Devis personnalisé
                </p>
              )}

              <Link
                href={`/services/brief?pack=${pack.slug}`}
                className="rounded-xl bg-[#FF523B] px-6 py-3 text-center text-sm font-medium text-white"
              >
                {pack.kind === "FIXED_PACK" ? "Commander ce pack" : "Demander un devis"}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
