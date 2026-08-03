"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ProductCard } from "@/components/public/ProductCard";
import { useWishlist } from "@/components/public/WishlistContext";

type Product = {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: string[];
};

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pas de favoris à charger
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/products-by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-7xl px-4 py-16">
        <h1 className="mb-8 text-2xl font-semibold">Mes favoris</h1>

        {loading ? (
          <p className="text-sm text-[#6C757D]">Chargement...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-[#6C757D]">
            Aucun favori pour l&apos;instant. Clique sur le cœur d&apos;un
            produit pour l&apos;ajouter ici.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
        )}
      </main>
      <Footer />
    </>
  );
}
