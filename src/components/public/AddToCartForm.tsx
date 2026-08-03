"use client";

import { useState } from "react";
import { useCart } from "@/components/public/CartContext";
import { PriceTag } from "@/components/public/PriceTag";

type VariantOption = {
  id: string;
  name: string;
  priceDiff: number;
  stock: number;
  colorHex?: string | null;
  image?: string | null;
};

export function AddToCartForm({
  productId,
  productName,
  basePrice,
  baseStock,
  image,
  variants,
  onVariantImageChange,
}: {
  productId: string;
  productName: string;
  basePrice: number;
  baseStock: number;
  image?: string;
  variants: VariantOption[];
  onVariantImageChange?: (image: string | null) => void;
}) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState<string | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const activeVariant = variants.find((v) => v.id === variantId);
  const price = basePrice + (activeVariant?.priceDiff ?? 0);
  const stock = activeVariant?.stock ?? baseStock;
  const outOfStock = stock <= 0;
  const hasSwatches = variants.some((v) => v.colorHex);

  function selectVariant(v: VariantOption) {
    setVariantId(v.id);
    onVariantImageChange?.(v.image ?? null);
  }

  function handleAdd() {
    addItem({
      productId,
      variantId,
      name: productName,
      variantName: activeVariant?.name,
      unitPrice: price,
      image: activeVariant?.image ?? image,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div>
      <div className="mb-4">
        <PriceTag cents={price} size="lg" />
      </div>

      {variants.length > 0 && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Variante</label>

          {hasSwatches ? (
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVariant(v)}
                  disabled={v.stock <= 0}
                  title={`${v.name}${v.stock <= 0 ? " (rupture)" : ""}`}
                  aria-label={v.name}
                  aria-pressed={variantId === v.id}
                  className={`h-9 w-9 rounded-full border-2 disabled:opacity-30 ${
                    variantId === v.id ? "border-[#FF523B]" : "border-[#E9ECEF]"
                  }`}
                  style={{ backgroundColor: v.colorHex ?? "#E9ECEF" }}
                />
              ))}
            </div>
          ) : (
            <select
              value={variantId}
              onChange={(e) => {
                const v = variants.find((x) => x.id === e.target.value);
                if (v) selectVariant(v);
              }}
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                  {v.name} {v.stock <= 0 ? "(rupture)" : ""}
                </option>
              ))}
            </select>
          )}
          {activeVariant && <p className="mt-2 text-xs text-[#6C757D]">{activeVariant.name}</p>}
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium">Quantité</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="w-20 rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="w-full rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white disabled:bg-[#E9ECEF] disabled:text-[#6C757D]"
      >
        {outOfStock ? "Rupture de stock" : added ? "Ajouté ✓" : "Ajouter au panier"}
      </button>
    </div>
  );
}
