import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { awardPointsForOrder } from "@/lib/loyalty";

async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

// Recherche une commande par les 8 derniers caractères de son id (ce que le
// client voit sur son reçu/email), uniquement parmi celles ayant un solde dû.
export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const shortId = req.nextUrl.searchParams.get("shortId")?.trim().toUpperCase();
  if (!shortId) return NextResponse.json({ error: "Numéro de commande requis." }, { status: 400 });

  const candidates = await prisma.order.findMany({
    where: { status: "PARTIALLY_PAID" },
    include: {
      items: { include: { product: true } },
      installments: { orderBy: { index: "asc" } },
    },
  });

  const order = candidates.find((o) => o.id.slice(-8).toUpperCase() === shortId);
  if (!order) {
    return NextResponse.json({ error: "Aucune commande avec solde dû trouvée." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      total: order.total,
      amountPaid: order.amountPaid,
      balanceDue: order.total - order.amountPaid,
      customerName: order.customerName,
      paymentPlan: order.paymentPlan,
      // Échéances impayées uniquement (le paiement en 3x se règle une
      // mensualité à la fois, pas tout le solde en un coup).
      pendingInstallments: order.installments
        .filter((i) => !i.paidAt)
        .map((i) => ({ id: i.id, index: i.index, amount: i.amount, dueDate: i.dueDate })),
      items: order.items.map((i) => ({ name: i.product?.name ?? "Produit", quantity: i.quantity })),
    },
  });
}

// Encaisse le solde restant (acompte simple) ou une mensualité spécifique
// (paiement en 3x) au comptoir (cash, Moncash, carte).
export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { orderId, paymentMethod, installmentId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId manquant." }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PARTIALLY_PAID") {
    return NextResponse.json({ error: "Commande introuvable ou déjà soldée." }, { status: 400 });
  }

  if (installmentId) {
    // Paiement en 3x : on règle une seule mensualité, pas tout le solde.
    const installment = await prisma.orderInstallment.findUnique({ where: { id: installmentId } });
    if (!installment || installment.orderId !== orderId || installment.paidAt) {
      return NextResponse.json({ error: "Mensualité introuvable ou déjà payée." }, { status: 400 });
    }

    const newAmountPaid = order.amountPaid + installment.amount;
    const stillPending = await prisma.orderInstallment.count({
      where: { orderId, paidAt: null, id: { not: installmentId } },
    });

    await prisma.$transaction([
      prisma.orderInstallment.update({ where: { id: installmentId }, data: { paidAt: new Date() } }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          amountPaid: newAmountPaid,
          status: stillPending > 0 ? "PARTIALLY_PAID" : "PAID",
          paymentMethod: paymentMethod ?? order.paymentMethod,
        },
      }),
    ]);

    if (order.customerId) {
      await awardPointsForOrder(order.customerId, installment.amount, order.id);
    }

    return NextResponse.json({ ok: true });
  }

  // Pas de mensualité précisée : on solde tout le reste d'un coup (cas de
  // l'acompte simple DEPOSIT_50).
  const remaining = order.total - order.amountPaid;
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      amountPaid: order.total,
      paymentMethod: paymentMethod ?? order.paymentMethod,
    },
  });

  if (order.customerId && remaining > 0) {
    await awardPointsForOrder(order.customerId, remaining, order.id);
  }

  return NextResponse.json({ order: updated });
}
