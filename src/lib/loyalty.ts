import { prisma } from "@/lib/prisma";

// Taux du programme de fidélité — à ajuster ici si besoin, un seul endroit.
export const POINTS_PER_DOLLAR_SPENT = 10; // gagné à chaque achat payé
export const POINTS_TO_DOLLAR_RATE = 100; // 100 points = $1 de réduction
export const REFERRAL_BONUS_POINTS = 500; // offert au parrain ET au filleul

export async function awardPointsForOrder(customerId: string, orderTotalCents: number, orderId: string) {
  const points = Math.floor((orderTotalCents / 100) * POINTS_PER_DOLLAR_SPENT);
  if (points <= 0) return;

  await prisma.$transaction([
    prisma.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: { increment: points } },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        customerId,
        points,
        reason: `Achat #${orderId.slice(-8).toUpperCase()}`,
        orderId,
      },
    }),
  ]);
}

/** Convertit un nombre de points en réduction (cents), en vérifiant que le
 * client en a bien assez, et déduit le solde. Retourne 0 si invalide. */
export async function redeemPoints(customerId: string, pointsRequested: number) {
  if (pointsRequested <= 0) return 0;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || customer.loyaltyPoints < pointsRequested) return 0;

  const discountCents = Math.floor((pointsRequested / POINTS_TO_DOLLAR_RATE) * 100);

  await prisma.$transaction([
    prisma.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: { decrement: pointsRequested } },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        customerId,
        points: -pointsRequested,
        reason: "Réduction utilisée à la commande",
      },
    }),
  ]);

  return discountCents;
}
