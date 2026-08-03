import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendAbandonedCartEmail } from "@/lib/email";
import { captureError } from "@/lib/errorTracking";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const now = Date.now();
  const windowStart = new Date(now - 90 * 60 * 1000); // pas plus vieux que 90 min
  const windowEnd = new Date(now - 45 * 60 * 1000); // au moins 45 min

  const candidates = await prisma.order.findMany({
    where: {
      status: "RESERVED",
      customerEmail: { not: null },
      abandonedEmailSentAt: null,
      stripeSessionId: { not: null },
      createdAt: { gte: windowStart, lte: windowEnd },
    },
    include: { items: { include: { product: true } } },
  });

  let sent = 0;
  for (const order of candidates) {
    if (!order.stripeSessionId || !order.customerEmail) continue;

    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (session.status !== "open" || !session.url) continue;

      await sendAbandonedCartEmail({
        to: order.customerEmail,
        checkoutUrl: session.url,
        items: order.items.map((i) => ({ name: i.product?.name ?? "Produit", quantity: i.quantity })),
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { abandonedEmailSentAt: new Date() },
      });
      sent += 1;
    } catch (err) {
      // Session Stripe introuvable/expirée entre-temps : cas normal, on
      // passe simplement au suivant, la libération du stock est gérée
      // ailleurs. On journalise quand même au cas où ce serait autre chose.
      captureError(err, { orderId: order.id, cron: "abandoned-cart" });
      continue;
    }
  }

  return NextResponse.json({ sent });
}
