import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyCustomerSessionToken, CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/customerAuth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyCustomerSessionToken(token) : null;
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
      loyaltyLedger: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!customer) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

  return NextResponse.json({
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      loyaltyPoints: customer.loyaltyPoints,
      referralCode: customer.referralCode,
      orders: customer.orders.map((o) => ({
        id: o.id,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({ name: i.product?.name ?? "Produit", quantity: i.quantity })),
      })),
      loyaltyLedger: customer.loyaltyLedger,
    },
  });
}
