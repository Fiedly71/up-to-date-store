import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialCreateSchema, testimonialModerationSchema, parseOrError } from "@/lib/validation";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(testimonialCreateSchema, await req.json());
  if (error) return error;

  const testimonial = await prisma.testimonial.create({
    data: {
      authorName: body.authorName,
      role: body.role || null,
      quote: body.quote,
      rating: body.rating ?? 5,
      approved: true,
    },
  });
  return NextResponse.json({ testimonial });
}

export async function PATCH(req: NextRequest) {
  const { data: body, error } = parseOrError(testimonialModerationSchema, await req.json());
  if (error) return error;

  const testimonial = await prisma.testimonial.update({
    where: { id: body.id },
    data: { approved: body.approved },
  });
  return NextResponse.json({ testimonial });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });

  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
