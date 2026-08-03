import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { variants: true },
    take: 20,
  });

  // Un scan de code-barres tape le SKU exact puis Entrée quasi
  // instantanément — on signale au client s'il y a une correspondance
  // exacte de SKU pour lui permettre l'ajout automatique au panier.
  const exactSkuMatch = products.find((p) => p.sku.toLowerCase() === q.toLowerCase());

  return NextResponse.json({ products, exactSkuMatchId: exactSkuMatch?.id ?? null });
}
