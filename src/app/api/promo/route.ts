import { NextRequest, NextResponse } from "next/server";
import { computeDiscount } from "@/lib/promo";
import { promoValidateSchema, parseOrError } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(promoValidateSchema, await req.json());
  if (error) return error;

  const result = await computeDiscount(body.code, body.subtotal);
  if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ discount: result.discount });
}
