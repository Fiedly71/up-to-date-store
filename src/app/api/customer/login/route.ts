import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE_NAME,
} from "@/lib/customerAuth";
import { customerLoginSchema, parseOrError } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(customerLoginSchema, await req.json());
  if (error) return error;

  const customer = await prisma.customer.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!customer || !(await verifyPassword(body.password, customer.passwordHash))) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
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

  return NextResponse.json({ ok: true });
}
