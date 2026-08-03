"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const mainColumns = [
  {
    title: "Liens",
    items: [
      { label: "Produits", href: "/shop" },
      { label: "Suivi de commande", href: "/suivi-commande" },
      { label: "Panier", href: "/cart" },
      { label: "Blog Tech", href: "/blog" },
      { label: "Parrainage", href: "/parrainage" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "À propos", href: "/a-propos" },
      { label: "Garantie & Support", href: "/garantie" },
      { label: "Politique de confidentialité", href: "/confidentialite" },
      { label: "Retours", href: "/retours" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
];

export function Footer() {
  const [categoryItems, setCategoryItems] = useState<{ label: string; href: string }[]>([
    { label: "Voir tous les produits", href: "/shop" },
  ]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const categories = data.categories ?? [];
        if (categories.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial des catégories au montage
          setCategoryItems(
            categories.map((c: { name: string; slug: string }) => ({
              label: c.name,
              href: `/shop?category=${c.slug}`,
            }))
          );
        }
      });
  }, []);

  return (
    <footer className="mt-auto border-t border-[#E9ECEF] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 text-xl font-bold">
            update<span className="text-[#FF523B]">.</span>
          </div>
          <p className="text-sm text-[#6C757D]">
            Champin, Cap-Haïtien, Haïti
            <br />
            +509 32 83 6938
          </p>
        </div>

        {mainColumns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2 text-sm text-[#6C757D]">
              {col.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#FF523B]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-3 text-sm font-semibold">Catégories</h4>
          <ul className="space-y-2 text-sm text-[#6C757D]">
            {categoryItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-[#FF523B]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[#E9ECEF] py-4 text-center text-xs text-[#6C757D]">
        © {new Date().getFullYear()} UpDate Tech & Digital Solutions. Tous droits réservés.
      </div>
    </footer>
  );
}
