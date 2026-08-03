import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { verifyTwoFactorCode } from "@/lib/twoFactor";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { code } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });

  if (!user?.twoFactorSecret || !(await verifyTwoFactorCode(user.twoFactorSecret, String(code ?? "")))) {
    return NextResponse.json({ error: "Code invalide." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.userId }, data: { twoFactorEnabled: true } });
  await logAdminAction({ actorId: session.userId, action: "auth.2fa_enabled" });

  return NextResponse.json({ ok: true });
}
