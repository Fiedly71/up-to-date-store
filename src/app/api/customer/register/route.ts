import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  createCustomerSessionToken,
  generateReferralCode,
  CUSTOMER_SESSION_COOKIE_NAME,
} from "@/lib/customerAuth";
import { customerRegisterSchema, parseOrError } from "@/lib/validation";
import { REFERRAL_BONUS_POINTS } from "@/lib/loyalty";

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(customerRegisterSchema, await req.json());
  if (error) return error;

  // Honeypot anti-spam : réponse factice de succès sans rien créer.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const existing = await prisma.customer.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const passwordHash = await hashPassword(body.password);
  let referralCode = generateReferralCode(body.name);
  // S'assure que le code généré est unique (collision très improbable, mais on vérifie).
  while (await prisma.customer.findUnique({ where: { referralCode } })) {
    referralCode = generateReferralCode(body.name);
  }

  const referrer = body.referralCode
    ? await prisma.customer.findUnique({ where: { referralCode: body.referralCode.trim().toUpperCase() } })
    : null;

  const customer = await prisma.customer.create({
    data: {
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash,
      phone: body.phone || null,
      referralCode,
      loyaltyPoints: referrer ? REFERRAL_BONUS_POINTS : 0,
    },
  });

  if (referrer) {
    await prisma.$transaction([
      prisma.customer.update({
        where: { id: referrer.id },
        data: { loyaltyPoints: { increment: REFERRAL_BONUS_POINTS } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          customerId: referrer.id,
          points: REFERRAL_BONUS_POINTS,
          reason: `Parrainage de ${customer.name}`,
        },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          points: REFERRAL_BONUS_POINTS,
          reason: "Bonus de bienvenue (parrainage)",
        },
      }),
    ]);
  }

  const token = await createCustomerSessionToken({
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true, referralCode: customer.referralCode });
}
