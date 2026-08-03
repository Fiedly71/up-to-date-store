import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { computeDiscount } from "@/lib/promo";
import { getShippingZone } from "@/lib/shipping";
import { checkoutSchema, parseOrError } from "@/lib/validation";
import { captureError } from "@/lib/errorTracking";
import { verifyCustomerSessionToken, CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/customerAuth";
import { redeemPoints } from "@/lib/loyalty";

// 2h de réservation (au lieu de 30 min) : ça laisse la place à un email de
// relance panier abandonné (~45-60 min) avant la libération définitive du
// stock, plutôt que de forcer un choix entre anti-survente et relance.
const RESERVATION_MINUTES = 120;

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(checkoutSchema, await req.json());
  if (error) return error;

  const { items, paymentPlan, shippingZone, promoCode, email, usePoints } = body;
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const plan = paymentPlan === "DEPOSIT_50" || paymentPlan === "INSTALLMENT_3" ? paymentPlan : "FULL";
  const zone = getShippingZone(shippingZone ?? "");

  // Client connecté (optionnel) — permet d'associer la commande à son
  // historique et d'utiliser ses points de fidélité.
  const cookieStore = await cookies();
  const customerToken = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
  const customerSession = customerToken ? await verifyCustomerSessionToken(customerToken) : null;

  // Le code promo est revalidé côté serveur — ne jamais faire confiance au
  // montant de remise envoyé par le client.
  let discount = 0;
  if (promoCode) {
    const result = await computeDiscount(promoCode, subtotal);
    if (result.valid) discount = result.discount;
  }

  // Points de fidélité : uniquement si le client est connecté, revalidés
  // et déduits côté serveur (jamais fait confiance au client).
  let pointsDiscount = 0;
  if (usePoints && customerSession) {
    pointsDiscount = await redeemPoints(customerSession.customerId, usePoints);
    discount += pointsDiscount;
  }

  const total = Math.max(0, subtotal - discount) + zone.fee;

  const installmentAmounts: number[] = [];
  if (plan === "INSTALLMENT_3") {
    const base = Math.floor(total / 3);
    installmentAmounts.push(base, base, total - base * 2); // le dernier absorbe l'arrondi
  }

  const amountDueNow =
    plan === "DEPOSIT_50"
      ? Math.round(Math.max(0, subtotal - discount) / 2) + zone.fee
      : plan === "INSTALLMENT_3"
      ? installmentAmounts[0]
      : total;

  const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

  // On réserve le stock immédiatement (transaction atomique) pour éviter
  // la survente si deux clients achètent le dernier exemplaire en même
  // temps. Si le paiement échoue/expire, le stock est restauré (voir
  // webhook Stripe + /api/cron/release-reservations).
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour "${item.name}".`);
        }
      }

      const created = await tx.order.create({
        data: {
          channel: "ONLINE",
          status: "RESERVED",
          total,
          paymentPlan: plan,
          reservedUntil,
          customerEmail: email || null,
          customerId: customerSession?.customerId,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          },
        },
      });

      if (plan === "INSTALLMENT_3") {
        await tx.orderInstallment.createMany({
          data: installmentAmounts.map((amount, idx) => ({
            orderId: created.id,
            index: idx + 1,
            amount,
            dueDate: new Date(Date.now() + idx * 30 * 24 * 60 * 60 * 1000),
          })),
        });
      }

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stock insuffisant." },
      { status: 409 }
    );
  }

  let lineItems: Array<{
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string };
    };
    quantity: number;
  }>;
  let discounts: Array<{ coupon: string }> | undefined;

  if (plan === "DEPOSIT_50" || plan === "INSTALLMENT_3") {
    // Simplification volontaire : pour un acompte ou un paiement en 3 fois,
    // on facture un seul montant global plutôt que d'itemiser chaque
    // produit au prorata — plus simple et sans ambiguïté pour le client.
    const label =
      plan === "DEPOSIT_50"
        ? `Acompte 50% — commande #${order.id.slice(-8).toUpperCase()} (livraison incluse)`
        : `1ère mensualité sur 3 — commande #${order.id.slice(-8).toUpperCase()}`;

    lineItems = [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountDueNow,
          product_data: { name: label },
        },
        quantity: 1,
      },
    ];
  } else {
    lineItems = items.map((i) => ({
      price_data: {
        currency: "usd",
        unit_amount: i.unitPrice,
        product_data: {
          name: i.variantName ? `${i.name} — ${i.variantName}` : i.name,
        },
      },
      quantity: i.quantity,
    }));

    if (zone.fee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          unit_amount: zone.fee,
          product_data: { name: `Livraison — ${zone.label}` },
        },
        quantity: 1,
      });
    }

    if (discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discount,
        currency: "usd",
        duration: "once",
        name: promoCode ? `Réduction ${promoCode.toUpperCase()}` : "Réduction (points fidélité)",
      });
      discounts = [{ coupon: coupon.id }];
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      discounts,
      metadata: { orderId: order.id, paymentPlan: plan },
      expires_at: Math.floor(reservedUntil.getTime() / 1000),
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel?order=${order.id}`,
    });

    if (promoCode && discount - pointsDiscount > 0) {
      await prisma.promoCode.updateMany({
        where: { code: promoCode.trim().toUpperCase() },
        data: { usageCount: { increment: 1 } },
      });
    }

    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Le stock a déjà été réservé avant l'appel Stripe : si Stripe échoue
    // (panne, coupon invalide, etc.), on restaure immédiatement le stock et
    // on annule la commande plutôt que de la laisser bloquée en RESERVED.
    captureError(err, { orderId: order.id, step: "stripe_session_create" });

    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED", reservedUntil: null } }),
      ...items.map((i) =>
        prisma.product.update({
          where: { id: i.productId },
          data: { stock: { increment: i.quantity } },
        })
      ),
    ]);

    return NextResponse.json(
      { error: "Impossible de démarrer le paiement pour le moment. Réessaie dans un instant." },
      { status: 502 }
    );
  }
}
