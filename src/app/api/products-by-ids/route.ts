import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { ids } = (await req.json()) as { ids: string[] };
  if (!ids?.length) return NextResponse.json({ products: [] });

  const products = await prisma.product
    .findMany({ where: { id: { in: ids } } })
    .catch(() => []);

  return NextResponse.json({ products });
}
