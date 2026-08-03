import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ProductCard } from "@/components/public/ProductCard";
import { ShopFilters } from "@/components/public/ShopFilters";
import { prisma } from "@/lib/prisma";
import { fuzzyMatch } from "@/lib/search";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  const { q, category, sort, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let totalCount = 0;
  let usedFuzzy = false;

  const where = {
    AND: [
      q ? { name: { contains: q, mode: "insensitive" as const } } : {},
      category ? { category: { slug: category } } : {},
    ],
  };

  try {
    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

    [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy:
          sort === "price_asc"
            ? { price: "asc" }
            : sort === "price_desc"
            ? { price: "desc" }
            : { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ]);

    // Repli recherche floue : si la recherche exacte ne renvoie rien (ex.
    // faute de frappe "iphon" au lieu de "iphone"), on retente en tolérant
    // les fautes sur un lot plus large de produits de la catégorie visée.
    if (q && products.length === 0) {
      const candidates = await prisma.product.findMany({
        where: category ? { category: { slug: category } } : {},
        take: 500,
      });
      products = fuzzyMatch(q, candidates, PAGE_SIZE);
      totalCount = products.length;
      usedFuzzy = products.length > 0;
    }
  } catch {
    // Base de données pas encore connectée / vide — on affiche l'état vide.
    products = [];
    categories = [];
    totalCount = 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    params.set("page", String(targetPage));
    return `/shop?${params.toString()}`;
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Boutique high-tech</h1>
        </div>

        <ShopFilters
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />

        {products.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-[#E9ECEF] p-12 text-center text-sm text-[#6C757D]">
            {q || category
              ? "Aucun produit ne correspond à ta recherche."
              : "Aucun produit pour l'instant. Ajoute tes produits (nom, prix, stock, images) via le dashboard admin, et ils apparaîtront ici automatiquement."}
          </div>
        ) : (
          <>
            {usedFuzzy && (
              <p className="mt-4 text-sm text-[#6C757D]">
                Aucun résultat exact pour &quot;{q}&quot; — voici des produits proches.
              </p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    compareAtPrice: p.compareAtPrice,
                    stock: p.stock,
                    image: p.images?.[0],
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Pagination des produits"
                className="mt-10 flex items-center justify-center gap-2 text-sm"
              >
                <Link
                  href={pageHref(Math.max(1, page - 1))}
                  aria-disabled={page === 1}
                  className={`rounded-lg border border-[#E9ECEF] px-3 py-2 ${
                    page === 1 ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  Précédent
                </Link>
                <span className="text-[#6C757D]">
                  Page {page} / {totalPages}
                </span>
                <Link
                  href={pageHref(Math.min(totalPages, page + 1))}
                  aria-disabled={page === totalPages}
                  className={`rounded-lg border border-[#E9ECEF] px-3 py-2 ${
                    page === totalPages ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  Suivant
                </Link>
              </nav>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
