"use client";

import { useWishlist } from "@/components/public/WishlistContext";

export function WishlistButton({ productId }: { productId: string }) {
  const { toggle, has } = useWishlist();
  const active = has(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
    >
      <span className={active ? "text-[#FF523B]" : "text-[#6C757D]"}>{active ? "♥" : "♡"}</span>
    </button>
  );
}
