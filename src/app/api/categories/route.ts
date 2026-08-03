import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category
    .findMany({ orderBy: { name: "asc" }, take: 6 })
    .catch(() => []);

  return NextResponse.json({ categories });
}
