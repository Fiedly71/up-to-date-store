import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ProductMedia } from "@/components/public/ProductMedia";
import { ProductReviews } from "@/components/public/ProductReviews";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } }).catch(() => null);

  if (!product) return { title: "Produit introuvable — UpDate" };

  const description =
    product.description?.slice(0, 155) ??
    `${product.name} disponible chez UpDate Tech & Digital Solutions, Cap-Haïtien.`;

  return {
    title: `${product.name} — UpDate Tech & Digital Solutions`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product
    .findUnique({ where: { id }, include: { variants: true } })
    .catch(() => null);

  if (!product) notFound();

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto flex-1 max-w-5xl px-4 py-16">
        <ProductMedia
          productId={product.id}
          productName={product.name}
          description={product.description}
          basePrice={product.price}
          baseStock={product.stock}
          baseImage={product.images?.[0]}
          variants={product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            priceDiff: v.priceDiff,
            stock: v.stock,
            colorHex: v.colorHex,
            image: v.image,
          }))}
        />

        <ProductReviews productId={product.id} />
      </main>
      <Footer />
    </>
  );
}
