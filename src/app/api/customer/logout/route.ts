import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/customerAuth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
