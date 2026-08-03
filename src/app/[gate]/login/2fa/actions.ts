"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  verifyPending2FAToken,
  PENDING_2FA_COOKIE_NAME,
} from "@/lib/auth";
import { verifyTwoFactorCode } from "@/lib/twoFactor";
import { logAdminAction } from "@/lib/audit";

export async function verifyTwoFactorLogin(gate: string, formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();

  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(PENDING_2FA_COOKIE_NAME)?.value;
  const pending = pendingToken ? await verifyPending2FAToken(pendingToken) : null;

  if (!pending) {
    redirect(`/${gate}/login?error=invalid`);
  }

  const user = await prisma.user.findUnique({ where: { id: pending.userId } });
  if (!user || !user.twoFactorSecret || !(await verifyTwoFactorCode(user.twoFactorSecret, code))) {
    redirect(`/${gate}/login/2fa?error=invalid`);
  }

  cookieStore.delete(PENDING_2FA_COOKIE_NAME);

  const token = await createSessionToken({
    userId: user.id,
    role: user.role as "SUPER_ADMIN" | "CASHIER",
    name: user.name,
  });

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  await logAdminAction({ actorId: user.id, action: "auth.login_2fa" });

  redirect(`/${gate}/dashboard`);
}
