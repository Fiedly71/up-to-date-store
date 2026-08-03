import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promoCreateSchema, promoModerationSchema, parseOrError } from "@/lib/validation";

export async function GET() {
  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ codes });
}

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(promoCreateSchema, await req.json());
  if (error) return error;

  const promo = await prisma.promoCode.create({
    data: {
      code: body.code.trim().toUpperCase(),
      discountType: body.discountType,
      discountValue:
        body.discountType === "PERCENT" ? body.discountValue : Math.round(body.discountValue * 100),
      usageLimit: body.usageLimit ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });
  return NextResponse.json({ promo });
}

export async function PATCH(req: NextRequest) {
  const { data: body, error } = parseOrError(promoModerationSchema, await req.json());
  if (error) return error;

  const promo = await prisma.promoCode.update({ where: { id: body.id }, data: { active: body.active } });
  return NextResponse.json({ promo });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });

  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
