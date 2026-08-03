import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { notifyOrderPaidWhatsApp } from "@/lib/notifications";
import { captureError } from "@/lib/errorTracking";
import { awardPointsForOrder } from "@/lib/loyalty";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature ?? "",
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Signature webhook invalide: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: { include: { product: true } } },
        });

        // Le stock a déjà été réservé (décrémenté) à la création du checkout —
        // on ne le décrémente donc pas une deuxième fois ici, on confirme juste.
        if (order && order.status === "RESERVED") {
          const amountPaid = session.amount_total ?? 0;
          const fullyPaid = amountPaid >= order.total;

          const customerEmail = session.customer_details?.email;

          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: fullyPaid ? "PAID" : "PARTIALLY_PAID",
              paymentMethod: "STRIPE_CARD",
              amountPaid,
              reservedUntil: null,
              customerEmail: customerEmail ?? undefined,
            },
          });

          if (order.paymentPlan === "INSTALLMENT_3") {
            const firstInstallment = await prisma.orderInstallment.findFirst({
              where: { orderId, index: 1 },
            });
            if (firstInstallment) {
              await prisma.orderInstallment.update({
                where: { id: firstInstallment.id },
                data: { paidAt: new Date() },
              });
            }
          }

          if (order.customerId) {
            await awardPointsForOrder(order.customerId, amountPaid, order.id);
          }

          if (customerEmail) {
            await sendOrderConfirmationEmail({
              to: customerEmail,
              orderId: order.id,
              total: order.total,
              items: order.items.map((i) => ({
                name: i.product?.name ?? "Produit",
                quantity: i.quantity,
                unitPrice: i.unitPrice,
              })),
            });
          }

          await notifyOrderPaidWhatsApp({
            orderId: order.id,
            total: order.total,
            customerPhone: session.customer_details?.phone ?? undefined,
          });
        }
      }
    }

    // Le paiement a expiré (délai de réservation dépassé) ou a été annulé :
    // on restaure le stock immédiatement plutôt que d'attendre le cron.
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) await releaseReservation(orderId);
    }
  } catch (err) {
    // On capture puis on renvoie 500 : Stripe réessaiera automatiquement
    // cet évènement plus tard, ce qui est le comportement souhaité si une
    // commande n'a pas pu être mise à jour correctement.
    captureError(err, { stripeEventType: event.type });
    return NextResponse.json({ error: "Erreur de traitement du webhook." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function releaseReservation(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status !== "RESERVED") return;

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "EXPIRED", reservedUntil: null } }),
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    ),
  ]);
}
