import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testimonials = await prisma.testimonial
    .findMany({ where: { approved: true }, orderBy: { createdAt: "desc" }, take: 6 })
    .catch(() => []);

  return NextResponse.json({ testimonials });
}
