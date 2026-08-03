import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { posSaleSchema, parseOrError } from "@/lib/validation";
import { awardPointsForOrder } from "@/lib/loyalty";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: body, error } = parseOrError(posSaleSchema, await req.json());
  if (error) return error;

  const { items, customerName, customerEmail, customerPhone, paymentMethod, asProforma } = body;

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  // Si l'email du client au comptoir correspond à un compte existant, on
  // associe la vente à son historique et à ses points de fidélité —
  // pratique pour un client qui commande parfois en ligne, parfois en
  // boutique physique.
  const matchedCustomer = customerEmail
    ? await prisma.customer.findUnique({ where: { email: customerEmail.toLowerCase() } })
    : null;

  const order = await prisma.order.create({
    data: {
      channel: "POS",
      status: asProforma ? "PROFORMA" : "PAID",
      customerName,
      customerEmail,
      customerPhone,
      customerId: matchedCustomer?.id,
      paymentMethod: asProforma ? undefined : paymentMethod,
      total,
      cashierId: session.userId,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
    },
    include: { items: true },
  });

  // Une proforma ne déduit pas le stock — seulement la facture définitive.
  if (!asProforma) {
    await prisma.$transaction(
      items.map((i) =>
        prisma.product.update({
          where: { id: i.productId },
          data: { stock: { decrement: i.quantity } },
        })
      )
    );

    if (matchedCustomer) {
      await awardPointsForOrder(matchedCustomer.id, total, order.id);
    }
  }

  return NextResponse.json({ order });
}
