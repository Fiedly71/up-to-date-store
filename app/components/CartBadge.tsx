"use client";

import { useCart } from "@/app/context/CartContext";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CartBadge() {
  const { cart } = useCart();

  // On utilise || 0 pour s'assurer que si le panier est vide, on affiche 0
  // On utilise item.quantity || 1 pour corriger l'erreur TypeScript "possibly undefined"
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <Link href="/panier" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
      <ShoppingCart size={24} className="text-gray-700" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}