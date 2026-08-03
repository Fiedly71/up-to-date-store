import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { productCreateSchema, productUpdateSchema, parseOrError } from "@/lib/validation";

async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: body, error } = parseOrError(productCreateSchema, await req.json());
  if (error) return error;

  const product = await prisma.product.create({
    data: {
      name: body.name,
      sku: body.sku,
      price: Math.round(body.price),
      stock: body.stock ?? 0,
      lowStockAt: body.lowStockAt ?? 3,
      description: body.description || null,
      images: body.images ? [body.images] : [],
      categoryId: body.categoryId || null,
    },
  });

  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: body, error } = parseOrError(productUpdateSchema, await req.json());
  if (error) return error;

  const { id, ...rest } = body;
  const data: Record<string, unknown> = {};
  if (rest.name !== undefined) data.name = rest.name;
  if (rest.price !== undefined) data.price = Math.round(rest.price);
  if (rest.stock !== undefined) data.stock = rest.stock;
  if (rest.lowStockAt !== undefined) data.lowStockAt = rest.lowStockAt;
  if (rest.description !== undefined) data.description = rest.description;
  if (rest.categoryId !== undefined) data.categoryId = rest.categoryId || null;
  if (rest.images !== undefined) data.images = rest.images ? [rest.images] : [];

  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}
