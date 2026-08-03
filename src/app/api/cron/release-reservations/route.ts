import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Filet de sécurité : le webhook "checkout.session.expired" restaure déjà le
// stock normalement, mais si Stripe ne le délivre jamais (souci réseau,
// webhook mal configuré...), ce cron rattrape les réservations qui ont
// dépassé leur délai depuis plus de 10 minutes.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 10 * 60 * 1000);

  const expiredOrders = await prisma.order.findMany({
    where: { status: "RESERVED", reservedUntil: { lt: cutoff } },
    include: { items: true },
  });

  for (const order of expiredOrders) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED", reservedUntil: null },
      }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      ),
    ]);
  }

  return NextResponse.json({ released: expiredOrders.length });
}
