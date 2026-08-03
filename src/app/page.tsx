import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Hero } from "@/components/public/Hero";
import { BrandsStrip } from "@/components/public/BrandsStrip";
import { Footer } from "@/components/public/Footer";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { StoreMap } from "@/components/public/StoreMap";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <BrandsStrip />

        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-semibold">Nos deux pôles d&apos;expertise</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/shop"
              className="rounded-2xl border border-[#E9ECEF] bg-[#F8F9FA] p-8 transition hover:border-[#FF523B]"
            >
              <p className="mb-2 text-sm font-medium text-[#FF523B]">Équipements & Hardware</p>
              <h3 className="mb-2 text-lg font-semibold">La boutique high-tech</h3>
              <p className="text-sm text-[#6C757D]">
                Smartphones, éclairage créateur, projecteurs HD — livraison rapide,
                paiement Stripe & Moncash.
              </p>
            </Link>
            <Link
              href="/services"
              className="rounded-2xl border border-[#E9ECEF] bg-[#F8F9FA] p-8 transition hover:border-[#FF523B]"
            >
              <p className="mb-2 text-sm font-medium text-[#FF523B]">Solutions Digitales</p>
              <h3 className="mb-2 text-lg font-semibold">Web & Apps sur mesure</h3>
              <p className="text-sm text-[#6C757D]">
                Sites e-commerce, applications mobiles et tableaux de bord
                d&apos;administration, conçus sur mesure pour ton activité.
              </p>
            </Link>
          </div>
        </section>

        <TestimonialsSection />
        <FaqAccordion />
        <StoreMap />
      </main>
      <Footer />
    </>
  );
}
