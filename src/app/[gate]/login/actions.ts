"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  verifyPassword,
  SESSION_COOKIE_NAME,
  createPending2FAToken,
  PENDING_2FA_COOKIE_NAME,
} from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

// Anti brute-force persisté en base (table LoginAttempt). Fonctionne
// correctement en environnement serverless (Vercel) où chaque requête peut
// tomber sur une instance différente — contrairement à un simple Map en
// mémoire, qui ne protège rien dans ce contexte.
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;

export async function login(gate: string, formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  const entry = await prisma.loginAttempt.findUnique({ where: { email } });
  if (entry?.blockedUntil && entry.blockedUntil > new Date()) {
    redirect(`/${gate}/login?error=blocked`);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    const count = (entry?.count ?? 0) + 1;
    await prisma.loginAttempt.upsert({
      where: { email },
      create: {
        email,
        count,
        blockedUntil: count >= MAX_ATTEMPTS ? new Date(Date.now() + BLOCK_MS) : null,
      },
      update: {
        count,
        blockedUntil: count >= MAX_ATTEMPTS ? new Date(Date.now() + BLOCK_MS) : null,
      },
    });
    redirect(`/${gate}/login?error=invalid`);
  }

  await prisma.loginAttempt.deleteMany({ where: { email } });

  const cookieStore = await cookies();

  // Compte protégé par 2FA : on ne crée pas encore la vraie session, on
  // passe par une étape de vérification du code TOTP.
  if (user.twoFactorEnabled) {
    const pendingToken = await createPending2FAToken(user.id);
    cookieStore.set(PENDING_2FA_COOKIE_NAME, pendingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 5,
    });
    redirect(`/${gate}/login/2fa`);
  }

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

  await logAdminAction({ actorId: user.id, action: "auth.login" });

  redirect(`/${gate}/dashboard`);
}
