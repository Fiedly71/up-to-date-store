"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function ShopFilters({ categories }: { categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <label htmlFor="category-filter" className="sr-only">
        Filtrer par catégorie
      </label>
      <select
        id="category-filter"
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="rounded-lg border border-[#E9ECEF] px-3 py-2"
      >
        <option value="">Toutes catégories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <label htmlFor="sort-filter" className="sr-only">
        Trier les produits
      </label>
      <select
        id="sort-filter"
        defaultValue={searchParams.get("sort") ?? ""}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="rounded-lg border border-[#E9ECEF] px-3 py-2"
      >
        <option value="">Trier par : Nouveautés</option>
        <option value="price_asc">Prix croissant</option>
        <option value="price_desc">Prix décroissant</option>
      </select>
    </div>
  );
}
