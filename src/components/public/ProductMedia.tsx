"use client";

import { useState } from "react";
import Image from "next/image";
import { AddToCartForm } from "@/components/public/AddToCartForm";

type VariantOption = {
  id: string;
  name: string;
  priceDiff: number;
  stock: number;
  colorHex?: string | null;
  image?: string | null;
};

export function ProductMedia({
  productId,
  productName,
  description,
  basePrice,
  baseStock,
  baseImage,
  variants,
}: {
  productId: string;
  productName: string;
  description?: string | null;
  basePrice: number;
  baseStock: number;
  baseImage?: string;
  variants: VariantOption[];
}) {
  const [activeImage, setActiveImage] = useState<string | undefined>(baseImage);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="relative flex aspect-square items-center justify-center rounded-2xl bg-[#F8F9FA] text-sm text-[#6C757D]">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={productName}
            fill
            className="rounded-2xl object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          "[ image produit ]"
        )}
      </div>

      <div>
        <h1 className="mb-2 text-2xl font-semibold">{productName}</h1>
        {description && <p className="mb-6 text-sm text-[#6C757D]">{description}</p>}
        <AddToCartForm
          productId={productId}
          productName={productName}
          basePrice={basePrice}
          baseStock={baseStock}
          image={baseImage}
          variants={variants}
          onVariantImageChange={(img) => setActiveImage(img ?? baseImage)}
        />
      </div>
    </div>
  );
}
