import { login } from "./actions";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action={login.bind(null, gate)}
        className="admin-card w-full max-w-sm p-8"
      >
        <h1 className="mb-1 text-xl font-semibold">Espace comptoir UpDate</h1>
        <p className="mb-6 text-sm text-[#6C757D]">Accès réservé au personnel autorisé.</p>

        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mb-4 w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm outline-none focus:border-[#2F6F4F]"
        />

        <label htmlFor="password" className="mb-1 block text-sm font-medium">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mb-6 w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm outline-none focus:border-[#2F6F4F]"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-[#2F6F4F] py-2 text-sm font-medium text-white"
        >
          Se connecter
        </button>
      </form>
    </main>
  );
}
