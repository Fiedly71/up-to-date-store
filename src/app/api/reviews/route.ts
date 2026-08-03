import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewCreateSchema, parseOrError } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId manquant." }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return NextResponse.json({ reviews, avgRating, count: reviews.length });
}

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(reviewCreateSchema, await req.json());
  if (error) return error;

  const { productId, authorName, rating, comment, images, website } = body;

  // Honeypot : un humain ne remplit jamais ce champ caché. On répond comme
  // si l'avis avait bien été envoyé (pour ne pas signaler au bot qu'il a
  // été détecté), mais on ne crée rien en base.
  if (website) {
    return NextResponse.json({ ok: true, message: "Avis envoyé, en attente de modération." });
  }

  // approved reste à false : un avis n'apparaît publiquement qu'après
  // modération manuelle (protège contre le spam / faux avis).
  await prisma.review.create({
    data: { productId, authorName, rating, comment, images: images ?? [], approved: false },
  });

  return NextResponse.json({ ok: true, message: "Avis envoyé, en attente de modération." });
}
