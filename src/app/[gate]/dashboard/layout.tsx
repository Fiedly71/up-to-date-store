import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const links = [
    { href: `/${gate}/dashboard`, label: "Caisse (POS)", superAdminOnly: false },
    { href: `/${gate}/dashboard/stock`, label: "Stock & Produits", superAdminOnly: true },
    { href: `/${gate}/dashboard/sales`, label: "Ventes & Factures", superAdminOnly: true },
    { href: `/${gate}/dashboard/report`, label: "Rapport quotidien", superAdminOnly: true },
    { href: `/${gate}/dashboard/content`, label: "Contenu du site", superAdminOnly: true },
    { href: `/${gate}/dashboard/marketing`, label: "Marketing (emails)", superAdminOnly: true },
    { href: `/${gate}/dashboard/staff`, label: "Comptes staff", superAdminOnly: true },
    { href: `/${gate}/dashboard/audit`, label: "Journal d'audit", superAdminOnly: true },
    { href: `/${gate}/dashboard/security`, label: "Ma sécurité (2FA)", superAdminOnly: false },
  ].filter((link) => !link.superAdminOnly || isSuperAdmin);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0 border-r border-[#E9ECEF] bg-[#F8F9FA] p-4">
        <div className="mb-8 text-lg font-semibold">UpDate — Comptoir</div>
        <nav className="space-y-1 text-sm">
          {links.map((link) => (
            <a
              key={link.href}
              className="block rounded-lg px-3 py-2 text-[#1A1A1A] hover:bg-white"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <header className="mb-6 flex items-center justify-between">
          <span className="text-sm text-[#6C757D]">
            Connecté : {session?.name ?? "—"} ({session?.role === "SUPER_ADMIN" ? "Super Admin" : "Caissier"})
          </span>
          <form action={`/${gate}/login`} method="GET">
            <button className="text-xs text-[#6C757D] underline">Retour connexion</button>
          </form>
        </header>
        {children}
      </main>
    </div>
  );
}
