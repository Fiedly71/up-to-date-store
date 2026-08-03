import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-2xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-semibold">À propos d&apos;UpDate</h1>
        <div className="space-y-4 text-sm text-[#6C757D]">
          <p>
            Basée à Champin, Cap-Haïtien, UpDate Tech &amp; Digital Solutions
            est une entreprise technologique qui accompagne particuliers et
            entreprises dans leur transformation numérique — entre vente
            d&apos;équipements high-tech et développement de solutions
            digitales sur mesure.
          </p>
          <p>
            Notre vision : allier la proximité d&apos;un commerce local au
            Cap-Haïtien aux standards technologiques internationaux, pour une
            expérience fluide, sécurisée et accessible à tous nos clients.
          </p>
          <p>[À compléter par Gui — histoire de l&apos;entreprise, équipe, valeurs]</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
