import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  await prisma.user.update({
    where: { id: session.userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });
  await logAdminAction({ actorId: session.userId, action: "auth.2fa_disabled" });

  return NextResponse.json({ ok: true });
}
