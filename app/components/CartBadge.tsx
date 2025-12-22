"use client";
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CartBadge() {
  const { cart } = useCart();
  
  // On calcule le nombre total d'articles (somme des quantités)
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link href="/panier" className="fixed top-20 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-transform transform hover:scale-110">
      <div className="relative">
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white animate-in zoom-in duration-300">
            {totalItems}
          </span>
        )}
      </div>
    </Link>
  );
}