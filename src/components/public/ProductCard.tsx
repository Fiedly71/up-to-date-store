import Link from "next/link";
import Image from "next/image";
import { PriceTag } from "@/components/public/PriceTag";
import { StarRating } from "@/components/public/StarRating";
import { WishlistButton } from "@/components/public/WishlistButton";

export type ProductCardData = {
  id: string;
  name: string;
  price: number; // cents
  compareAtPrice?: number | null;
  stock: number;
  image?: string;
  avgRating?: number;
  reviewCount?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group rounded-xl border border-[#E9ECEF] bg-white p-3 transition hover:border-[#FF523B]"
    >
      <div className="relative mb-3 flex aspect-square items-center justify-center rounded-lg bg-[#F8F9FA] text-xs text-[#6C757D]">
        <WishlistButton productId={product.id} />
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          "[ image produit ]"
        )}
      </div>

      <h3 className="mb-1 line-clamp-2 text-sm font-medium">{product.name}</h3>

      {product.reviewCount ? (
        <div className="mb-1">
          <StarRating rating={product.avgRating ?? 0} count={product.reviewCount} size="sm" />
        </div>
      ) : null}

      <PriceTag cents={product.price} compareAtCents={product.compareAtPrice} size="sm" />

      {outOfStock ? (
        <span className="mt-2 inline-block rounded bg-[#F8F9FA] px-2 py-0.5 text-[11px] text-[#6C757D]">
          Rupture de stock
        </span>
      ) : product.stock < 3 ? (
        <span className="mt-2 inline-block rounded bg-[#FFF1EF] px-2 py-0.5 text-[11px] text-[#FF523B]">
          Stock limité
        </span>
      ) : null}
    </Link>
  );
}
