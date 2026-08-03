import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "ut_session";
const PENDING_2FA_COOKIE = "ut_pending_2fa";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-only-change-me");

export type SessionPayload = {
  userId: string;
  role: "SUPER_ADMIN" | "CASHIER";
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const PENDING_2FA_COOKIE_NAME = PENDING_2FA_COOKIE;

// Jeton temporaire (5 min) émis une fois le mot de passe validé, pour un
// compte avec 2FA activée — le temps de saisir le code TOTP, avant de créer
// la vraie session.
export async function createPending2FAToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret());
}

export async function verifyPending2FAToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as { userId: string };
  } catch {
    return null;
  }
}
