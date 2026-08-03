import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-xl px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Merci pour ta commande !</h1>
        <p className="text-sm text-[#6C757D]">
          Ton paiement a été confirmé. Un email de confirmation te sera envoyé
          sous peu, et notre équipe prépare ta commande pour livraison.
        </p>
      </main>
      <Footer />
    </>
  );
}
