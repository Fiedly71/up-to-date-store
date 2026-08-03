import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { variantCreateSchema, variantUpdateSchema, parseOrError } from "@/lib/validation";

async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId manquant." }, { status: 400 });

  const variants = await prisma.variant.findMany({ where: { productId } });
  return NextResponse.json({ variants });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: body, error } = parseOrError(variantCreateSchema, await req.json());
  if (error) return error;

  const variant = await prisma.variant.create({
    data: {
      productId: body.productId,
      name: body.name,
      sku: body.sku,
      stock: body.stock ?? 0,
      priceDiff: Math.round((body.priceDiff ?? 0) * 100),
      colorHex: body.colorHex || null,
      image: body.image || null,
    },
  });
  return NextResponse.json({ variant });
}

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: body, error } = parseOrError(variantUpdateSchema, await req.json());
  if (error) return error;

  const { id, ...rest } = body;
  const data: Record<string, unknown> = {};
  if (rest.name !== undefined) data.name = rest.name;
  if (rest.stock !== undefined) data.stock = rest.stock;
  if (rest.priceDiff !== undefined) data.priceDiff = Math.round(rest.priceDiff * 100);
  if (rest.colorHex !== undefined) data.colorHex = rest.colorHex || null;
  if (rest.image !== undefined) data.image = rest.image || null;

  const variant = await prisma.variant.update({ where: { id }, data });
  return NextResponse.json({ variant });
}

export async function DELETE(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });

  await prisma.variant.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
