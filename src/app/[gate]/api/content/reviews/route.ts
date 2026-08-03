import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewModerationSchema, parseOrError } from "@/lib/validation";

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function PATCH(req: NextRequest) {
  const { data: body, error } = parseOrError(reviewModerationSchema, await req.json());
  if (error) return error;

  const review = await prisma.review.update({ where: { id: body.id }, data: { approved: body.approved } });
  return NextResponse.json({ review });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
