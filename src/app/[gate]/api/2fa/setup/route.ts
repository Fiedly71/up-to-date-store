import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { generateTwoFactorSecret, generateTwoFactorQrCode } from "@/lib/twoFactor";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const secret = generateTwoFactorSecret();
  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { twoFactorSecret: secret },
  });

  const qrCode = await generateTwoFactorQrCode(user.email, secret);

  return NextResponse.json({ qrCode, secret });
}
