import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { REFERRAL_BONUS_POINTS, POINTS_TO_DOLLAR_RATE } from "@/lib/loyalty";

export default function ReferralPage() {
  const bonusDollars = (REFERRAL_BONUS_POINTS / POINTS_TO_DOLLAR_RATE).toFixed(2);

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-2xl px-4 py-16">
        <h1 className="mb-4 text-2xl font-semibold">Parraine tes proches</h1>
        <p className="mb-8 text-sm text-[#6C757D]">
          Crée ton compte, partage ton code de parrainage personnel avec tes
          proches — dès qu&apos;ils créent un compte avec ton code, vous
          recevez chacun {REFERRAL_BONUS_POINTS} points (soit ${bonusDollars}{" "}
          de réduction), automatiquement.
        </p>

        <Link
          href="/account/register"
          className="inline-block rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white"
        >
          Créer mon compte et obtenir mon code
        </Link>

        <p className="mt-4 text-sm text-[#6C757D]">
          Déjà un compte ?{" "}
          <Link href="/account" className="text-[#FF523B]">
            Retrouve ton code dans ton espace client
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
