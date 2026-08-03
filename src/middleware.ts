import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

// Le "gate" (chemin secret du POS) vient uniquement d'une variable d'environnement.
// Il n'est jamais codé en dur, jamais lié publiquement, et absent du sitemap/robots.
const GATE = process.env.ADMIN_GATE_SLUG;

// Sous-sections réservées au SUPER_ADMIN (un CASHIER ne doit voir/toucher
// ni la fixation des prix/stock, ni l'historique complet des ventes, ni le
// rapport de clôture, ni la gestion du contenu public). Le CASHIER garde
// uniquement l'accès à la caisse (POS) elle-même.
const SUPER_ADMIN_ONLY_DASHBOARD = ["stock", "sales", "report", "content", "staff", "audit", "marketing"];
const SUPER_ADMIN_ONLY_API = ["products", "orders", "report", "content", "upload", "backup", "variants", "staff", "audit", "marketing"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  if (!GATE || segments[0] !== GATE) {
    return NextResponse.next();
  }

  // On est sur une route du gate secret.
  const isLoginPage = segments[1] === "login";
  const isDashboard = segments[1] === "dashboard";
  const isApi = segments[1] === "api";

  if (isLoginPage) {
    return NextResponse.next();
  }

  if (isDashboard || isApi) {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      const loginUrl = new URL(`/${GATE}/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }

    const sub = segments[2]; // ex. "stock", "sales", "products"...
    const restrictedList = isDashboard ? SUPER_ADMIN_ONLY_DASHBOARD : SUPER_ADMIN_ONLY_API;

    if (sub && restrictedList.includes(sub) && session.role !== "SUPER_ADMIN") {
      if (isApi) {
        return NextResponse.json(
          { error: "Réservé aux super-administrateurs." },
          { status: 403 }
        );
      }
      const dashboardHome = new URL(`/${GATE}/dashboard`, req.url);
      return NextResponse.redirect(dashboardHome);
    }
  }

  return NextResponse.next();
}

export const config = {
  // On exclut les fichiers statiques pour ne pas ralentir le site public
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
