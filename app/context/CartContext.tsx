"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface Product {
  id: string | number;
  name: string;
  image: string;
  quantity?: number;
  price?: number;
  url?: string;
  color?: string;
  size?: string;
  notes?: string;
  source?: string;
}

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string | number) => void;
  clearCart: () => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // ÉTAPE A : Charger au démarrage
  const [cart, setCart] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mon-panier-unique");
    if (saved) {
      setCart(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // ÉTAPE B : Sauvegarder à chaque changement
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("mon-panier-unique", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      // For AliExpress products, use itemId+color+size as unique key
      const matchId = product.id;
      const exists = prev.find((item) => item.id === matchId && item.color === product.color && item.size === product.size);
      if (exists) {
        return prev.map((item) =>
          item.id === matchId && item.color === product.color && item.size === product.size
            ? { ...item, quantity: (item.quantity || 0) + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity } : item));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart error");
  return context;
};