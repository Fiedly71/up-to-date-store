import { verifyTwoFactorLogin } from "./actions";

export default async function TwoFactorLoginPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action={verifyTwoFactorLogin.bind(null, gate)}
        className="admin-card w-full max-w-sm p-8"
      >
        <h1 className="mb-1 text-xl font-semibold">Vérification en 2 étapes</h1>
        <p className="mb-6 text-sm text-[#6C757D]">
          Entre le code à 6 chiffres de ton application d&apos;authentification.
        </p>

        <label htmlFor="code" className="mb-1 block text-sm font-medium">Code</label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          maxLength={6}
          required
          autoFocus
          className="mb-6 w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-center text-lg tracking-widest outline-none focus:border-[#2F6F4F]"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-[#2F6F4F] py-2 text-sm font-medium text-white"
        >
          Vérifier
        </button>
      </form>
    </main>
  );
}
