import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const CUSTOMER_SESSION_COOKIE = "ut_customer_session";
const secret = () =>
  new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-only-change-me");

export type CustomerSessionPayload = {
  customerId: string;
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createCustomerSessionToken(payload: CustomerSessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyCustomerSessionToken(
  token: string
): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as CustomerSessionPayload;
  } catch {
    return null;
  }
}

export function generateReferralCode(name: string) {
  const base = name.split(" ")[0]?.toUpperCase().replace(/[^A-Z]/g, "") || "AMI";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}

export const CUSTOMER_SESSION_COOKIE_NAME = CUSTOMER_SESSION_COOKIE;
