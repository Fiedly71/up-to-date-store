import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function CheckoutCancelPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-xl px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Paiement annulé</h1>
        <p className="text-sm text-[#6C757D]">
          Aucun montant n&apos;a été débité. Ton panier est toujours disponible si tu
          veux réessayer.
        </p>
      </main>
      <Footer />
    </>
  );
}
