import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function BriefThanksPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-xl px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Brief bien reçu !</h1>
        <p className="text-sm text-[#6C757D]">
          Notre équipe étudie ton projet et te recontacte sous 48h avec un
          devis personnalisé — par email ou WhatsApp.
        </p>
      </main>
      <Footer />
    </>
  );
}
